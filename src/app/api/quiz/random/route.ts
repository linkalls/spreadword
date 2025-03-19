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

    // ユーザーIDを取得
    const userId = session.user.id;
    if (!userId) {
      return Response.json({ error: "User ID not found" }, { status: 401 });
    }

    // console.log("userIdだよ", userId);

    // クエリパラメータから単語数を取得（デフォルト4）
    const count = Number(req.nextUrl.searchParams.get("count")) || 4;

    // ユーザーに適した単語を取得
    const words = await getRandomWords(userId, count);
    console.log("wordsだよ", words);

    return Response.json(words); //* {words}にしちゃったら再展開がいるよね
  } catch (error) {
    console.error("Error getting random words:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
