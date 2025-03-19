// async function migrateData() {
  console.log("🚀 データ移行を開始します...");


  // for(const accountData of accounts) {
  //   console.log(accountData)
  //   await db.insert(schema.accounts).values({
  //    userId: accountData.userId,
  //     provider: accountData.provider,
  //     providerAccountId: accountData.providerAccountId,
  //     type: accountData.type,
  //     access_token: accountData.access_token,
  //     token_type: accountData.token_type,
  //     scope: accountData.scope,
  //     id_token: accountData.id_token,
  //     session_state: accountData.session_state
  //   })
  // }

  

// //   // Tursoクライアントの設定
// //   const tursoClient = createClient({
// //     url: process.env.TURSO_DATABASE_URL!,
// //     authToken: process.env.TURSO_AUTH_TOKEN,
// //   });
// //   const tursoDb = drizzle(tursoClient, { schema });

//   // ローカルクライアントの設定 (既存の環境変数を使用)
//   // const localClient = createClient({
//   //   url: process.env.DATABASE_URL!,
//   //   authToken: process.env.AUTH_TOKEN,
//   // });
//   // const localDb = drizzle(localClient, { schema });

//   // try {


// // user.forEach((user) => {
// //   console.log(user)
// //   db.insert(schema.users).values(user)

// // })
// // for(const userData of user) {
// //   console.log(userData)
// //   await db.insert(schema.users).values(userData)
// // }

// for(const qrData of qr) {
//   console.log(qrData)
//   await db.insert(schema.quizResults).values({
//     id: qrData.id,
//     userId: qrData.userId,
//     wordId: qrData.wordId,
//     selectedChoice: qrData.selected_choice,
//     isCorrect: Boolean(qrData.is_correct),
//     timestamp: new Date(qrData.timestamp)
//   })
// }


    
// //     // スキーマの移行
// //     console.log("📊 スキーマを移行中...");
// //     await migrate(localDb, { migrationsFolder: "./src/db/migrations" });

// //     // テーブル一覧
// //     const tables = [
// //       { name: "user", schema: schema.users },
// //       { name: "user_roles", schema: schema.userRoles },
// //       { name: "word", schema: schema.words },
// //       { name: "user_words", schema: schema.userWords },
// //       { name: "learning_history", schema: schema.learningHistory },
// //       { name: "quiz_results", schema: schema.quizResults },
// //       { name: "study_groups", schema: schema.studyGroups },
// //       { name: "group_members", schema: schema.groupMembers },
// //       { name: "achievements", schema: schema.achievements },
// //       { name: "user_achievements", schema: schema.userAchievements },
// //       { name: "ranking_history", schema: schema.rankingHistory },
// //       { name: "word_lists", schema: schema.wordLists },
// //       { name: "word_list_items", schema: schema.wordListItems },
// //       { name: "account", schema: schema.accounts },
// //       { name: "session", schema: schema.sessions },
// //       { name: "verificationToken", schema: schema.verificationTokens },
// //       { name: "authenticator", schema: schema.authenticators },
// //     ];



// //     // 各テーブルのデータを移行
// //     for (const table of tables) {
// //       console.log(`📦 ${table.name}テーブルのデータを移行中...`);
      
// //       try {
// //         // Tursoからデータを取得
// //         const data = await tursoDb.select().from(table.schema);
        
// //         if (data.length > 0) {
// //           // バッチサイズを設定（メモリ使用量を制御）
// //           const batchSize = 100;
// //           for (let i = 0; i < data.length; i += batchSize) {
// //             const batch = data.slice(i, i + batchSize);
            
// //             // ローカルDBに挿入
// //             // 既存のデータがある場合は上書き
// //             for (const record of batch) {
// //               try {
// //                 await localDb.insert(table.schema).values(record)
// //                   .onConflictDoUpdate({
// //                     target: getPrimaryKeyColumns(table.schema),
// //                     set: record,
// //                   });
// //               } catch (error) {
// //                 console.error(`⚠️ ${table.name}テーブルのレコード移行中にエラーが発生しました:`, error);
// //                 continue;
// //               }
// //             }
// //           }
// //           console.log(`✅ ${table.name}テーブル: ${data.length}件のレコードを移行完了`);
// //         } else {
// //           console.log(`ℹ️ ${table.name}テーブル: データなし`);
// //         }
// //       } catch (error) {
// //         console.error(`❌ ${table.name}テーブルの移行中にエラーが発生しました:`, error);
// //         continue;
// //       }
// //     }

// //     console.log("🎉 データ移行が完了しました！");
// //   } catch (error) {
// //     console.error("❌ 移行プロセス中にエラーが発生しました:", error);
// //     throw error;
// //   } finally {
// // //     // 接続を閉じる
// // //     await tursoClient.close();
// //     await localClient.close();
// //   }
// // }

// // // テーブルの一意キーを取得するヘルパー関数
// // function getPrimaryKeyColumns(table: Table) {
// //   // テーブルの設定を確認
// //   if (!table) return [sql.raw("id")];  // デフォルトのフォールバック

// //   // プライマリキーまたは一意キーのカラムを探す
// //   const columns = Object.entries(table)
// //     .filter(([key, value]) => {
// //       if (typeof value === 'object' && value !== null) {
// //         return (
// //           'primaryKey' in value || 
// //           (value.config && 'primaryKey' in value.config)
// //         );
// //       }
// //       return false;
// //     })
// //     .map(([key]) => sql.raw(key));

// //   return columns.length > 0 ? columns : [sql.raw("id")];
// // }

// // // スクリプトの実行
// // migrateData().catch((error) => {
// //   console.error("❌ 移行スクリプトの実行中にエラーが発生しました:", error);
// //   process.exit(1);
// // });
