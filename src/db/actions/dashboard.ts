import { db } from "../dbclient";
import { eq, desc, and, gte, lt, sql } from "drizzle-orm";
import { learningHistory, words, quizResults } from "../schema";
import { getUserWordProgress, type WordProgress } from "./word-progress";


/**
 * ユーザーの学習統計情報を取得する関数
 * @param userId ユーザーID
 */
export const getUserLearningStats = async (userId: string) => {
  try {
    // 単語の進捗状況を取得
    const userWordsData = await getUserWordProgress(userId);
    const totalWords = userWordsData.words.length;
    const completedWords = userWordsData.words.filter((w: WordProgress) => w.complete).length;

    // クイズの統計を取得
    const quizData = await db
      .select({
        id: quizResults.id,
        isCorrect: quizResults.isCorrect,
      })
      .from(quizResults)
      .where(eq(quizResults.userId, userId));

    // 最近の学習活動を取得（クイズと学習履歴の両方を含む）
    const recentActivity = await db
      .select({
        id: learningHistory.id,
        wordId: learningHistory.wordId,
        word: words.word,
        activityType: learningHistory.activityType,
        result: learningHistory.result,
        timestamp: learningHistory.timestamp,
      })
      .from(learningHistory)
      .leftJoin(words, eq(learningHistory.wordId, words.id))
      .where(eq(learningHistory.userId, userId))
      .orderBy(desc(learningHistory.timestamp))
      .limit(10);

    // 学習進捗率を計算
    const progressPercentage = totalWords > 0 
      ? (completedWords / totalWords) * 100 
      : 0;

    // クイズの正解率を計算（新しいquizResultsテーブルから）
    const totalQuizzes = quizData.length;
    const correctAnswers = quizData.filter(q => q.isCorrect).length;
    const quizAccuracy = totalQuizzes > 0 
      ? (correctAnswers / totalQuizzes) * 100 
      : 0;

    return {
      totalWords,
      completedWords,
      progressPercentage,
      quizAccuracy,
      recentActivity,
      quizStats: {
        totalQuizzes,
        correctAnswers,
      }
    };
  } catch (error) {
    console.error("Error getting user learning stats:", error);
    throw error;
  }
};

/**
 * ユーザーの日別学習統計を取得する関数
 * @param userId ユーザーID
 * @param days 取得する日数（デフォルト7日間）
 */
export const getDailyStats = async (userId: string, days: number = 7) => {
  try {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // 学習履歴とクイズ結果を取得
    const [activities, quizzes] = await Promise.all([
      db
        .select({
          timestamp: learningHistory.timestamp,
          activityType: learningHistory.activityType,
          result: learningHistory.result,
        })
        .from(learningHistory)
        .where(
          and(
            eq(learningHistory.userId, userId),
            gte(learningHistory.timestamp, startDate)
          )
        ),
      db
        .select({
          timestamp: quizResults.timestamp,
          isCorrect: quizResults.isCorrect,
        })
        .from(quizResults)
        .where(
          and(
            eq(quizResults.userId, userId),
            gte(quizResults.timestamp, startDate)
          )
        )
    ]);

    // 日付ごとの統計を計算
    const dailyStats = Array.from({ length: days }, (_, i) => {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayActivities = activities.filter(a => 
        new Date(a.timestamp).toDateString() === date.toDateString()
      );
      const dayQuizzes = quizzes.filter(q => 
        new Date(q.timestamp).toDateString() === date.toDateString()
      );

      return {
        date: date.toISOString().split("T")[0],
        totalActivities: dayActivities.length + dayQuizzes.length,
        quizCount: dayQuizzes.length,
        reviewCount: dayActivities.filter(a => a.activityType === "review").length,
        correctAnswers: dayQuizzes.filter(q => q.isCorrect).length,
      };
    });

    return dailyStats.reverse(); // 古い日付から新しい日付の順に並べる
  } catch (error) {
    console.error("Error getting daily stats:", error);
    throw error;
  }
};

/**
 * 指定された日付の間違えた単語リストを取得する関数
 * @param userId ユーザーID
 * @param date 日付（YYYY-MM-DD形式）
 */
export const getIncorrectWordsByDate = async (userId: string, date: string) => {
  try {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const incorrectWords = await db
      .select({
        english: words.word,
        japanese: words.meanings,
        timestamp: learningHistory.timestamp,
      })
      .from(learningHistory)
      .leftJoin(words, eq(learningHistory.wordId, words.id))
      .where(
        and(
          eq(learningHistory.userId, userId),
          eq(learningHistory.activityType, "quiz"),
          eq(learningHistory.result, sql`0`), // false = incorrect
          gte(learningHistory.timestamp, sql`${startDate.getTime()}`),
          lt(learningHistory.timestamp, sql`${endDate.getTime()}`)
        )
      )
      .orderBy(desc(learningHistory.timestamp));

    // null値の除外と型の変換
    return incorrectWords
      .filter((word): word is { english: string; japanese: string; timestamp: Date } => 
        word.english !== null && word.japanese !== null
      )
      .map(word => ({
        english: word.english,
        japanese: word.japanese,
        timestamp: word.timestamp
      }));
  } catch (error) {
    console.error("Error getting incorrect words by date:", error);
    throw error;
  }
};
