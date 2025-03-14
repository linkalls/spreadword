import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Gemini APIの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * 指定された単語リストを使用して例文を生成するためのプロンプトを作成
 */
function createPrompt(words: string[]): string {
  return `
次の英単語をすべて使用して、ストーリー性のある長文（約20行程度）を作成し、その日本語訳も提供してください:
単語: ${words.join(", ")}

条件:
- 提供された単語を全て少なくとも1回は使用すること
- 文章はストーリー性があり、一貫した内容にすること
- 日常生活を題材にすること
- The sentences must be grammatically correct and easy to read for junior high school.
- 自然な文脈で単語を使用すること
- 翻訳は自然な日本語にすること
- 大学受験レベルの英語力を想定してください
- 以下の形式のJSONで出力してください:

{
  "English": "ここに英文を書く（複数段落可）",
  "Japanese": "ここに日本語訳を書く（複数段落可）"
}`;
}

export async function POST(request: Request) {
  try {
    const { words, prompt = null } = await request.json();

    if (!Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: "words must be a non-empty array" },
        { status: 400 }
      );
    }

    // Gemini モデルの取得と設定
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // プロンプトの生成と実行
    let text;
    if (prompt) {
      console.log("Using custom prompt:", prompt);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text();
    }else{
    const result = await model.generateContent(createPrompt(words));
    const response = await result.response;
    text = response.text();
    }

    try {
      // テキストからJSONを抽出して解析
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("JSON not found in response");
      }
      const data = JSON.parse(jsonMatch[0]);

      // レスポンスの検証
      if (!data.English || !data.Japanese) {
        throw new Error("Invalid response format");
      }

      return NextResponse.json({
        English: data.English.trim(),
        Japanese: data.Japanese.trim(),
      });
    } catch (error) {
      console.error("Failed to parse Gemini response:", error);
      return NextResponse.json(
        { error: "Failed to generate examples" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
