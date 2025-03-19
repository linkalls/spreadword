import { db } from "@/db/dbclient";
import { userWords } from "@/db/schema";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
const {id} = await params
    const wordId = parseInt(id);
    if (isNaN(wordId)) {
      return new NextResponse("Invalid word ID", { status: 400 });
    }

    // ユーザーの単語完了状態を更新
    await db
      .insert(userWords)
      .values({
        userId: session.user.id,
        wordId: wordId,
        complete: 1,
      })
      .onConflictDoUpdate({
        target: [userWords.userId, userWords.wordId],
        set: { complete: 1 },
      });

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error completing flashcard:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
