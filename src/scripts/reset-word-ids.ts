// import { db } from "../db/dbclient";
// import { words, userWords, wordListItems } from "../db/schema";
// import { sql } from "drizzle-orm";

// // ユーザーの確認を得る関数
// function getUserConfirmation(): Promise<boolean> {
//   return new Promise((resolve) => {
//     console.log("\n⚠️  警告: このスクリプトは以下の操作を行います:");
//     console.log("1. 単語テーブルのIDを1から振り直します");
//     console.log("2. user_wordsとword_list_itemsの参照を更新します");
//     console.log("\n⚡ 重要:");
//     console.log("- データベースのバックアップを取ることを強く推奨します");
//     console.log("- 処理中はアプリケーションを停止してください");
//     console.log("\nプロセスを続行するには'yes'を入力してください。中止するには他のキーを押してください。");

//     process.stdin.once('data', (data) => {
//       const input = data.toString().trim().toLowerCase();
//       resolve(input === 'yes');
//     });
//   });
// }

// async function resetWordIds() {
//   try {
//     // ユーザーの確認を得る
//     const confirmed = await getUserConfirmation();
//     if (!confirmed) {
//       console.log("\n❌ 処理を中止しました。");
//       process.exit(0);
//     }

//     console.log("\n🔄 単語IDリセット処理を開始します...");

//     // 1. 現在のデータをバックアップ
//     console.log("📦 現在のデータをバックアップしています...");
//     const currentWords = await db.select().from(words);
//     const currentUserWords = await db.select().from(userWords);
//     const currentWordListItems = await db.select().from(wordListItems);

//     // 2. 古いIDと新しいIDのマッピングを作成
//     const idMapping = new Map<number, number>();
//     currentWords.forEach((word, index) => {
//       idMapping.set(word.id, index + 1); // 新しいIDは1から始まる
//     });

//     // トランザクション内でデータを更新
//     await db.transaction(async (tx) => {
//       // 3. 関連テーブルからの参照を一時的に削除
//       await tx.delete(userWords);
//       await tx.delete(wordListItems);
//       await tx.delete(words);

//       // 4. 単語を新しいIDで再挿入
//       for (const word of currentWords) {
//         const newId = idMapping.get(word.id);
//         if (!newId) continue;

//         await tx.insert(words).values({
//           id: newId,
//           word: word.word,
//           meanings: word.meanings,
//           part_of_speech: word.part_of_speech,
//           choices: word.choices,
//           ex: word.ex,
//         });
//       }

//       // 5. user_wordsを新しいIDで再挿入
//       for (const userWord of currentUserWords) {
//         const newWordId = idMapping.get(userWord.wordId);
//         if (!newWordId) continue;

//         await tx.insert(userWords).values({
//           userId: userWord.userId,
//           wordId: newWordId,
//           complete: userWord.complete,
//           mistakeCount: userWord.mistakeCount,
//           lastMistakeDate: userWord.lastMistakeDate,
//           bookmarked: userWord.bookmarked,
//           notes: userWord.notes,
//         });
//       }

//       // 6. word_list_itemsを新しいIDで再挿入
//       for (const item of currentWordListItems) {
//         const newWordId = idMapping.get(item.wordId);
//         if (!newWordId) continue;

//         await tx.insert(wordListItems).values({
//           listId: item.listId,
//           wordId: newWordId,
//           addedAt: item.addedAt,
//           notes: item.notes,
//         });
//       }

//       // 7. SQLiteのauto-incrementをリセット
//       await tx.run(sql`DELETE FROM sqlite_sequence WHERE name = 'word'`);
//     });

//     console.log("✅ 単語IDのリセットが完了しました");
//     console.log(`📊 処理された単語数: ${currentWords.length}`);
//     process.exit(0);
//   } catch (error) {
//     let errorMessage = "不明なエラー";
//     if (error instanceof Error) {
//       errorMessage = `${error.name}: ${error.message}`;
//       if ('cause' in error) {
//         errorMessage += `\n原因: ${error.cause}`;
//       }
//     }
    
//     console.error("❌ 単語IDリセット処理に失敗しました:", errorMessage);
//     process.exit(1);
//   }
// }

// resetWordIds().catch((error) => {
//   console.error("❌ 予期せぬエラーが発生しました:", error);
//   process.exit(1);
// });
