import { auth } from "@/auth";
import { db } from "@/db/dbclient";
import { userSubmittedWords, words, userRoles, UserRoleEnum } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

// 承認/却下のリクエストボディのバリデーション
const actionSchema = z.object({
  id: z.number(),
  action: z.enum(["approve", "reject"]),
  feedback: z.string().optional(),
});

// 管理者権限チェック
async function isAdmin(userId: string) {
  const userRole = await db
    .select()
    .from(userRoles)
    .where(eq(userRoles.userId, userId))
    .get();

  return userRole?.role === UserRoleEnum.ADMIN;
}

// 管理者向けの投稿一覧取得
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query = db
      .select()
      .from(userSubmittedWords)
      .where(
        status
          ? eq(userSubmittedWords.status, status as "pending" | "approved" | "rejected")
          : undefined
      )
      .orderBy(desc(userSubmittedWords.submitted_at));

    const submissions = await query;

    // const submissions = await query;
    return NextResponse.json(submissions);
  } catch (error) {
    console.error("投稿一覧取得エラー:", error);
    return NextResponse.json(
      { message: "投稿一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// 承認/却下の処理
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { id, action, feedback } = actionSchema.parse(body);

    // 対象の投稿を取得
    const submission = await db
      .select()
      .from(userSubmittedWords)
      .where(eq(userSubmittedWords.id, id))
      .get();

    if (!submission) {
      return NextResponse.json(
        { message: "指定された投稿が見つかりません" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      // 承認時はwordsテーブルに追加
      await db.transaction(async (tx) => {
        // wordsテーブルに追加
        await tx.insert(words).values({
          word: submission.word,
          meanings: submission.meanings,
          part_of_speech: submission.part_of_speech ?? "",
          choices: submission.choices ?? "", // 管理者が後で設定
          ex: submission.ex ?? "",
        });

        // 投稿のステータスを更新
        await tx
          .update(userSubmittedWords)
          .set({
            status: "approved",
            approved_at: new Date(),
            admin_feedback: feedback,
          })
          .where(eq(userSubmittedWords.id, id));
      });

      return NextResponse.json({ message: "単語を承認しました" });
    } else {
      // 却下時は投稿のステータスのみ更新
      await db
        .update(userSubmittedWords)
        .set({
          status: "rejected",
          admin_feedback: feedback,
        })
        .where(eq(userSubmittedWords.id, id));

      return NextResponse.json({ message: "単語を却下しました" });
    }
  } catch (error) {
    console.error("承認/却下処理エラー:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "入力内容が正しくありません", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "処理に失敗しました" },
      { status: 500 }
    );
  }
}