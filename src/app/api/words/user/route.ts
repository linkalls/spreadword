import { auth } from "@/auth";
import {
  getUserWordProgress,
  getUserProgressSummary,
} from "@/db/actions/word-progress";
import { NextResponse } from "next/server";

/**
 * ユーザーの単語一覧と進捗状況を取得するAPI
 * GET /api/words/user
 */
export async function GET() {
  try {
    // セッションを確認
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // 単語一覧と進捗情報を取得
    const words = await getUserWordProgress(session.user.id);
    const summary = await getUserProgressSummary(session.user.id);

    return NextResponse.json({
      words,
      summary,
    });
  } catch (error) {
    console.error("Failed to fetch user words:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
