import { auth } from "@/auth";
import { db } from "@/db/dbclient";
import { userWords } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { wordId, notes } = await request.json();
    if (!wordId) {
      return NextResponse.json({ error: "単語IDが必要です" }, { status: 400 });
    }

    const userId = session.user.id;
    const trimmedNotes = notes.trim();

    // 既存のレコードを確認
    const existingRecord = await db
      .select()
      .from(userWords)
      .where(and(eq(userWords.userId, userId), eq(userWords.wordId, wordId)))
      .get();

    if (existingRecord) {
      // レコードが存在する場合はUPDATE
      // notesがある場合は自動的にブックマークを1に設定
      await db
        .update(userWords)
        .set({ 
          notes: trimmedNotes,
          bookmarked: trimmedNotes ? 1 : 0
        })
        .where(and(eq(userWords.userId, userId), eq(userWords.wordId, wordId)));
    } else {
      // レコードが存在しない場合はINSERT
      await db.insert(userWords).values({
        userId: userId,
        wordId: wordId,
        notes: trimmedNotes,
        bookmarked: trimmedNotes ? 1 : 0
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json(
      { error: "ノートの保存に失敗しました" },
      { status: 500 }
    );
  }
}
