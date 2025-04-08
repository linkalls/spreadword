import { auth } from "@/auth";
import { db } from "@/db/dbclient";
import { userSubmittedWords, words } from "@/db/schema";
import { eq, desc,and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

// リクエストボディのバリデーションスキーマ
const submitWordSchema = z.object({
  word: z.string().min(1, "単語は必須です"),
  meanings: z.string().min(1, "意味は必須です"),
  part_of_speech: z.string().optional(),
  ex: z.string().optional(),
  choices: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    // セッションの取得と認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // リクエストボディの取得とバリデーション
    const body = await request.json();
    const validatedData = submitWordSchema.parse(body);

    // 既存の単語をチェック
    const existingWord = await db
      .select()
      .from(words)
      .where(eq(words.word, validatedData.word))
      .get();

    if (existingWord) {
      return NextResponse.json(
        { message: "この単語は既に登録されています" },
        { status: 400 }
      );
    }

    // 投稿済みの単語をチェック
    const existingSubmission = await db
      .select()
      .from(userSubmittedWords)
      .where(eq(userSubmittedWords.word, validatedData.word))
      .get();

    if (existingSubmission) {
      return NextResponse.json(
        { message: "この単語は既に投稿されています" },
        { status: 400 }
      );
    }

    // 単語の投稿
    const result = await db
      .insert(userSubmittedWords)
      .values({
        word: validatedData.word,
        meanings: validatedData.meanings,
        part_of_speech: validatedData.part_of_speech ?? "",
        ex: validatedData.ex ?? "",
        choices: Array.isArray(validatedData.choices) ? JSON.stringify(validatedData.choices) : "",
        submitted_by: session.user.id,
        status: "pending",
      })
      .returning({ id: userSubmittedWords.id });

    return NextResponse.json({
      message: "単語を投稿しました。承認までしばらくお待ちください。",
      id: result[0].id,
    });
  } catch (error) {
    console.error("単語投稿エラー:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "入力内容が正しくありません", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "単語の投稿に失敗しました" },
      { status: 500 }
    );
  }
}

// ユーザーの投稿履歴を取得
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // オプションのステータスフィルター

    let query = db
      .select()
      .from(userSubmittedWords)
      .where(eq(userSubmittedWords.submitted_by, session.user.id));

    if (status) {
      query = db
        .select()
        .from(userSubmittedWords)
        .where(
          and(
            eq(userSubmittedWords.submitted_by, session.user.id),
            eq(userSubmittedWords.status, status as "pending" | "approved" | "rejected")
          )
        );
    }

    const submissions = await query.orderBy(desc(userSubmittedWords.submitted_at));
    return NextResponse.json(submissions);
  } catch (error) {
    console.error("投稿履歴取得エラー:", error);
    return NextResponse.json(
      { message: "投稿履歴の取得に失敗しました" },
      { status: 500 }
    );
  }
}
