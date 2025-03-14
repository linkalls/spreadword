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

    const { wordId, note } = await request.json();
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
        notes: note,
      })
      .onConflictDoUpdate({
        target: [userWords.userId, userWords.wordId],
        set: { notes: note },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json(
      { error: "ノートの保存に失敗しました" },
      { status: 500 }
    );
  }
}
