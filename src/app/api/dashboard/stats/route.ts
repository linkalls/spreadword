import { db } from "@/db/dbclient";
import { and, eq, sql } from "drizzle-orm";
import { quizResults, userWords, words } from "@/db/schema";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // デバッグ用：まずブックマークされた単語の総数を確認
    const bookmarkedCount = await db
      .select({
        count: sql`count(*)`.as('count')
      })
      .from(userWords)
      .where(
        and(
          eq(userWords.userId, userId),
          eq(userWords.bookmarked, 1)
        )
      );
    
    console.log('DEBUG: Total bookmarked words:', bookmarkedCount[0]?.count);

    // サブクエリを使用して効率的にデータを取得
    const [bookmarkedWordsData, completedWordsData, quizStatsData] = await Promise.all([
      // ブックマークした単語（最新の5件）
      db
        .select({
          id: words.id,
          word: words.word,
          meanings: words.meanings,
          part_of_speech: words.part_of_speech,
          notes: userWords.notes,
          mistakeCount: userWords.mistakeCount,
          complete: userWords.complete,
          bookmarked: userWords.bookmarked,
        })
        .from(userWords)
        .leftJoin(words, eq(userWords.wordId, words.id))
        .where(
          and(
            eq(userWords.userId, userId),
            eq(userWords.bookmarked, 1)
          )
        )
        .orderBy(sql`COALESCE(${userWords.lastMistakeDate}, '')`)
        .limit(5),

      // 習得済みの単語（最新5件）
      db
        .select({
          id: words.id,
          word: words.word,
          meanings: words.meanings,
          part_of_speech: words.part_of_speech,
          notes: userWords.notes,
          mistakeCount: userWords.mistakeCount,
          bookmarked: userWords.bookmarked,
        })
        .from(userWords)
        .leftJoin(words, eq(userWords.wordId, words.id))
        .where(
          and(
            eq(userWords.userId, userId),
            eq(userWords.complete, 1)
          )
        )
        .orderBy(sql`COALESCE(${userWords.lastMistakeDate}, '') DESC`)
        .limit(5),

      // クイズの統計
      db
        .select({
          total: sql`count(*)`.as('total'),
          correct: sql`sum(case when ${quizResults.isCorrect} = 1 then 1 else 0 end)`.as('correct'),
        })
        .from(quizResults)
        .where(eq(quizResults.userId, userId))
    ]);

    console.log('DEBUG: Bookmarked Words Query Result:', JSON.stringify(bookmarkedWordsData, null, 2));
    console.log('DEBUG: Completed Words Query Result:', JSON.stringify(completedWordsData, null, 2));
    console.log('DEBUG: Quiz Stats:', quizStatsData);

    const quizStats = {
      total: Number(quizStatsData[0]?.total || 0),
      correct: Number(quizStatsData[0]?.correct || 0),
      accuracy: quizStatsData[0]?.total ? 
        (Number(quizStatsData[0]?.correct) / Number(quizStatsData[0]?.total) * 100) : 0
    };

    return NextResponse.json({
      bookmarkedWords: bookmarkedWordsData,
      bookmarkedTotal: Number(bookmarkedCount[0]?.count || 0),
      completedWords: completedWordsData,
      quizStats
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
