import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db/dbclient";
import { words, userWords } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }
    const {id} = await params;
    const wordId = parseInt(id);
    if (isNaN(wordId)) {
      return NextResponse.json(
        { error: "不正なIDです" },
        { status: 400 }
      );
    }

    // 単語とユーザーの学習状態を取得
    const result = await db
      .select({
        id: words.id,
        word: words.word,
        meanings: words.meanings,
        part_of_speech: words.part_of_speech,
        ex: words.ex,
        notes: userWords.notes,
        bookmarked: userWords.bookmarked,
      })
      .from(words)
      .leftJoin(
        userWords,
        and(
          eq(userWords.wordId, words.id),
          eq(userWords.userId, session.user.id)
        )
      )
      .where(eq(words.id, wordId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "単語が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching flashcard:", error);
    return NextResponse.json(
      { error: "フラッシュカードの取得に失敗しました" },
      { status: 500 }
    );
  }
}
