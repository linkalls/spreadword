import { auth } from "@/auth";
import { getRandomWords } from "@/db/actions/quiz";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // クエリパラメータから単語数を取得（デフォルト4）
    const count = Number(req.nextUrl.searchParams.get("count")) || 4;

    // ランダムな単語を取得
    const words = await getRandomWords(count);

    return Response.json({ words });
  } catch (error) {
    console.error("Error getting random words:", error);
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
