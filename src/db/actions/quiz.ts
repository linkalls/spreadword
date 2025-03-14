import { eq } from "drizzle-orm";
import { db } from "../dbclient";
import { learningHistory, quizResults, words } from "../schema";

/**
 * ランダムな単語を取得する関数
 * @param count 取得する単語数
 * @returns ランダムな単語の配列
 */
export const getRandomWords = async (count: number = 4) => {
  try {
    // SQLiteではRAND()が使えないため、順序をランダムにする方法を使用
    const result = await db.select().from(words).$dynamic();
    // JavaScriptでシャッフル
    const shuffled = result.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  } catch (error) {
    console.error("Error getting random words:", error);
    throw error;
  }
};

/**
 * クイズ結果を保存する関数
 * @param userId ユーザーID
 * @param wordId 単語ID
 * @param selectedChoice 選択された答え
 * @param isCorrect 正解かどうか
 */
export const saveQuizResult = async (
  userId: string,
  wordId: number,
  selectedChoice: string,
  isCorrect: boolean
) => {
  try {
    // クイズ結果の保存
    await db.insert(quizResults).values({
      userId,
      wordId,
      selectedChoice,
      isCorrect,
    });

    // 学習履歴の保存
    await db.insert(learningHistory).values({
      userId,
      wordId,
      activityType: "quiz",
      result: isCorrect,
    });
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw error;
  }
};

/**
 * ユーザーのクイズ統計を取得する関数
 * @param userId ユーザーID
 */
export const getUserQuizStats = async (userId: string) => {
  try {
    const results = await db
      .select({
        total: quizResults,
        correct: quizResults,
      })
      .from(quizResults)
      .where(eq(quizResults.userId, userId));

    // 統計情報の計算
    const totalQuizzes = results.length;
    const correctAnswers = results.filter((r) => r.correct.isCorrect).length;
    const accuracy =
      totalQuizzes > 0 ? (correctAnswers / totalQuizzes) * 100 : 0;

    return {
      totalQuizzes,
      correctAnswers,
      accuracy,
    };
  } catch (error) {
    console.error("Error getting user quiz stats:", error);
    throw error;
  }
};
