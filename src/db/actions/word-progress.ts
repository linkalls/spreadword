import { db } from "../dbclient";
import { userWords, words, type Word } from "../schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * WordProgressの型定義
 * 単語の基本情報と完了状態を含む
 */
export type WordProgress = Omit<Word, 'choices'> & {
  complete: number;
  choices?: string | null;
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
        complete: complete ? 1 : 0,
      });
    } else {
      // レコードが存在する場合は更新
      await db
        .update(userWords)
        .set({ complete: complete ? 1 : 0 })
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
/**
 * 検索文字列のエスケープ処理
 */
const sanitizeSearchTerm = (term: string) => {
  return term.replace(/[%_\\]/g, '\\$&');
};

/**
 * LIKEパターンの作成
 */
const createLikePattern = (value: string) => {
  return `%${sanitizeSearchTerm(value)}%`;
};

export async function getUserWordProgress(
  userId: string,
  page: number = 1,
  pageSize: number = 20,
  search?: string
): Promise<{
  words: WordProgress[];
  totalPages: number;
  currentPage: number;
}> {
  try {
    // 検索条件の構築
    let searchCondition = undefined;
    if (search) {
      const pattern = createLikePattern(search);
      searchCondition = sql`(LOWER(${words.word}) LIKE LOWER(${pattern}) OR LOWER(${words.meanings}) LIKE LOWER(${pattern}))`;
    }

    // カウントクエリ
    const [{ value: totalCount }] = await db
      .select({ value: sql`count(*)`.mapWith(Number) })
      .from(words)
      .where(searchCondition || undefined);

    // トランザクション内でページネーションの計算とデータ取得を実行
    const result = await db.transaction(async (tx) => {
      const totalPages = Math.ceil(totalCount / pageSize);
      const offset = (page - 1) * pageSize;

      // 単語と進捗情報を1回のクエリで取得
      const wordProgress = await tx
        .select({
          id: words.id,
          word: words.word,
          meanings: words.meanings,
          part_of_speech: words.part_of_speech,
          ex: words.ex,
          complete: sql`COALESCE(${userWords.complete}, 0)`.mapWith(Number),
        })
        .from(words)
        .leftJoin(
          userWords,
          and(
            eq(userWords.wordId, words.id),
            eq(userWords.userId, userId)
          )
        )
        .where(searchCondition || undefined)
        .limit(pageSize)
        .offset(offset)
        .orderBy(words.id);  // 一貫した順序を保証するためのソート

      return { wordProgress, totalPages, page };
    });

    return {
      words: result.wordProgress,
      totalPages: result.totalPages,
      currentPage: result.page
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
    const [totalResult, completedResult] = await Promise.all([
      db
        .select({ total: sql`count(*)`.mapWith(Number) })
        .from(words)
        .then(rows => rows[0]),
      db
        .select({ completed: sql`count(*)`.mapWith(Number) })
        .from(userWords)
        .where(
          and(
            eq(userWords.userId, userId),
            eq(userWords.complete, 1)
          )
        )
        .then(rows => rows[0])
    ]);

    const total = totalResult?.total ?? 0;
    const completed = completedResult?.completed ?? 0;

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
