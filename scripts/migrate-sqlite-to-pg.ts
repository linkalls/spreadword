// import { drizzle } from 'drizzle-orm/better-sqlite3';
// import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
// import Database from 'better-sqlite3';
// import postgres from 'postgres';
// import * as schema from '../src/db/schema';
// import { type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
// import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
// import dotenv from 'dotenv';

// dotenv.config();

// // SQLiteのスキーマ型定義
// type SqliteSchema = typeof schema;
// type DrizzleSqliteDB = BetterSQLite3Database<SqliteSchema>;

// // PostgreSQLのスキーマ型定義
// type PostgresSchema = typeof schema;
// type DrizzlePgDB = PostgresJsDatabase<PostgresSchema>;

// async function migrateToPg() {
//   // SQLite connection
//   const sqliteDb = new Database('./src/db/dev.sqlite');
//   const db = drizzle(sqliteDb, { schema }) as DrizzleSqliteDB;

//   // PostgreSQL connection
//   const connectionString = process.env.DATABASE_URL || 
//     `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;
  
//   const client = postgres(connectionString);
//   const pgDb = drizzlePg(client, { schema }) as DrizzlePgDB;

//   try {
//     console.log('🔄 データ移行を開始します...');

//     // words テーブルの移行
//     console.log('📚 単語データの移行中...');
//     const words = await db.select().from(schema.words);
//     for (const word of words) {
//       await pgDb.insert(schema.words).values({
//         id: word.id,
//         word: word.word,
//         meanings: word.meanings,
//         part_of_speech: word.part_of_speech,
//         ex: word.ex,
//         created_at: word.created_at || new Date(),
//       }).onConflictDoNothing();
//     }
//     console.log(`✅ ${words.length}件の単語を移行しました`);

//     // user_words テーブルの移行
//     console.log('👤 ユーザー単語データの移行中...');
//     const userWords = await db.select().from(schema.userWords);
//     for (const userWord of userWords) {
//       await pgDb.insert(schema.userWords).values({
//         id: userWord.id,
//         userId: userWord.userId,
//         wordId: userWord.wordId,
//         complete: userWord.complete,
//         bookmarked: userWord.bookmarked,
//         notes: userWord.notes,
//         created_at: userWord.created_at || new Date(),
//         updated_at: userWord.updated_at || new Date(),
//       }).onConflictDoNothing();
//     }
//     console.log(`✅ ${userWords.length}件のユーザー単語データを移行しました`);

//     // word_lists テーブルの移行
//     console.log('📝 単語リストの移行中...');
//     const wordLists = await db.select().from(schema.wordLists);
//     for (const list of wordLists) {
//       await pgDb.insert(schema.wordLists).values({
//         id: list.id,
//         name: list.name,
//         description: list.description,
//         userId: list.userId,
//         isPublic: list.isPublic,
//         created_at: list.created_at || new Date(),
//         updated_at: list.updated_at || new Date(),
//       }).onConflictDoNothing();
//     }
//     console.log(`✅ ${wordLists.length}件の単語リストを移行しました`);

//     // word_list_items テーブルの移行
//     console.log('📑 単語リストアイテムの移行中...');
//     const wordListItems = await db.select().from(schema.wordListItems);
//     for (const item of wordListItems) {
//       await pgDb.insert(schema.wordListItems).values({
//         id: item.id,
//         wordListId: item.wordListId,
//         wordId: item.wordId,
//         created_at: item.created_at || new Date(),
//       }).onConflictDoNothing();
//     }
//     console.log(`✅ ${wordListItems.length}件の単語リストアイテムを移行しました`);

//     // quiz_progress テーブルの移行
//     console.log('📊 クイズ進捗の移行中...');
//     const quizProgress = await db.select().from(schema.quizProgress);
//     for (const progress of quizProgress) {
//       await pgDb.insert(schema.quizProgress).values({
//         id: progress.id,
//         userId: progress.userId,
//         wordId: progress.wordId,
//         correct: progress.correct,
//         created_at: progress.created_at || new Date(),
//       }).onConflictDoNothing();
//     }
//     console.log(`✅ ${quizProgress.length}件のクイズ進捗を移行しました`);

//     // user_statistics テーブルの移行
//     console.log('📈 ユーザー統計の移行中...');
//     const userStats = await db.select().from(schema.userStatistics);
//     for (const stat of userStats) {
//       await pgDb.insert(schema.userStatistics).values({
//         id: stat.id,
//         userId: stat.userId,
//         totalWords: stat.totalWords,
//         completedWords: stat.completedWords,
//         correctAnswers: stat.correctAnswers,
//         wrongAnswers: stat.wrongAnswers,
//         streak: stat.streak,
//         lastActivity: stat.lastActivity || new Date(),
//         created_at: stat.created_at || new Date(),
//         updated_at: stat.updated_at || new Date(),
//       }).onConflictDoNothing();
//     }
//     console.log(`✅ ${userStats.length}件のユーザー統計を移行しました`);

//     console.log('🎉 データ移行が完了しました！');
//   } catch (error) {
//     console.error('❌ データ移行中にエラーが発生しました:', error);
//     throw error;
//   } finally {
//     // 接続のクローズ
//     sqliteDb.close();
//     await client.end();
//   }
// }

// // スクリプトの実行
// migrateToPg().catch(console.error);
