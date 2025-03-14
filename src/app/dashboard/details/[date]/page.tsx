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

  try {
    const {date } = await params;
    // 日付の処理（日本時間を考慮）
    const [year, month, day] = date.split('-').map(Number);
    if (!year || !month || !day) {
      throw new Error('Invalid date format');
    }

    // 日本時間で日付を作成
    const jstDate = new Date(year, month - 1, day);
    jstDate.setHours(0, 0, 0, 0);
    
    // UTC時間に変換（日本時間の0時 = UTC前日の15時）
    const utcDate = new Date(jstDate.getTime() - 9 * 60 * 60 * 1000);
    const nextUtcDate = new Date(utcDate.getTime() + 24 * 60 * 60 * 1000);

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
          sql`${userWordsTable.lastMistakeDate} >= ${utcDate.getTime()}`,
          sql`${userWordsTable.lastMistakeDate} < ${nextUtcDate.getTime()}`
        )
      )
      .groupBy(wordsTable.word, wordsTable.meanings)
      .execute();

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {jstDate.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} の学習記録
        </h1>
        <MistakeWordsStory words={mistakeWords} />
      </div>
    );
  } catch (error) {
    console.error('Error processing daily details:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">エラーが発生しました</h1>
        <p className="text-red-500">
          申し訳ありません。データの取得中にエラーが発生しました。
        </p>
      </div>
    );
  }
}
