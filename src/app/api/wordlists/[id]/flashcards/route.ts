import { auth } from "@/auth";
import { db } from "@/db/dbclient";
import { wordLists } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    // 単語リストIDから単語を取得
    const wordList = await db.query.wordLists.findFirst({
      where: eq(wordLists.id, id),
      with: {
        items: {
          with: {
            word: true
          }
        }
      }
    });

    if (!wordList) {
      return new NextResponse("Word list not found", { status: 404 });
    }

    // フラッシュカード用のデータ形式に変換
    const flashcards = wordList.items.map((item) => ({
      id: item.word.id,
      word: item.word.word,
      meanings: item.word.meanings,
      part_of_speech: item.word.part_of_speech,
      ex: item.word.ex,
    }));

    return NextResponse.json(flashcards);
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
