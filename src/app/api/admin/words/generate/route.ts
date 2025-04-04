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
        "meanings": "日本語での意味（複数ある場合は最もよく使われる1つを）",
        "part_of_speech": "品詞（名詞、動詞、形容詞など）最もよく使われるもの1つ",
        "choices": "クイズ用の誤った選択肢を3つとmeaningsであげた物を一つ（カンマ区切り）",
        "ex": "例文（英語）"
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      let text = response.text();

      // Markdownのコードブロック記法を取り除く
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      try {
        const data = JSON.parse(text);
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
