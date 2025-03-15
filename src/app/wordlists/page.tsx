import { auth } from "@/auth";
import { getUserWordLists } from "@/db/actions/word-lists";
import { Suspense } from "react";
import { WordListClient } from "./word-list-client";

/**
 * 単語リスト一覧を取得するサーバーコンポーネント
 */
async function WordListContent() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="text-center py-8">
        <p className="text-lg">ログインしてください</p>
      </div>
    );
  }

  const lists = await getUserWordLists(session.user.id);
  return <WordListClient lists={lists} />;
}

export default function WordListsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">単語リスト</h1>
        <p className="mt-2 text-gray-600">
          自分だけの単語リストを作成して学習を効率化しましょう。
        </p>
      </div>

      <Suspense
        fallback={
          <div className="text-center py-8">
            <p>読み込み中...</p>
          </div>
        }
      >
        <WordListContent />
      </Suspense>
    </div>
  );
}
