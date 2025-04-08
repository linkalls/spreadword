import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { word } = await request.json();
    
    if (!word) {
      return NextResponse.json(
        { message: "単語を入力してください" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { message: "API Keyが設定されていません" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    try {
      const data = JSON.parse(text);
      // choices が文字列の場合は配列に変換
      if (data.choices && typeof data.choices === "string") {
        try {
          data.choices = JSON.parse(data.choices.replace(/'/g, '"'));
        } catch (e) {
          console.error("Error parsing choices:", e);
          data.choices = data.choices.split(/,\s*/);
        }
      }
      return NextResponse.json({ word: data });
    } catch (parseError) {
      console.error("Error parsing AI response:", text);
      console.error("Parse error:", parseError);
      return NextResponse.json(
        { message: "AI APIの応答が不正なフォーマットでした" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Word generation error:", error);
    return NextResponse.json(
      { message: "単語の生成に失敗しました" },
      { status: 500 }
    );
  }
}