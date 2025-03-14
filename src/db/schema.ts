import { relations, InferSelectModel } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import type { AdapterAccountType } from "next-auth/adapters";

// テーブルの型定義をエクスポート
export type User = InferSelectModel<typeof users>;
export type Word = InferSelectModel<typeof words>;
export type UserWord = InferSelectModel<typeof userWords>;

// export const userTable = sqliteTable("users", {
//   email: text("email").notNull(),
//   id: integer("id").notNull().primaryKey({ autoIncrement: true }),
//   name: text("name").notNull(),
// });

export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

export const authenticators = sqliteTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: integer("credentialBackedUp", {
      mode: "boolean",
    }).notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
);

/**
 * 単語テーブル
 * このテーブルには学習する単語の基本情報が格納されます
 */
export const words = sqliteTable("word", {
  id: integer("id").notNull().primaryKey({ autoIncrement: true }), // 単語のユニークID（自動採番）
  word: text("word").notNull(),                                    // 単語そのもの
  meanings: text("meanings").notNull(),                            // 単語の意味
  part_of_speech: text("part_of_speech"),                         // 品詞（名詞、動詞など）
  choices: text("choices"),                                       // 選択肢（クイズ用）
  ex: text("ex"),                                                // 例文
});

/**
 * ユーザーと単語の中間テーブル
 * このテーブルの役割：
 * 1. ユーザーと単語の関係を管理（どのユーザーがどの単語を学習しているか）
 * 2. 各ユーザーの単語ごとの完了状態を保持
 * 
 * 例：
 * userId | wordId | complete
 * user1  | word1  | true     // user1はword1を完了
 * user1  | word2  | false    // user1はword2をまだ完了していない
 * user2  | word1  | false    // user2はword1をまだ完了していない
 */
export const userWords = sqliteTable(
  "user_words",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    wordId: integer("wordId")
      .notNull()
      .references(() => words.id, { onDelete: "cascade" }),
    complete: integer("complete", { mode: "boolean" }).default(false),
    mistakeCount: integer("mistake_count").default(0),
    lastMistakeDate: integer("last_mistake_date", { mode: "timestamp_ms" }),
    notes: text("notes"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.wordId] }),
  })
);

/**
 * 学習履歴テーブル
 * ユーザーの学習活動を記録するテーブル
 */
export const learningHistory = sqliteTable("learning_history", {
  id: integer("id").notNull().primaryKey({ autoIncrement: true }),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  wordId: integer("wordId")
    .notNull()
    .references(() => words.id, { onDelete: "cascade" }),
  activityType: text("activity_type").notNull(), // "quiz" or "review"
  result: integer("result", { mode: "boolean" }), // クイズの場合の正解/不正解
  timestamp: integer("timestamp", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * クイズ結果テーブル
 * 4択クイズの詳細な結果を記録するテーブル
 */
export const quizResults = sqliteTable("quiz_results", {
  id: integer("id").notNull().primaryKey({ autoIncrement: true }),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  wordId: integer("wordId")
    .notNull()
    .references(() => words.id, { onDelete: "cascade" }),
  selectedChoice: text("selected_choice").notNull(), // ユーザーが選択した答え
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
  timestamp: integer("timestamp", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// リレーションの更新
export const usersRelations = relations(users, ({ many }) => ({
  words: many(userWords),
  learningHistory: many(learningHistory),
  quizResults: many(quizResults),
}));

export const wordsRelations = relations(words, ({ many }) => ({
  users: many(userWords),
  learningHistory: many(learningHistory),
  quizResults: many(quizResults),
}));

export const learningHistoryRelations = relations(learningHistory, ({ one }) => ({
  user: one(users, {
    fields: [learningHistory.userId],
    references: [users.id],
  }),
  word: one(words, {
    fields: [learningHistory.wordId],
    references: [words.id],
  }),
}));

export const quizResultsRelations = relations(quizResults, ({ one }) => ({
  user: one(users, {
    fields: [quizResults.userId],
    references: [users.id],
  }),
  word: one(words, {
    fields: [quizResults.wordId],
    references: [words.id],
  }),
}));

export const userWordsRelations = relations(userWords, ({ one }) => ({
  user: one(users, {
    fields: [userWords.userId],
    references: [users.id],
  }),
  word: one(words, {
    fields: [userWords.wordId],
    references: [words.id],
  }),
}));

// テーブルの型定義を更新
export type LearningHistory = InferSelectModel<typeof learningHistory>;
export type QuizResult = InferSelectModel<typeof quizResults>;
