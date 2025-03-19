import { db } from "@/db/dbclient";
import { wordLists, wordListItems, userWords, quizResults, words } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TEST_USER } from "./seed-auth";

// テスト用の単語データ
const TEST_WORDS = [
  {
    id: 1,
    word: "test",
    meanings: "テスト",
    part_of_speech: "noun",
    choices: JSON.stringify(["テスト", "実験", "確認", "検査"]),
    ex: "This is a test sentence."
  },
  {
    id: 2,
    word: "example",
    meanings: "例",
    part_of_speech: "noun",
    choices: JSON.stringify(["例", "見本", "標本", "模範"]),
    ex: "This is an example."
  }
];

// テスト用の単語リストデータ
const TEST_WORD_LISTS = [
  {
    id: "test-public-list",
    name: "テスト用公開リスト",
    description: "E2Eテスト用の公開リスト",
    isPublic: 1
  },
  {
    id: "test-private-list",
    name: "テスト用非公開リスト",
    description: "E2Eテスト用の非公開リスト",
    isPublic: 0
  }
];

/**
 * テストデータのセットアップ
 * - 単語データの作成
 * - 単語リストの作成
 * - 単語リストアイテムの作成
 * - ユーザーと単語の紐付け
 * - クイズ結果の作成
 */
export async function seedTestData() {
  try {
    // 1. 単語データの作成
    await db.insert(words).values(TEST_WORDS);

    // 2. 単語リストの作成
    for (const list of TEST_WORD_LISTS) {
      await db.insert(wordLists).values({
        ...list,
        userId: TEST_USER.id
      });

      // 3. 単語リストアイテムの作成（各リストに全ての単語を追加）
      for (const word of TEST_WORDS) {
        await db.insert(wordListItems).values({
          listId: list.id,
          wordId: word.id,
          notes: `Test note for ${word.word}`
        });
      }
    }

    // 4. ユーザーと単語の紐付け
    for (const word of TEST_WORDS) {
      await db.insert(userWords).values({
        userId: TEST_USER.id,
        wordId: word.id,
        complete: 0,
        mistakeCount: 1,
        lastMistakeDate: new Date().toISOString().split('T')[0],
        bookmarked: 0
      });
    }

    // 5. クイズ結果の作成
    for (const word of TEST_WORDS) {
      await db.insert(quizResults).values({
        userId: TEST_USER.id,
        wordId: word.id,
        selectedChoice: word.meanings,
        isCorrect: true
      });
    }

  } catch (error) {
    console.error("Failed to seed test data:", error);
    throw error;
  }
}

/**
 * テストデータのクリーンアップ
 * - クイズ結果の削除
 * - ユーザーと単語の紐付けの削除
 * - 単語リストアイテムの削除
 * - 単語リストの削除
 * - 単語データの削除
 */
export async function cleanupTestData() {
  try {
    // 1. クイズ結果の削除
    await db.delete(quizResults)
      .where(eq(quizResults.userId, TEST_USER.id));

    // 2. ユーザーと単語の紐付けの削除
    await db.delete(userWords)
      .where(eq(userWords.userId, TEST_USER.id));

    // 3. 単語リストアイテムの削除
    for (const list of TEST_WORD_LISTS) {
      await db.delete(wordListItems)
        .where(eq(wordListItems.listId, list.id));
    }

    // 4. 単語リストの削除
    await db.delete(wordLists)
      .where(eq(wordLists.userId, TEST_USER.id));

    // 5. 単語データの削除
    for (const word of TEST_WORDS) {
      await db.delete(words)
        .where(eq(words.id, word.id));
    }

  } catch (error) {
    console.error("Failed to cleanup test data:", error);
    throw error;
  }
}
