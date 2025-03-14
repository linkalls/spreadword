import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db/dbclient';
import { and, eq, sql } from 'drizzle-orm';
import { words as wordsTable, userWords as userWordsTable } from '@/db/schema';
import { MistakeWordsStory } from '@/components/dashboard/mistake-words-story';

/**
 * 指定された日付の間違えた単語一覧と、
 * それらの単語を使用したストーリー生成機能を提供するページ
 */
export default async function DailyDetailsPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  const { date } = await params;
  // パラメータの日付をYYYY-MM-DD形式に変換
  const targetDate = new Date(date);
  const formattedDate = targetDate.toISOString().split('T')[0];

  // その日に間違えた単語のリストを取得
  const mistakeWords = await db
    .select({
      word: wordsTable.word,
      meanings: wordsTable.meanings,
      mistakeCount: userWordsTable.mistakeCount,
    })
    .from(userWordsTable)
    .innerJoin(wordsTable, eq(userWordsTable.wordId, wordsTable.id))
    .where(
      and(
        eq(userWordsTable.userId, session.user.email),
        sql`DATE(${userWordsTable.lastMistakeDate} / 1000, 'unixepoch') = ${formattedDate}`
      )
    )
    .groupBy(wordsTable.word, wordsTable.meanings)
    .execute();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {new Date(date).toLocaleDateString()} の学習記録
      </h1>
      <MistakeWordsStory words={mistakeWords} />
    </div>
  );
}
