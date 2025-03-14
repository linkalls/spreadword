import { db } from "../dbclient";
import { userWords, words, type Word } from "../schema";
import { eq, and } from "drizzle-orm";

/**
 * WordProgressの型定義
 * 単語の基本情報と完了状態を含む
 */
export type WordProgress = Word & {
  complete: boolean;
};

/**
 * 特定のユーザーの単語進捗情報を更新する
 * @param userId ユーザーID
 * @param wordId 単語ID
 * @param complete 完了状態
 * @returns 更新が成功したかどうか
 */
export async function updateWordProgress(
  userId: string,
  wordId: number,
  complete: boolean
): Promise<boolean> {
  try {
    // 既存のレコードを確認
    const existing = await db
      .select()
      .from(userWords)
      .where(
        and(
          eq(userWords.userId, userId),
          eq(userWords.wordId, wordId)
        )
      );

    if (existing.length === 0) {
      // レコードが存在しない場合は新規作成
      await db.insert(userWords).values({
        userId,
        wordId,
        complete,
      });
    } else {
      // レコードが存在する場合は更新
      await db
        .update(userWords)
        .set({ complete })
        .where(
          and(
            eq(userWords.userId, userId),
            eq(userWords.wordId, wordId)
          )
        );
    }
    return true;
  } catch (error) {
    console.error("Failed to update word progress:", error);
    return false;
  }
}

/**
 * ユーザーの全単語の進捗情報を取得
 * @param userId ユーザーID
 * @returns 単語と進捗情報の配列
 */
export async function getUserWordProgress(
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{
  words: WordProgress[];
  totalPages: number;
  currentPage: number;
}> {
  try {
    // まずすべての単語の総数を取得
    const totalCount = await db.select().from(words).then(res => res.length);
    
    // ページネーションの計算
    const totalPages = Math.ceil(totalCount / pageSize);
    const offset = (page - 1) * pageSize;
    
    // 指定されたページの単語を取得
    const allWords: Word[] = await db
      .select()
      .from(words)
      .limit(pageSize)
      .offset(offset);
    
    // ユーザーの進捗情報を取得
    const progress = await db
      .select()
      .from(userWords)
      .where(eq(userWords.userId, userId));

    // 進捗情報をMapに変換して検索を効率化
    const progressMap = new Map(
      progress.map(p => [p.wordId, p.complete])
    );

    // 単語と進捗情報を結合
    const wordProgress: WordProgress[] = allWords.map(word => ({
      ...word,
      complete: progressMap.get(word.id) ?? false,
    }));

    return {
      words: wordProgress,
      totalPages,
      currentPage: page
    };
  } catch (error) {
    console.error("Failed to get user word progress:", error);
    return {
      words: [],
      totalPages: 0,
      currentPage: 1
    };
  }
}

/**
 * ユーザーの進捗サマリーを取得
 * @param userId ユーザーID
 * @returns 進捗の統計情報
 */
export async function getUserProgressSummary(
  userId: string
): Promise<{
  total: number;
  completed: number;
  percentage: number;
}> {
  try {
    // すべての単語の総数を取得
    const allWords = await db.select().from(words);
    const total = allWords.length;

    // 完了した単語の数を取得
    const completedWords = await db
      .select()
      .from(userWords)
      .where(
        and(
          eq(userWords.userId, userId),
          eq(userWords.complete, true)
        )
      );
    const completed = completedWords.length;

    return {
      total,
      completed,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    };
  } catch (error) {
    console.error("Failed to get progress summary:", error);
    return {
      total: 0,
      completed: 0,
      percentage: 0,
    };
  }
}
