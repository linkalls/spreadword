import { auth } from "@/auth";
import { ClientWordDetail } from "@/components/word-detail/client-word-detail";
import { db } from "@/db/dbclient";
import { words as wordsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

/**
 * 単語詳細ページ
 * URLパラメータで指定された単語の詳細情報を表示し、
 * Gemini APIを使用して例文を生成する機能を提供します。
 */
export default async function WordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // 単語の詳細情報を取得
  const word = await db
    .select()
    .from(wordsTable)
    .where(eq(wordsTable.id, parseInt(id)));

  // 単語が見つからない場合は一覧ページにリダイレクト
  if (!word || word.length === 0) {
    redirect("/words");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ClientWordDetail
        initialWord={{
          id: word[0].id,
          word: word[0].word,
          meanings: word[0].meanings,
          mistakeCount: 0, // ここは後でスキーマを更新して対応
          lastMistakeDate: new Date(), // ここは後でスキーマを更新して対応
        }}
      />
    </div>
  );
}
