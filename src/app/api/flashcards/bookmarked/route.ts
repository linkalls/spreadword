import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db/dbclient";
import { words, userWords } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // ブックマークされた単語を取得
    const bookmarkedWords = await db
      .select({
        id: words.id,
        word: words.word,
        meanings: words.meanings,
        part_of_speech: words.part_of_speech,
        notes: userWords.notes,
        mistakeCount: userWords.mistakeCount,
      })
      .from(words)
      .innerJoin(
        userWords,
        and(
          eq(userWords.wordId, words.id),
          eq(userWords.userId, session.user.id),
          eq(userWords.bookmarked, 1)
        )
      )
      .orderBy(words.word);

    return NextResponse.json(bookmarkedWords);
  } catch (error) {
    console.error("Error fetching bookmarked words:", error);
    return NextResponse.json(
      { error: "ブックマークした単語の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const { wordId, bookmarked, notes } = await req.json();
    
    // user_wordsテーブルを更新または作成
    await db
      .insert(userWords)
      .values({
        userId: session.user.id,
        wordId,
        bookmarked: bookmarked ? 1 : 0,
        notes,
        mistakeCount: 0,
      })
      .onConflictDoUpdate({
        target: [userWords.userId, userWords.wordId],
        set: {
          bookmarked: bookmarked ? 1 : 0,
          notes,
        },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating bookmark:", error);
    return NextResponse.json(
      { error: "ブックマークの更新に失敗しました" },
      { status: 500 }
    );
  }
}
