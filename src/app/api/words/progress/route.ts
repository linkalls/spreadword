import { auth } from "@/auth";
import { updateWordProgress } from "@/db/actions/word-progress";
import { NextResponse } from "next/server";

/**
 * 単語の進捗状態を更新するAPI
 * POST /api/words/progress
 */
export async function POST(request: Request) {
  try {
    // セッションを確認
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // リクエストボディを取得
    const body = await request.json();
    const { wordId, complete } = body;

    // パラメータの検証
    if (typeof wordId !== "number" || typeof complete !== "boolean") {
      return NextResponse.json(
        { error: "無効なパラメータです" },
        { status: 400 }
      );
    }

    // 進捗を更新
    const success = await updateWordProgress(
      session.user.id,
      wordId,
      complete
    );

    if (success) {
      return NextResponse.json({ status: "success" });
    } else {
      return NextResponse.json(
        { error: "更新に失敗しました" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
