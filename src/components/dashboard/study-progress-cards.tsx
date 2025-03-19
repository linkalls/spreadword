'use client';

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookMarked, CheckCircle } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";

interface WordData {
  id: number;
  word: string;
  meanings: string;
  part_of_speech: string | null;
  notes?: string | null;
  mistakeCount?: number;
  bookmarked?: number;
  complete?: number;
}

interface QuizStats {
  total: number;
  correct: number;
  accuracy: number;
}

interface DashboardStats {
  bookmarkedWords: WordData[];
  completedWords: WordData[];
  quizStats: QuizStats;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
};

export function StudyProgressCards() {
  const { data, error, isLoading } = useSWR<DashboardStats>(
    '/api/dashboard/stats',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1分間キャッシュを保持
    }
  );

  if (error) return <div>エラーが発生しました</div>;
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4 sm:p-6">
          <div className="space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </Card>
        <Card className="p-4 sm:p-6">
          <div className="space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { bookmarkedWords, completedWords, quizStats } = data;
  console.log("bookmarkedWords:",bookmarkedWords,"compltedWords:", completedWords, "quizStats:",quizStats);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* ブックマーク一覧 */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <BookMarked className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
          <h3 className="text-base sm:text-lg font-semibold">ブックマーク</h3>
          <span className="ml-auto text-sm text-gray-500 flex items-center gap-2">
            <span>{bookmarkedWords.length}語</span>
            {bookmarkedWords.filter(w => w.notes).length > 0 && (
              <span className="text-xs text-gray-400">
                ({bookmarkedWords.filter(w => w.notes).length}件のメモ)
              </span>
            )}
          </span>
        </div>
        <div className="space-y-2">
          {bookmarkedWords.slice(0, 5).map((word) => (
            <Link
              key={word.id}
              href={`/flashcards/${word.id}`}
              className="block p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0">
                <div>
                  <span className="text-sm sm:text-base font-medium">{word.word}</span>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">{word.meanings}</p>
                </div>
                <div className="text-xs mt-1 space-x-2">
                  {word.notes && (
                    <span className="text-gray-500">メモあり</span>
                  )}
                  {(word.mistakeCount !== undefined && word.mistakeCount <= -3) || word.complete === 1 ? (
                    <span className="text-green-500">習得済み</span>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
          {bookmarkedWords.length > 5 && (
            <div className="pt-2 text-center">
              <Link
                href="/flashcards"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                すべて表示 ({bookmarkedWords.length}語)
              </Link>
            </div>
          )}
        </div>
      </Card>

      {/* 習得済みの単語カード */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
          <h3 className="text-base sm:text-lg font-semibold">習得済みの単語</h3>
          <span className="ml-auto text-sm text-gray-500">
            {completedWords.length}語
          </span>
        </div>
        <div className="space-y-2">
          {/* 単語リスト */}
          {completedWords.slice(0, 5).map((word) => (
            <Link
              key={word.id}
              href={`/words/${word.id}`}
              className="block p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0">
                <div>
                  <span className="text-sm sm:text-base font-medium">{word.word}</span>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">{word.meanings}</p>
                </div>
                <div className="text-xs mt-1 space-x-2">
                  {word.bookmarked === 1 && (
                    <span className="text-blue-500">ブックマーク</span>
                  )}
                  {word.notes && (
                    <span className="text-gray-500">メモあり</span>
                  )}
                  {word.mistakeCount && (
                    <span className="text-gray-400">{Math.abs(word.mistakeCount)}回連続正解</span>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {/* クイズの統計情報 */}
          {quizStats && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">クイズの成績</h4>
              <div className="text-xs sm:text-sm text-gray-600">
                <p>総回答数: {quizStats.total}回</p>
                <p>正解数: {quizStats.correct}回</p>
                <p>正答率: {quizStats.accuracy.toFixed(1)}%</p>
              </div>
            </div>
          )}

          {/* もっと見るリンク */}
          {completedWords.length > 5 && (
            <div className="pt-2 text-center">
              <Link
                href="/words"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                すべて表示 ({completedWords.length}語)
              </Link>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
