import { auth } from "@/auth";
import { getRandomWordsFromList } from "@/db/actions/quiz";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ユーザーIDを取得
    const userId = session.user.id;
    if (!userId) {
      return Response.json({ error: "User ID not found" }, { status: 401 });
    }

    const {id:listId} = await params;
    // リストIDを数値に変換
  
    if (!listId) {
      return Response.json(
        { error: "Invalid list ID" },
        { status: 400 }
      );
    }

    // クエリパラメータから単語数を取得（デフォルト4）
    const count = Number(req.nextUrl.searchParams.get("count")) || 4;

    // リストから単語を取得
    const words = await getRandomWordsFromList(userId, listId, count);

    return Response.json({ words });
  } catch (error) {
    console.error("Error getting random words from list:", error);
    if (error instanceof Error && error.message === "List is empty") {
      return Response.json(
        { error: "List is empty" },
        { status: 400 }
      );
    }
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
