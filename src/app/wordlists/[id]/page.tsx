import { Suspense } from "react";
import { auth } from "@/auth";
import { getWordList, getWordsInList } from "@/db/actions/word-lists";
import { WordListDetailClient } from "@/app/wordlists/[id]/word-list-detail-client";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

/**
 * 単語リストの詳細を取得するサーバーコンポーネント
 */
async function WordListDetailContent({ listId }: { listId: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="text-center py-8">
        <p className="text-lg">ログインしてください</p>
      </div>
    );
  }

  // リストの基本情報を取得
  const list = await getWordList(listId);
  if (!list) {
    redirect("/wordlists"); // リストが見つからない場合は一覧へリダイレクト
  }

  // プライベートリストの場合、所有者のみアクセス可能
  if (!list.isPublic && list.userId !== session.user.id) {
    redirect("/wordlists"); // 権限がない場合は一覧へリダイレクト
  }

  // リストに含まれる単語を取得（ユーザーの進捗情報も含める）
  const words = await getWordsInList(listId, session.user.id);

  return (
    <>
    <WordListDetailClient
      list={list}
      words={words}
      isOwner={list.userId === session.user.id}
    />
     
                    </>
  );
}

export default async function WordListDetailPage({ params }: Props) {
  const { id } = await params;
  const listId = id;

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="text-center py-8">
            <p>読み込み中...</p>
          </div>
        }
      >
        <WordListDetailContent listId={listId} />
      </Suspense>
    </div>
  );
}
