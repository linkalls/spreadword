import { notFound } from "next/navigation";
import { db } from "@/db/dbclient";
import { wordLists } from "@/db/schema";
import { eq } from "drizzle-orm";
import { WordListDetailClient } from "@/app/wordlists/[id]/word-list-detail-client";
import { auth } from "@/auth";
import { getWordsInList } from "@/db/actions/word-lists";

interface Props {
  params: Promise<{
    shareId: string;
  }>;
}

/**
 * 共有された単語リストページ
 */
export default async function SharedWordListPage({ params }: Props) {
  const session = await auth();

  const { shareId } = await params;

  // 単語リストを取得
  const list = await db.query.wordLists.findFirst({
    where: eq(wordLists.shareId, shareId),
  });

  // リストが存在しないか、非公開の場合は404
  if (!list || !list.isPublic) {
    notFound();
  }

  // リストに含まれる単語を取得
  const words = await getWordsInList(list.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <WordListDetailClient
        list={list}
        words={words}
        isOwner={session?.user?.id === list.userId}
      />
    </div>
  );
}
