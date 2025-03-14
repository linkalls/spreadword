import { db } from "../dbclient";
import { eq, desc, and } from "drizzle-orm";
import { learningHistory, quizResults, userWords } from "../schema";

/**
 * クイズの結果を保存し、学習履歴を更新する
 */
export async function saveQuizProgress(
  userId: string,
  wordId: number,
  selectedChoice: string,
  isCorrect: boolean
) {
  try {
    // トランザクションを開始
    await db.transaction(async (tx) => {
      // クイズ結果を保存
      await tx.insert(quizResults).values({
        userId,
        wordId,
        selectedChoice,
        isCorrect,
      });

      // 学習履歴を更新
      await tx.insert(learningHistory).values({
        userId,
        wordId,
        activityType: 'quiz',
        result: isCorrect,
      });

      // 学習進捗の更新
      // クイズに正解した場合、その単語を完了状態にする
      if (isCorrect) {
        await tx
          .update(userWords)
          .set({ complete: true })
          .where(
            and(
              eq(userWords.userId, userId),
              eq(userWords.wordId, wordId)
            )
          );
      }
    });

    return true;
  } catch (error) {
    console.error('Failed to save quiz progress:', error);
    return false;
  }
}

/**
 * ユーザーのクイズ統計情報を取得
 */
export async function getQuizStats(userId: string) {
  try {
    const results = await db
      .select({
        id: quizResults.id,
        wordId: quizResults.wordId,
        isCorrect: quizResults.isCorrect,
        timestamp: quizResults.timestamp,
      })
      .from(quizResults)
      .where(eq(quizResults.userId, userId))
      .orderBy(desc(quizResults.timestamp));

    const total = results.length;
    const correct = results.filter(r => r.isCorrect).length;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    return {
      total,
      correct,
      accuracy,
      recentResults: results.slice(0, 10), // 最新10件
    };
  } catch (error) {
    console.error('Failed to get quiz stats:', error);
    return null;
  }
}
