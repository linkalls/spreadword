import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    if (!API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      return NextResponse.json(
        { error: "API Key が設定されていません" },
        { status: 500 }
      );
    }

    const { word } = await request.json();

    if (!word) {
      return NextResponse.json({ error: "単語は必須です" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      英単語「${word}」について以下の情報を日本語で提供してください。以下のJSONフォーマットで返答してください（Markdownなどの記法は使用しないでください）：
      {
        "meanings": "日本語での意味（複数ある場合は最もよく使われる1つだけを記載。カンマは使用しない）",
        "part_of_speech": "品詞（名詞、動詞、形容詞など）最もよく使われるもの1つ",
        "choices": ["誤答1", "誤答2", "誤答3", "正解の日本語意味"],
        "ex": "例文（英語）"
      }
      
      注意事項：
      - choicesは必ず配列形式で返してください
      - choices内の4つの選択肢はランダムな順序で配置してください
      - 選択肢はカンマで区切られた配列として返してください
      - 各選択肢内でカンマを使用しないでください
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      let text = response.text();

      // Markdownのコードブロック記法を取り除く
      text = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();


      try {
        const data = JSON.parse(text);
        // choices が文字列の場合は配列に変換
        if (data.choices && typeof data.choices === "string") {
          try {
            // 文字列からJSONパースを試みる
            data.choices = JSON.parse(data.choices.replace(/'/g, '"'));
          } catch (e) {
            // カンマで分割する
            console.error("Error parsing choices:", e);
            data.choices = data.choices.split(/,\s*/);
          }
        }
        console.log("AI response:", data);
        return NextResponse.json(data);
      } catch (parseError) {
        console.error("Error parsing AI response:", text);
        console.error("Parse error:", parseError);
        return NextResponse.json(
          { error: "AI APIの応答が不正なフォーマットでした" },
          { status: 500 }
        );
      }
    } catch (e) {
      console.error("Error with Gemini API:", e);
      return NextResponse.json(
        { error: "AI APIの呼び出しに失敗しました" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating word info:", error);
    return NextResponse.json(
      { error: "単語情報の生成に失敗しました" },
      { status: 500 }
    );
  }
}
