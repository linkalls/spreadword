import { db } from "../dbclient";
import { eq, desc, and, sql } from "drizzle-orm";
import { learningHistory, quizResults, userWords } from "../schema";
import { QuizStats } from "@/types/quiz";

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
        result: isCorrect ? 1 : 0,
      });

      // 現在の日付を取得（YYYY-MM-DD形式）
      const today = new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).split('/').join('-'); // 2025/03/15 → 2025-03-15

      // 既存のレコードを確認
      const existingRecord = await tx
        .select()
        .from(userWords)
        .where(
          and(
            eq(userWords.userId, userId),
            eq(userWords.wordId, wordId)
          )
        )
        .execute();

      if (existingRecord.length > 0) {
        // レコードが存在する場合は更新
        if (isCorrect) {
          // 正解の場合：mistakeCountを-1し、-3になったら完了に
          const currentMistakeCount = existingRecord[0].mistakeCount ?? 0;
          const newMistakeCount = currentMistakeCount - 1;
          
          await tx
            .update(userWords)
            .set({
              mistakeCount: newMistakeCount,
              complete: newMistakeCount <= -3 ? 1 : 0,
              // lastMistakeDateは今日の日付なら保持する
              // その日のうちは間違えた単語として記録し続ける
              lastMistakeDate: existingRecord[0].lastMistakeDate === today 
                ? today 
                : null
            })
            .where(
              and(
                eq(userWords.userId, userId),
                eq(userWords.wordId, wordId)
              )
            );
        } else {
          // 不正解の場合：mistakeCountを+1し、最後のミス日付を更新
          await tx
            .update(userWords)
            .set({
              mistakeCount: sql`COALESCE(${userWords.mistakeCount}, 0) + 1`,
              complete: 0,
              lastMistakeDate: today
            })
            .where(
              and(
                eq(userWords.userId, userId),
                eq(userWords.wordId, wordId)
              )
            );
        }
      } else {
        // レコードが存在しない場合は新規作成
        await tx
          .insert(userWords)
          .values({
            userId,
            wordId,
            complete: 0, // 初回は必ず未完了（連続3回正解で完了）
            mistakeCount: isCorrect ? -1 : 1, // 正解なら-1から、不正解なら1から
            lastMistakeDate: isCorrect ? null : today
          });
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
export async function getQuizStats(userId: string): Promise<QuizStats> {
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
    return {
      total: 0,
      correct: 0,
      accuracy: 0,
      recentResults: []
    };
  }
}
