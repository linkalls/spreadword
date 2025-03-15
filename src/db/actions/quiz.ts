import { eq } from "drizzle-orm";
import { db } from "../dbclient";
import { learningHistory, quizResults, userWords, words, type Word } from "../schema";

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
export const getRandomWords = async (userId: string, count: number = 4) => {
  try {
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

    // 完了していない単語のIDを取得
    const incompleteWordIds = userWordsResult
      .filter(uw => uw.complete !== 1)
      .map(uw => uw.wordId);

    // 全単語を取得
    const allWords = await db.select().from(words).$dynamic();
    
    // 単語に重み付けを行う
    const weightedWords: WeightedWord[] = allWords.map(word => {
      const userWord = userWordsResult.find(uw => uw.wordId === word.id);
      let weight = 1;

      // 未完了の単語のみを対象とする
      if (!incompleteWordIds.includes(word.id)) {
        return { ...word, weight: 0 };
      }

      // 間違えた回数に応じて重み付けを増やす
      if (userWord?.mistakeCount) {
        weight += userWord.mistakeCount * 2;
      }

      // 最近間違えた単語の重みを増やす
      if (userWord?.lastMistakeDate) {
        const lastMistake = new Date(userWord.lastMistakeDate);
        const daysSinceLastMistake = Math.floor((Date.now() - lastMistake.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLastMistake < 7) {
          weight += (7 - daysSinceLastMistake);
        }
      }

      return { ...word, weight };
    });

    // 重み付けに基づいて単語を選択
    const weightedSelection: WeightedWord[] = [];
    const availableWords: WeightedWord[] = weightedWords.filter(w => w.weight > 0);

    for (let i = 0; i < count && availableWords.length > 0; i++) {
      // 重みの合計を計算
      const totalWeight = availableWords.reduce((sum, word) => sum + word.weight, 0);
      
      // ランダムな重みを生成
      let random = Math.random() * totalWeight;
      
      // 重みに基づいて単語を選択
      for (let j = 0; j < availableWords.length; j++) {
        random -= availableWords[j].weight;
        if (random <= 0) {
          weightedSelection.push(availableWords[j]);
          availableWords.splice(j, 1); // 選択した単語を削除
          break;
        }
      }
    }

    // 十分な単語が選択できなかった場合、残りをランダムに選択
    if (weightedSelection.length < count) {
      const remainingWords = allWords.filter(
        w => !weightedSelection.find(selected => selected.id === w.id)
      );
      const additionalWords = remainingWords
        .sort(() => Math.random() - 0.5)
        .slice(0, count - weightedSelection.length)
        .map(word => ({ ...word, weight: 1 } as WeightedWord));
      weightedSelection.push(...additionalWords);
    }

    // weight プロパティを削除して返す
    return weightedSelection.map(({  ...word }) => word);
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
        .where(
          eq(userWords.userId, userId) && eq(userWords.wordId, wordId)
        )
        .get();

      if (userWord) {
        // 不正解の場合
        if (!isCorrect) {
          await tx
            .update(userWords)
            .set({
              mistakeCount: (userWord.mistakeCount || 0) + 1,
              lastMistakeDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD形式
              complete: 0 // 不正解の場合は完了フラグをリセット
            })
            .where(eq(userWords.userId, userId) && eq(userWords.wordId, wordId));
        } else {
          // 正解の場合、completeを更新（-3から始まり、3回連続正解で1になる）
          const newComplete = Math.min((userWord.complete || -3) + 1, 1);
          await tx
            .update(userWords)
            .set({
              complete: newComplete
            })
            .where(eq(userWords.userId, userId) && eq(userWords.wordId, wordId));
        }
      } else {
        // ユーザーと単語の関連がまだ存在しない場合は新規作成
        await tx.insert(userWords).values({
          userId,
          wordId,
          complete: isCorrect ? -2 : -3, // 正解なら-2から、不正解なら-3からスタート
          mistakeCount: isCorrect ? 0 : 1,
          lastMistakeDate: isCorrect ? null : new Date().toISOString().split('T')[0]
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
