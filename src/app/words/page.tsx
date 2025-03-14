import { auth } from "@/auth";
import { WordProgress, ProgressSummary } from "@/components/word-progress";
import { getUserWordProgress, getUserProgressSummary } from "@/db/actions/word-progress";
import { redirect } from "next/navigation";

/**
 * 単語一覧・進捗管理ページ
 */
export default async function WordsPage() {
  // セッションチェック
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // 単語一覧と進捗情報を取得
  const words = await getUserWordProgress(session.user.id);
  const summary = await getUserProgressSummary(session.user.id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">単語学習</h1>
      
      {/* 進捗サマリー */}
      <ProgressSummary summary={summary} />

      {/* 単語リスト */}
      <div className="space-y-4">
        {words.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            単語がまだ登録されていません
          </div>
        ) : (
          words.map((word) => (
            <WordProgress key={word.id} word={word} />
          ))
        )}
      </div>
    </div>
  );
}
