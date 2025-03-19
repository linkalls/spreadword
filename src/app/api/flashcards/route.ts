import { auth } from "@/auth";
import { db } from "@/db/dbclient";
import { userWords, words } from "@/db/schema";
import { and, eq, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // 単語データの取得
    const resultWords = await db
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
      .where(or(sql`${userWords.complete} IS NULL`, eq(userWords.complete, 0)))
      .limit(40); // シャッフル用に多めに取得

    // 結果の検証
    if (!resultWords || resultWords.length === 0) {
      return NextResponse.json({
        words: [],
        total: 0
      });
    }

    // メモリ上でシャッフルして20件を選択
    const shuffledWords = [...resultWords]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(20, resultWords.length))
      .map(word => ({
        id: word.id,
        word: word.word,
        meanings: word.meanings,
        part_of_speech: word.part_of_speech,
        ex: word.ex
      }));

    // 総数のカウント（単一クエリとして実行）
    const countResult = await db
      .select({
        count: sql<number>`count(distinct ${words.id})`
      })
      .from(words)
      .leftJoin(
        userWords,
        and(
          eq(userWords.wordId, words.id),
          eq(userWords.userId, session.user.id)
        )
      )
      .where(or(sql`${userWords.complete} IS NULL`, eq(userWords.complete, 0)))
      .then(result => result[0]?.count ?? 0);

    return NextResponse.json({
      words: shuffledWords,
      total: countResult
    });

  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return NextResponse.json(
      { error: "フラッシュカードの取得に失敗しました" },
      { status: 500 }
    );
  }
}
