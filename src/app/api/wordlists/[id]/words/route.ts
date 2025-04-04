import { auth } from "@/auth";
import { getWordsInList, addWordToList } from "@/db/actions/word-lists";
import { NextRequest, NextResponse } from "next/server";

/**
 * 単語リストの単語一覧を取得するエンドポイント
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const {id} = await params;
    const words = await getWordsInList(id, session.user.id);
    return NextResponse.json(words);
  } catch (error) {
    console.error("Error fetching words:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * 単語リストに単語を追加するエンドポイント
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id: listId } = await params;
    const { wordId, notes } = await req.json();

    if (!wordId || typeof wordId !== "number") {
      return new NextResponse("Invalid wordId", { status: 400 });
    }

    const success = await addWordToList({
      listId,
      userId: session.user.id,
      wordId,
      notes,
    });

    if (!success) {
      return new NextResponse("Word already exists in list or list not found", { status: 400 });
    }

    return new NextResponse(null, { status: 201 });
  } catch (error) {
    console.error("Error adding word to list:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
