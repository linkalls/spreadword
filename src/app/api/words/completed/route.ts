import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db/dbclient";
import { words, userWords } from "@/db/schema";
import { and, eq, or, sql } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // 完了済みの単語を取得（completeが1、またはmistakeCountが-3以下）
    const completedWords = await db
      .select({
        id: words.id,
        word: words.word,
        meanings: words.meanings,
        part_of_speech: words.part_of_speech,
        bookmarked: userWords.bookmarked,
        notes: userWords.notes,
        mistakeCount: userWords.mistakeCount,
        complete: userWords.complete,
      })
      .from(words)
      .innerJoin(
        userWords,
        and(
          eq(userWords.wordId, words.id),
          eq(userWords.userId, session.user.id),
          or(
            eq(userWords.complete, 1),
            sql`${userWords.mistakeCount} <= -3`
          )
        )
      )
      .orderBy(words.word);

    return NextResponse.json(completedWords);
  } catch (error) {
    console.error("Error fetching completed words:", error);
    return NextResponse.json(
      { error: "完了済み単語の取得に失敗しました" },
      { status: 500 }
    );
  }
}
