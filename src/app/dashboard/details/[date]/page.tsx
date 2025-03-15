import { auth } from "@/auth";
import { MistakeWordsStory } from "@/components/dashboard/mistake-words-story";
import { db } from "@/db/dbclient";
import { userWords as userWordsTable, words as wordsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

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
    redirect("/auth/signin");
  }

  try {
    const { date } = await params;
    // 日付の処理（日本時間を考慮）
    const [year, month, day] = date.split("-").map(Number);
    if (!year || !month || !day) {
      throw new Error("Invalid date format");
    }

    /**
     * 日付の処理
     * - jstDate: 表示用の日本時間の日付オブジェクト
     * - dateString: データベースクエリ用のYYYY-MM-DD形式の日付文字列
     * 
     * データベースにはYYYY-MM-DD形式で日付が保存されているため、
     * 同じ形式の文字列で比較
     */
    const jstDate = new Date(year, month - 1, day);
    // YYYY-MM-DD形式の日付文字列を作成
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;


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
          eq(userWordsTable.userId, session.user.id!), //* emailじゃないよ！！！！
          eq(userWordsTable.lastMistakeDate, dateString)
        )
      )
      .groupBy(wordsTable.word, wordsTable.meanings)
      .execute();

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {jstDate.toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          の学習記録
        </h1>
        <MistakeWordsStory words={mistakeWords} />
      </div>
    );
  } catch (error) {
    console.error("Error processing daily details:", error);
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
