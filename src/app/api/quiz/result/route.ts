import { auth } from "@/auth";
import { saveQuizProgress } from "@/db/actions/quiz-progress";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // リクエストボディを取得
    const body = await req.json();
    const { wordId, selectedChoice, isCorrect } = body;

    // バリデーション
    if (
      typeof wordId !== "number" ||
      typeof selectedChoice !== "string" ||
      typeof isCorrect !== "boolean"
    ) {
      return Response.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    // クイズ結果を保存
    const result = await saveQuizProgress(
      session.user.id,
      wordId,
      selectedChoice,
      isCorrect
    );

    if (!result) {
      return Response.json(
        { error: "Failed to save quiz result" },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error saving quiz result:", error);
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
