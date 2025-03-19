import { auth } from "@/auth";
import { db } from "@/db/dbclient";
import { wordListItems, words } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // URLSearchParamsを使用してクエリパラメータを取得
  const { searchParams } = new URL(request.url);
  const count = Number(searchParams.get("count")) || 10; // デフォルトは10問
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: listId } = await params;
    // console.log("listId",listId)

    // リスト内の単語を取得
    const listItems = await db
      .select({
        wordId: wordListItems.wordId,
      })
      .from(wordListItems)
      .where(eq(wordListItems.listId, listId));

    const wordIds = listItems.map((item) => item.wordId);
    if (wordIds.length === 0) {
      return new NextResponse("No words in list", { status: 404 });
    }

    // リスト内の単語の詳細情報を取得（選択肢を含む）
    const wordsList = await db
      .select({
        id: words.id,
        word: words.word,
        meanings: words.meanings,
        part_of_speech: words.part_of_speech,
        choices: words.choices,
        ex: words.ex,
      })
      .from(words)
      .where(inArray(words.id, wordIds));

    // 選択肢が文字列の場合は配列に変換
    const wordsWithParsedChoices = wordsList.map((word) => ({
      ...word,
      choices: word.choices ? JSON.parse(word.choices) : [word.meanings],
    }));

    // ランダムに指定された数の問題を選択
    const selectedWords = wordsWithParsedChoices
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
      .slice(0, count);

    return new NextResponse(JSON.stringify(selectedWords), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
