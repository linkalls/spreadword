import { auth } from "@/auth";
import { getUserWordLists } from "@/db/actions/word-lists";
import { Suspense } from "react";
import { WordListClient } from "./word-list-client";
import SearchPublicLists from "@/components/word-list/search-public-lists";

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

      <div className="space-y-8 max-w-5xl mx-auto">
        <section>
          <h2 className="text-xl font-semibold mb-4">パブリックリストを探す</h2>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <Suspense fallback={<div>検索機能を読み込み中...</div>}>
              <SearchPublicLists />
            </Suspense>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">マイリスト</h2>
          <div className="bg-white rounded-lg shadow-sm p-4">
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
        </section>
      </div>
    </div>
  );
}
