// import { words } from "@/db/schema";
// import { db } from "@/db/dbclient";
// import importedWords from "../db/2021.json";
// import { sql } from "drizzle-orm";

// async function deleteWords() {
//   try {
//     console.log("🔍 DBから削除する単語のIDを検索中...");
    
//     // 2021.jsonの単語リストを作成
//     const wordList = importedWords.map(w => w.word.toLowerCase());
//     console.log(`📝 削除対象の単語数: ${wordList.length}`);

//     // DBから該当する単語のIDを取得
//     const wordIds = await db
//       .select({ id: words.id })
//       .from(words)
//       .where(sql`LOWER(${words.word}) IN ${wordList}`);

//     const ids = wordIds.map(w => w.id);
//     console.log(`✅ 削除対象のID数: ${ids.length}`);

//     if (ids.length === 0) {
//       console.log("❌ 削除対象の単語が見つかりませんでした");
//       process.exit(0);
//     }

//     // 単語を一括削除
//     await db.delete(words).where(sql`id IN ${ids}`);
//     console.log(`✅ ${ids.length}個の単語を削除しました`);

//     process.exit(0);
//   } catch (error) {
//     console.error("❌ エラーが発生しました:", error);
//     process.exit(1);
//   }
// }

// deleteWords();
