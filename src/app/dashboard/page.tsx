import { auth } from "@/auth";
import { StatsCard } from "@/components/dashboard/stats-card";
import { StudyProgressCards } from "@/components/dashboard/study-progress-cards";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Activity, DailyStat, DashboardStats } from "@/types/dashboard";

async function getStats(): Promise<DashboardStats> {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  // サーバーサイドでの直接データ取得に変更
  const { getUserLearningStats, getDailyStats } = await import(
    "@/db/actions/dashboard"
  );

  const [rawGeneralStats, dailyStats] = await Promise.all([
    getUserLearningStats(session.user.id),
    getDailyStats(session.user.id),
  ]);

  // type assertion
  const generalStats = {
    totalWords: rawGeneralStats.totalWords,
    completedWords: rawGeneralStats.completedWords,
    progressPercentage: rawGeneralStats.progressPercentage,
    quizAccuracy: rawGeneralStats.quizAccuracy,
    recentActivity: rawGeneralStats.recentActivity,
  } as DashboardStats["generalStats"];

  return {
    generalStats,
    dailyStats,
  };
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}

async function DashboardContent() {
  const { generalStats, dailyStats } = await getStats();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={
            <>
              総単語数{" "}
              <span className="text-sm text-gray-500">Total Words</span>
            </>
          }
          value={generalStats.totalWords}
          unit="単語"
        />
        <StatsCard
          title={
            <>
              完了した単語{" "}
              <span className="text-sm text-gray-500">Completed Words</span>
            </>
          }
          value={generalStats.completedWords}
          unit="単語"
        />
        <StatsCard
          title={
            <>
              進捗率 <span className="text-sm text-gray-500">Progress</span>
            </>
          }
          value={Math.round(generalStats.progressPercentage)}
          unit="%"
        />
        <StatsCard
          title={
            <>
              クイズ正解率{" "}
              <span className="text-sm text-gray-500">Quiz Accuracy</span>
            </>
          }
          value={Math.round(generalStats.quizAccuracy)}
          unit="%"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            最近の学習活動
            <span className="text-sm text-gray-500">
              Recent Learning Activities
            </span>
          </h3>
          {/* 詳細ページへのリンク */}
          <a
            href={`/dashboard/details/${
              new Date()
                .toLocaleString("sv-SE", { timeZone: "Asia/Tokyo" })
                .split(" ")[0] //* 日本時間の日付を取得
            }`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            詳細を見る →
          </a>
        </div>
        <div className="space-y-4">
          {generalStats.recentActivity?.map((activity: Activity) => (
            <div
              key={activity.id}
              className="flex justify-between items-center py-2 border-b last:border-b-0"
            >
              <div>
                <p className="font-medium">{activity.word || "Unknown"}</p>
                <p className="text-sm text-gray-500">
                  {activity.activityType === "quiz"
                    ? "クイズ (Quiz)"
                    : "復習 (Review)"}
                  {activity.activityType === "quiz" &&
                    ` - ${
                      activity.result ? "正解 (Correct)" : "不正解 (Incorrect)"
                    }`}
                </p>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(activity.timestamp).toLocaleDateString("ja-JP", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          学習の進捗
          <span className="text-sm text-gray-500">Study Progress</span>
        </h3>
        <StudyProgressCards />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          日別の学習統計
          <span className="text-sm text-gray-500">
            Daily Learning Statistics
          </span>
        </h3>
        <div className="space-y-4">
          {dailyStats.map((stat: DailyStat) => (
            <a
              href={`/dashboard/details/${stat.date}`}
              key={stat.date}
              className="flex justify-between items-center py-2 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div>
                <p className="font-medium">
                  {new Date(stat.date).toLocaleDateString("ja-JP", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  クイズ (Quiz): {stat.quizCount} / 復習 (Review):{" "}
                  {stat.reviewCount}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{stat.correctAnswers}</p>
                <p className="text-sm text-gray-500">正解 (Correct)</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        学習ダッシュボード
        <span className="text-lg text-gray-500">Learning Dashboard</span>
      </h1>
      <Suspense fallback={<LoadingSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
