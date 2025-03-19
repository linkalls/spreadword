import { auth } from "@/auth";
import { userWords } from "@/db/schema";
import { and, desc, eq, gte, lt, or, sql } from "drizzle-orm";
import { db } from "../dbclient";
import { learningHistory, quizResults, words } from "../schema";
import { getSystemStats } from "./system-stats";

/**
 * ユーザーの学習統計情報を取得する関数
 * @param userId ユーザーID
 */
export const getUserLearningStats = async (userId: string) => {
  try {
    const session = await auth();

    // システム統計から総単語数を取得
    const { totalWords } = await getSystemStats();

    // 完了済みの単語を取得（completeが1、またはmistakeCountが-3以下）
    const completedWords = await db
      .select({
        id: words.id,
        word: words.word,
        meanings: words.meanings,
        part_of_speech: words.part_of_speech,
        bookmarked: userWords.bookmarked,
        notes: userWords.notes,
        mistakeCount: userWords.mistakeCount,
        complete: userWords.complete,
      })
      .from(words)
      .innerJoin(
        userWords,
        and(
          eq(userWords.wordId, words.id),
          eq(userWords.userId, session!.user!.id!),
          or(eq(userWords.complete, 1), sql`${userWords.mistakeCount} <= -3`)
        )
      )
      .orderBy(words.word);

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
    const progressPercentage =
      totalWords > 0 ? (completedWords.length / totalWords) * 100 : 0;

    // クイズの正解率を計算（新しいquizResultsテーブルから）
    const totalQuizzes = quizData.length;
    const correctAnswers = quizData.filter((q) => q.isCorrect).length;
    const quizAccuracy =
      totalQuizzes > 0 ? (correctAnswers / totalQuizzes) * 100 : 0;

    return {
      totalWords,
      completedWords: completedWords.length,
      progressPercentage,
      quizAccuracy,
      recentActivity,
      quizStats: {
        totalQuizzes,
        correctAnswers,
      },
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
        ),
    ]);

    // 日付ごとの統計を計算
    const dailyStats = Array.from({ length: days }, (_, i) => {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayActivities = activities.filter(
        (a) => new Date(a.timestamp).toDateString() === date.toDateString()
      );
      const dayQuizzes = quizzes.filter(
        (q) => new Date(q.timestamp).toDateString() === date.toDateString()
      );

      return {
        date: date.toISOString().split("T")[0],
        totalActivities: dayActivities.length + dayQuizzes.length,
        quizCount: dayQuizzes.length,
        reviewCount: dayActivities.filter((a) => a.activityType === "review")
          .length,
        correctAnswers: dayQuizzes.filter((q) => q.isCorrect).length,
      };
    });

    return dailyStats; 
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
      .from(userWords)
      .innerJoin(words, eq(userWords.wordId, words.id))
      .leftJoin(
        learningHistory,
        and(
          eq(learningHistory.wordId, words.id),
          eq(learningHistory.userId, userId),
          eq(learningHistory.activityType, "quiz"),
          eq(learningHistory.result, sql`0`), // false = incorrect
          gte(learningHistory.timestamp, sql`${startDate.getTime()}`),
          lt(learningHistory.timestamp, sql`${endDate.getTime()}`)
        )
      )
      .where(
        and(eq(userWords.userId, userId), eq(userWords.lastMistakeDate, date))
      )
      .orderBy(desc(learningHistory.timestamp));

    // null値の除外と型の変換
    const filteredWords = incorrectWords.filter(
      (word): word is { english: string; japanese: string; timestamp: Date } =>
        word.english !== null && word.japanese !== null
    );

    // 結果が空の場合は、lastMistakeDateに基づいて取得
    if (filteredWords.length === 0) {
      const fallbackWords = await db
        .select({
          english: words.word,
          japanese: words.meanings,
          timestamp: sql<Date>`CURRENT_TIMESTAMP`,
        })
        .from(userWords)
        .innerJoin(words, eq(userWords.wordId, words.id))
        .where(
          and(eq(userWords.userId, userId), eq(userWords.lastMistakeDate, date))
        );

      return fallbackWords.map((word) => ({
        english: word.english,
        japanese: word.japanese,
        timestamp: word.timestamp,
      }));
    }

    return filteredWords.map((word) => ({
      english: word.english,
      japanese: word.japanese,
      timestamp: word.timestamp,
    }));
  } catch (error) {
    console.error("Error getting incorrect words by date:", error);
    throw error;
  }
};
