import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db/dbclient";
import { words, userWords } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // ユーザーがまだ完了していない単語を取得
    const uncompletedWords = await db
      .select({
        id: words.id,
        word: words.word,
        meanings: words.meanings,
        part_of_speech: words.part_of_speech,
        ex: words.ex,
      })
      .from(words)
      .leftJoin(
        userWords,
        and(
          eq(userWords.wordId, words.id),
          eq(userWords.userId, session.user.id)
        )
      )
      .where(
        sql`${userWords.complete} IS NULL OR ${userWords.complete} = false`
      )
      .orderBy(sql`RANDOM()`)
      .limit(20); // 一度に20単語まで

    return NextResponse.json(uncompletedWords);
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return NextResponse.json(
      { error: "フラッシュカードの取得に失敗しました" },
      { status: 500 }
    );
  }
}
