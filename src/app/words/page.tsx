import { auth } from "@/auth";
import {
  getUserProgressSummary,
  getUserWordProgress,
} from "@/db/actions/word-progress";
import { redirect } from "next/navigation";
import { WordsClient } from "./words-client";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * 単語一覧・進捗管理ページ
 */
export default async function WordsPage({ searchParams }: PageProps) {
  // セッションチェック
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // URLパラメータを取得（non-nullアサーションを避ける）
  const { page: pageParam, search: searchParam } = await searchParams;

  const page =
    typeof pageParam === "string" ? Math.max(1, parseInt(pageParam)) : 1;
  const search = typeof searchParam === "string" ? searchParam : "";

  console.log("[Server] WordsPage rendering");
  try {
    // サーバーサイドでデータを取得
    const [words, summary] = await Promise.all([
      getUserWordProgress(session.user.id, page, 20, search),
      getUserProgressSummary(session.user.id),
    ]);

    console.log("[Server] Data fetched successfully");

    return (
      <WordsClient
        initialWords={words}
        initialSummary={summary}
        search={search}
      />
    );
  } catch (error) {
    console.error("Failed to fetch word data:", error);
    redirect("/words");
  }
}
