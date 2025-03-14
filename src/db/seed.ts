import wordsJson from "../../all_words.json";
import { db } from "./dbclient";
import { words } from "./schema";

interface Word {
  word: string;
  meanings: string;
  part_of_speech: string;
  choices: string[];
  ex: string;
}

const wordsList: Word[] = [...wordsJson];

async function seed() {
  try {
    console.log("🌱 データベースのシード処理を開始します...");

    // 既存のデータをクリア
    await db.delete(words);
    console.log("✨ テーブルのクリーンアップが完了しました");

    // 新しいデータを一括で挿入するための配列を準備
    const valuesToInsert = wordsList.map((word) => ({
      word: word.word,
      meanings: word.meanings,
      part_of_speech: word.part_of_speech,
      choices: JSON.stringify(word.choices),
      ex: word.ex,
    }));

    // 一括でデータを挿入
    await db.insert(words).values(valuesToInsert);

    console.log(`✅ 成功: ${wordsList.length}個の単語を追加しました`);
    process.exit(0);
  } catch (error) {
    // エラーの詳細をより具体的に表示
    let errorMessage = "不明なエラー";
    if (error instanceof Error) {
      errorMessage = `${error.name}: ${error.message}`;
      if ('cause' in error) {
        errorMessage += `\n原因: ${error.cause}`;
      }
    }
    
    console.error("❌ シード処理に失敗しました:", errorMessage);
    process.exit(1);
  }
}

// メイン処理の実行
seed().catch((error) => {
  let errorMessage = "不明なエラー";
  if (error instanceof Error) {
    errorMessage = `${error.name}: ${error.message}`;
    if ('cause' in error) {
      errorMessage += `\n原因: ${error.cause}`;
    }
  }
  
  console.error("❌ 予期せぬエラーが発生しました:", errorMessage);
  process.exit(1);
});
