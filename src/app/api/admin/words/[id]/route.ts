import { db } from "@/db/dbclient";
import { words } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/app/admin/adminRoleFetch";

// 単語を更新
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const adminRole = await isAdmin(session!);

  if (!session?.user || !adminRole) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { word, meanings, part_of_speech, choices, ex } = body;
    const {id:id1} = await params;
    const id = parseInt(id1);

    // 必須フィールドの検証
    if (!word || !meanings) {
      return new NextResponse("Word and meanings are required", { status: 400 });
    }

    const updatedWord = await db
      .update(words)
      .set({
        word,
        meanings,
        part_of_speech,
        choices,
        ex,
      })
      .where(eq(words.id, id))
      .returning();

    if (updatedWord.length === 0) {
      return new NextResponse("Word not found", { status: 404 });
    }

    return NextResponse.json(updatedWord[0]);
  } catch (error) {
    console.error("Error updating word:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// 単語を削除
// この削除操作により、以下の関連レコードも自動的に削除されます（cascade delete）：
// - userWords: ユーザーと単語の関連
// - learningHistory: 学習履歴
// - quizResults: クイズ結果
// - wordListItems: 単語リストの項目
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const adminRole = await isAdmin(session!);

  if (!session?.user || !adminRole) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const {id:id1} = await params;
    const id = parseInt(id1);
    const deletedWord = await db
      .delete(words)
      .where(eq(words.id, id))
      .returning();


    if (deletedWord.length === 0) {
      return new NextResponse("Word not found", { status: 404 });
    }

    return NextResponse.json(deletedWord[0]);
  } catch (error) {
    console.error("Error deleting word:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
