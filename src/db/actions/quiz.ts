import { and, eq, inArray, isNull, ne, or, sql } from "drizzle-orm";
import { db } from "../dbclient";
import {
  learningHistory,
  quizResults,
  userWords,
  wordListItems,
  words,
  type Word,
} from "../schema";

// 重み付けされた単語の型定義
interface WeightedWord extends Word {
  weight: number;
}

/**
 * ユーザーに適した単語を取得する関数
 * @param userId ユーザーID
 * @param count 取得する単語数（デフォルト4）
 * @returns 重み付けされた単語の配列
 */
/**
 * リストに含まれる単語からランダムに選択する関数
 */
export const getRandomWordsFromList = async (
  userId: string,
  listId: string,
  count: number = 4
) => {
  try {
    // リストに含まれる単語IDを取得
    const listItems = await db
      .select({ wordId: wordListItems.wordId })
      .from(wordListItems)
      .where(eq(wordListItems.listId, listId));

    const listWordIds = listItems.map((item) => item.wordId);
    if (listWordIds.length === 0) {
      throw new Error("List is empty");
    }

    // ユーザーの単語学習状況を取得（リスト内の単語のみ）
    const userWordsResult = await db
      .select({
        wordId: userWords.wordId,
        complete: userWords.complete,
        mistakeCount: userWords.mistakeCount,
        lastMistakeDate: userWords.lastMistakeDate,
      })
      .from(userWords)
      .where(
        and(
          eq(userWords.userId, userId),
          inArray(userWords.wordId, listWordIds)
        )
      );

    // 完了していない単語のIDを取得
    const incompleteWordIds = userWordsResult
      .filter((uw) => uw.complete !== 1)
      .map((uw) => uw.wordId);

    // リスト内の全単語を取得
    const listWords = await db
      .select()
      .from(words)
      .where(inArray(words.id, listWordIds));

    // 単語に重み付けを行う
    const weightedWords: WeightedWord[] = listWords.map((word) => {
      const userWord = userWordsResult.find((uw) => uw.wordId === word.id);
      let weight = 1;

      // 未完了の単語のみを対象とする
      if (!incompleteWordIds.includes(word.id) && userWord) {
        return { ...word, weight: 0 };
      }

      // 間違えた回数に応じて重み付けを増やす
      if (userWord?.mistakeCount) {
        weight += userWord.mistakeCount * 2;
      }

      // 最近間違えた単語の重みを増やす
      if (userWord?.lastMistakeDate) {
        const lastMistake = new Date(userWord.lastMistakeDate);
        const daysSinceLastMistake = Math.floor(
          (Date.now() - lastMistake.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastMistake < 7) {
          weight += 7 - daysSinceLastMistake;
        }
      }

      return { ...word, weight };
    });

    // 重み付けに基づいて単語を選択
    const weightedSelection: WeightedWord[] = [];
    const availableWords = weightedWords.filter((w) => w.weight > 0);

    for (let i = 0; i < count && availableWords.length > 0; i++) {
      const totalWeight = availableWords.reduce(
        (sum, word) => sum + word.weight,
        0
      );
      let random = Math.random() * totalWeight;

      for (let j = 0; j < availableWords.length; j++) {
        random -= availableWords[j].weight;
        if (random <= 0) {
          weightedSelection.push(availableWords[j]);
          availableWords.splice(j, 1);
          break;
        }
      }
    }

    // 十分な単語が選択できなかった場合、残りをランダムに選択
    if (weightedSelection.length < count) {
      const remainingWords = listWords.filter(
        (w) => !weightedSelection.find((selected) => selected.id === w.id)
      );
      const additionalWords = remainingWords
        .sort(() => Math.random() - 0.5)
        .slice(0, count - weightedSelection.length)
        .map((word) => ({ ...word, weight: 1 } as WeightedWord));
      weightedSelection.push(...additionalWords);
    }

    // 選択肢を生成
    return weightedSelection.map((word) => {
      // 他の単語からランダムに3つの意味を選択して不正解の選択肢として使用
      const otherMeanings = listWords
        .filter(w => w.id !== word.id)
        .map(w => w.meanings)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      // 正解の意味と不正解の選択肢をシャッフル
      const choices = [word.meanings, ...otherMeanings].sort(() => Math.random() - 0.5);

      return {
        ...word,
        choices
      };
    });
  } catch (error) {
    console.error("Error getting random words from list:", error);
    throw error;
  }
};

/**
 * 全単語からランダムに選択する関数
 */
export const getRandomWords = async (userId: string, count: number = 4) => {
  try {
    // 最近のクイズ結果を取得（過去24時間以内）
    const recentQuizzes = await db
      .select({
        wordId: quizResults.wordId,
      })
      .from(quizResults)
      .where(
        and(
          eq(quizResults.userId, userId),
          sql`${quizResults.timestamp} > datetime('now', '-1 day')`
        )
      );

    const recentWordIds = recentQuizzes.map(quiz => quiz.wordId);

    // ユーザーの単語学習状況を取得
    const userWordsResult = await db
      .select({
        wordId: userWords.wordId,
        complete: userWords.complete,
        mistakeCount: userWords.mistakeCount,
        lastMistakeDate: userWords.lastMistakeDate,
      })
      .from(userWords)
      .where(eq(userWords.userId, userId));

    // 利用可能な単語を取得（最近出題された単語を除外）
    const availableWords = await db
      .select({
        id: words.id,
        word: words.word,
        meanings: words.meanings,
        part_of_speech: words.part_of_speech,
        choices: words.choices,
        ex: words.ex,
      })
      .from(words)
      .leftJoin(
        userWords,
        and(eq(words.id, userWords.wordId), eq(userWords.userId, userId))
      )
      .where(
        and(
          or(isNull(userWords.complete), ne(userWords.complete, 1)),
          sql`${words.id} NOT IN (${recentWordIds.length > 0 ? recentWordIds : [-1]})`
        )
      );

    // 単語に重み付けを行う
    const weightedWords = availableWords.map(word => {
      const userWord = userWordsResult.find(uw => uw.wordId === word.id);
      let weight = 1;

      // 間違えた回数に応じて重み付けを増やす
      if (userWord?.mistakeCount) {
        weight += userWord.mistakeCount * 2;
      }

      // 最近間違えた単語の重みを増やす
      if (userWord?.lastMistakeDate) {
        const lastMistake = new Date(userWord.lastMistakeDate);
        const daysSinceLastMistake = Math.floor(
          (Date.now() - lastMistake.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastMistake < 7) {
          weight += 7 - daysSinceLastMistake;
        }
      }

      return { ...word, weight };
    });

    // 重み付けに基づいて単語を選択
    const selectedWords = [];
    const availableCopy = [...weightedWords];

    for (let i = 0; i < count && availableCopy.length > 0; i++) {
      const totalWeight = availableCopy.reduce((sum, word) => sum + word.weight, 0);
      let random = Math.random() * totalWeight;

      for (let j = 0; j < availableCopy.length; j++) {
        random -= availableCopy[j].weight;
        if (random <= 0) {
          selectedWords.push(availableCopy[j]);
          availableCopy.splice(j, 1);
          break;
        }
      }
    }

    // DBから全単語を取得（選択肢生成用）
    const allWords = await db
      .select({
        meanings: words.meanings,
      })
      .from(words)
      .where(ne(words.id, sql`-1`)); // ダミー条件で全単語を取得

    return selectedWords.map((word) => {
      // 他の単語からランダムに3つの意味を選択して不正解の選択肢として使用
      const otherMeanings = allWords
        .filter(w => w.meanings !== word.meanings)
        .map(w => w.meanings)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      // 正解の意味と不正解の選択肢をシャッフル
      const choices = [word.meanings, ...otherMeanings].sort(() => Math.random() - 0.5);

      return {
        ...word,
        choices
      };
    });
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
    // トランザクションで一連の処理を実行
    await db.transaction(async (tx) => {
      // クイズ結果の保存
      await tx.insert(quizResults).values({
        userId,
        wordId,
        selectedChoice,
        isCorrect,
      });

      // 学習履歴の保存
      await tx.insert(learningHistory).values({
        userId,
        wordId,
        activityType: "quiz",
        result: isCorrect ? 1 : 0,
      });

      // ユーザーの単語進捗を取得
      const userWord = await tx
        .select()
        .from(userWords)
        .where(eq(userWords.userId, userId) && eq(userWords.wordId, wordId))
        .get();

      if (userWord) {
        // 不正解の場合
        if (!isCorrect) {
          await tx
            .update(userWords)
            .set({
              mistakeCount: (userWord.mistakeCount || 0) + 1,
              // 日本時間で日付を取得
              lastMistakeDate: new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })).toISOString().split('T')[0],
              complete: 0, // 不正解の場合は完了フラグをリセット
            })
            .where(
              eq(userWords.userId, userId) && eq(userWords.wordId, wordId)
            );
        } else {
          // 正解の場合、completeを更新（-3から始まり、3回連続正解で1になる）
          const newComplete = Math.min((userWord.complete  || -3) + 1, 1);
          await tx
            .update(userWords)
            .set({
              complete: newComplete,
            })
            .where(
              eq(userWords.userId, userId) && eq(userWords.wordId, wordId)
            );
        }
      } else {
        // ユーザーと単語の関連がまだ存在しない場合は新規作成
        await tx.insert(userWords).values({
          userId,
          wordId,
          complete: isCorrect ? -2 : -3, // 正解なら-2から、不正解なら-3からスタート
          mistakeCount: isCorrect ? 0 : 1,
            lastMistakeDate: isCorrect
            ? null
            : new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })).toISOString().split('T')[0],
        });
      }
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
    const stats = await db
      .select({
        total: sql`count(*)`,
        correct: sql`sum(case when ${quizResults.isCorrect} = 1 then 1 else 0 end)`,
      })
      .from(quizResults)
      .where(eq(quizResults.userId, userId))
      .get();

    const totalQuizzes = Number(stats?.total || 0);
    const correctAnswers = Number(stats?.correct || 0);
    const accuracy =
      totalQuizzes > 0 ? (correctAnswers / totalQuizzes) * 100 : 0;

    return {
      totalQuizzes,
      correctAnswers,
      accuracy: parseFloat(accuracy.toFixed(1)),
    };
  } catch (error) {
    console.error("Error getting user quiz stats:", error);
    throw error;
  }
};
