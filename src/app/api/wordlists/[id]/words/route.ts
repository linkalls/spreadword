import { auth } from "@/auth";
import { getWordsInList } from "@/db/actions/word-lists";
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
    const {id} = await params
    const words = await getWordsInList(id, session.user.id);
    return NextResponse.json(words);
  } catch (error) {
    console.error("Error fetching words:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
