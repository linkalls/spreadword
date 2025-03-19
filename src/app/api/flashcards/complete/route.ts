import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db/dbclient";
import { userWords } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const { wordId } = await request.json();
    if (!wordId) {
      return NextResponse.json(
        { error: "単語IDが必要です" },
        { status: 400 }
      );
    }

    // userWordsテーブルのレコードを更新または作成
    await db
      .insert(userWords)
      .values({
        userId: session.user.id,
        wordId: wordId,
        complete: 1,
      })
      .onConflictDoUpdate({
        target: [userWords.userId, userWords.wordId],
        set: { complete: 1 },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error completing flashcard:", error);
    return NextResponse.json(
      { error: "単語の完了状態の更新に失敗しました" },
      { status: 500 }
    );
  }
}
