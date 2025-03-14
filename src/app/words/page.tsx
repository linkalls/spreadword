import { auth } from "@/auth";
import { WordProgress, ProgressSummary } from "@/components/word-progress";
import { getUserWordProgress, getUserProgressSummary } from "@/db/actions/word-progress";
import { redirect } from "next/navigation";

/**
 * 単語一覧・進捗管理ページ
 */
export default async function WordsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  // セッションチェック
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const {page} = await searchParams;

  // 現在のページ番号を取得（デフォルトは1）
  const currentPage = page ? parseInt(page) : 1;
  
  // 単語一覧と進捗情報を取得
  const { words, totalPages } = await getUserWordProgress(session.user.id, currentPage);
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
          <>
            {words.map((word) => (
              <WordProgress key={word.id} word={word} />
            ))}
            
            {/* ページネーション */}
            <div className="flex justify-center items-center space-x-2 mt-8">
              {currentPage > 1 && (
                <a
                  href={`/words?page=${currentPage - 1}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  前へ
                </a>
              )}
              <span className="text-gray-600">
                {currentPage} / {totalPages} ページ
              </span>
              {currentPage < totalPages && (
                <a
                  href={`/words?page=${currentPage + 1}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  次へ
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
