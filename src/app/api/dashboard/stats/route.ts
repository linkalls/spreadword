import { auth } from "@/auth";
import { getUserLearningStats, getDailyStats } from "@/db/actions/dashboard";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // クエリパラメータから日数を取得（デフォルト7日）
    const days = Number(req.nextUrl.searchParams.get("days")) || 7;

    // 学習統計情報を取得
    const [generalStats, dailyStats] = await Promise.all([
      getUserLearningStats(session.user.id),
      getDailyStats(session.user.id, days),
    ]);

    return Response.json({
      generalStats,
      dailyStats,
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
