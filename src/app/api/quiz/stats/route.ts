import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getQuizStats } from "@/db/actions/quiz-progress";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const stats = await getQuizStats(session.user.id);
    if (!stats) {
      return NextResponse.json(
        { error: "クイズの統計情報の取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching quiz stats:", error);
    return NextResponse.json(
      { error: "クイズの統計情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}
