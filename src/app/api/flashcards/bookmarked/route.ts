import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db/dbclient";
import { words, userWords } from "@/db/schema";
import { and, eq, isNotNull } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // ノートがある単語を取得
    const bookmarkedWords = await db
      .select({
        id: words.id,
        word: words.word,
        meanings: words.meanings,
        part_of_speech: words.part_of_speech,
        notes: userWords.notes,
      })
      .from(words)
      .innerJoin(
        userWords,
        and(
          eq(userWords.wordId, words.id),
          eq(userWords.userId, session.user.id),
          isNotNull(userWords.notes)
        )
      );

    return NextResponse.json(bookmarkedWords);
  } catch (error) {
    console.error("Error fetching bookmarked flashcards:", error);
    return NextResponse.json(
      { error: "ノートがある単語の取得に失敗しました" },
      { status: 500 }
    );
  }
}
