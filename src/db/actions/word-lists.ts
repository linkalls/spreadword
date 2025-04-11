import { and, eq } from "drizzle-orm";
import { db } from "../dbclient";
import type { Word, WordList } from "../schema";
import { userWords, wordListItems, wordLists, words } from "../schema";

/**
 * 単語リストを作成する
 */
export async function createWordList({
  userId,
  name,
  description,
  isPublic = false,
}: {
  userId: string;
  name: string;
  description?: string;
  isPublic?: boolean;
}): Promise<WordList> {
  const [list] = await db
    .insert(wordLists)
    .values({
      userId,
      name,
      description,
      isPublic: isPublic ? 1 : 0,
      shareId: isPublic ? crypto.randomUUID() : null,
    })
    .returning();

  return list;
}

/**
 * 単語リストを取得する
 */
export async function getWordList(listId: string): Promise<WordList | null> {
  const list = await db.query.wordLists.findFirst({
    where: eq(wordLists.id, listId),
  });

  return list || null;
}

/**
 * ユーザーの単語リスト一覧を取得する
 */
export async function getUserWordLists(userId: string): Promise<WordList[]> {
  const lists = await db.query.wordLists.findMany({
    where: eq(wordLists.userId, userId),
    orderBy: (lists) => lists.createdAt,
  });

  return lists;
}

/**
 * 公開されている単語リスト一覧を取得する
 */
export async function getPublicWordLists(): Promise<WordList[]> {
  const lists = await db.query.wordLists.findMany({
    where: eq(wordLists.isPublic, 1),
    orderBy: (lists) => lists.createdAt,
  });

  return lists;
}

/**
 * 単語リストを更新する
 */
export async function updateWordList({
  listId,
  userId,
  name,
  description,
  isPublic,
}: {
  listId: string;
  userId: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
}): Promise<WordList | null> {
  // ユーザーが所有するリストかどうかを確認
  const list = await db.query.wordLists.findFirst({
    where: and(eq(wordLists.id, listId), eq(wordLists.userId, userId)),
  });

  if (!list) return null;

  const newIsPublic = isPublic !== undefined ? isPublic : list.isPublic === 1;
  const shareId = newIsPublic
    ? list.shareId || crypto.randomUUID() // 公開時にshareIdがなければ生成
    : null; // 非公開時はshareIdを削除

  const [updatedList] = await db
    .update(wordLists)
    .set({
      name: name || list.name,
      description: description !== undefined ? description : list.description,
      isPublic: newIsPublic ? 1 : 0,
      shareId,
      updatedAt: new Date(),
    })
    .where(eq(wordLists.id, listId))
    .returning();

  return updatedList;
}

/**
 * 単語リストを削除する
 */
export async function deleteWordList(
  listId: string,
  userId: string
): Promise<boolean> {
  const list = await db.query.wordLists.findFirst({
    where: and(eq(wordLists.id, listId), eq(wordLists.userId, userId)),
  });

  if (!list) return false;

  await db.delete(wordLists).where(eq(wordLists.id, listId));
  return true;
}

/**
 * 単語をリストに追加する
 */
export async function addWordToList({
  listId,
  userId,
  wordId,
  notes,
}: {
  listId: string;
  userId: string;
  wordId: number;
  notes?: string;
}): Promise<boolean> {
  // ユーザーが所有するリストかどうかを確認
  const list = await db.query.wordLists.findFirst({
    where: and(eq(wordLists.id, listId), eq(wordLists.userId, userId)),
  });

  if (!list) return false;

  // 既に追加されているかどうかを確認
  const existing = await db.query.wordListItems.findFirst({
    where: and(
      eq(wordListItems.listId, listId),
      eq(wordListItems.wordId, wordId)
    ),
  });

  if (existing) return false;

  await db.insert(wordListItems).values({
    listId,
    wordId,
    notes,
  });

  return true;
}

/**
 * 単語をリストから削除する
 */
export async function removeWordFromList({
  listId,
  userId,
  wordId,
}: {
  listId: string;
  userId: string;
  wordId: number;
}): Promise<boolean> {
  // ユーザーが所有するリストかどうかを確認
  const list = await db.query.wordLists.findFirst({
    where: and(eq(wordLists.id, listId), eq(wordLists.userId, userId)),
  });

  if (!list) return false;

  await db
    .delete(wordListItems)
    .where(
      and(eq(wordListItems.listId, listId), eq(wordListItems.wordId, wordId))
    );

  return true;
}

/**
 * リストに含まれる単語一覧を取得する
 */
export async function getWordsInList(
  listId: string,
  userId?: string
): Promise<
  Array<
    Word & {
      notes?: string | null;
      addedAt: Date;
      progress?: {
        complete: number;
        mistakeCount: number;
        lastMistakeDate: string;
      };
    }
  >
> {
  if (!userId) {
    // ユーザーIDがない場合は進捗情報なしで返す
    const items = await db
      .select({
        id: words.id,
        word: words.word,
        meanings: words.meanings,
        part_of_speech: words.part_of_speech,
        choices: words.choices,
        ex: words.ex,
        notes: wordListItems.notes,
        addedAt: wordListItems.addedAt,
      })
      .from(wordListItems)
      .innerJoin(words, eq(wordListItems.wordId, words.id))
      .where(eq(wordListItems.listId, listId))
      .orderBy(wordListItems.addedAt);

    return items.map((item) => ({
      ...item,
      progress: undefined,
    }));
  }

  // ユーザーIDがある場合は進捗情報も含めて返す
  const items = await db
    .select({
      id: words.id,
      word: words.word,
      meanings: words.meanings,
      part_of_speech: words.part_of_speech,
      choices: words.choices,
      ex: words.ex,
      notes: wordListItems.notes,
      addedAt: wordListItems.addedAt,
      complete: userWords.complete,
      mistakeCount: userWords.mistakeCount,
      lastMistakeDate: userWords.lastMistakeDate,
    })
    .from(wordListItems)
    .innerJoin(words, eq(wordListItems.wordId, words.id))
    .leftJoin(
      userWords,
      and(eq(userWords.wordId, words.id), eq(userWords.userId, userId))
    )
    .where(eq(wordListItems.listId, listId))
    .orderBy(wordListItems.addedAt);

  return items.map((item) => ({
    id: item.id,
    word: item.word,
    meanings: item.meanings,
    part_of_speech: item.part_of_speech,
    choices: item.choices,
    ex: item.ex,
    notes: item.notes,
    addedAt: item.addedAt,
    progress: {
      complete: item.complete ?? 0,
      mistakeCount: item.mistakeCount ?? 0,
      lastMistakeDate: item.lastMistakeDate ?? "",
    },
  }));
}

/**
 * 単語リストをフォークする
 */
export async function forkWordList({
  sourceListId,
  userId,
  name,
  description,
}: {
  sourceListId: string;
  userId: string;
  name: string;
  description?: string;
}): Promise<WordList> {
  // まず新しいリストを作成
  const [forkedList] = await db
    .insert(wordLists)
    .values({
      userId,
      name,
      description,
      isPublic: 0,
      shareId: null,
    })
    .returning();

  // 元のリストの単語をコピー
  const sourceItems = await db
    .select({
      wordId: wordListItems.wordId,
      notes: wordListItems.notes,
    })
    .from(wordListItems)
    .where(eq(wordListItems.listId, sourceListId));

  // 新しいリストに単語を追加
  if (sourceItems.length > 0) {
    await db.insert(wordListItems).values(
      sourceItems.map((item) => ({
        listId: forkedList.id,
        wordId: item.wordId,
        notes: item.notes,
      }))
    );
  }

  return forkedList;
}
