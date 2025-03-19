import { auth } from "@/auth";
import { db } from "@/db/dbclient";
import { userWords, words } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
const {id} = await params
    const wordId = parseInt(id);
    if (isNaN(wordId)) {
      return Response.json({ error: "Invalid word ID" }, { status: 400 });
    }

    // 単語の詳細情報を取得（ユーザー固有のデータを含む）
    const word = await db
      .select({
        id: words.id,
        word: words.word,
        meanings: words.meanings,
        part_of_speech: words.part_of_speech,
        ex: words.ex,
        bookmarked: userWords.bookmarked,
        notes: userWords.notes,
        complete: userWords.complete,
      })
      .from(words)
      .leftJoin(
        userWords,
        and(
          eq(words.id, userWords.wordId),
          eq(userWords.userId, session.user.id)
        )
      )
      .where(eq(words.id, wordId))
      .get();

    if (!word) {
      return Response.json({ error: "Word not found" }, { status: 404 });
    }

    return Response.json(word);
  } catch (error) {
    console.error("Error fetching word:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
