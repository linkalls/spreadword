'use client';

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { BookMarked, CheckCircle } from "lucide-react";

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

export function StudyProgressCards() {
  const [bookmarkedWords, setBookmarkedWords] = useState<WordData[]>([]);
  const [completedWords, setCompletedWords] = useState<WordData[]>([]);
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 並行でデータを取得
        const [bookmarkedRes, completedRes, quizStatsRes] = await Promise.all([
          fetch('/api/flashcards/bookmarked'),
          fetch('/api/words/completed'),
          fetch('/api/quiz/stats')
        ]);

        if (!bookmarkedRes.ok || !completedRes.ok || !quizStatsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const bookmarkedData = await bookmarkedRes.json();
        const completedData = await completedRes.json();
        const quizStatsData = await quizStatsRes.json();

        setBookmarkedWords(bookmarkedData);
        setCompletedWords(completedData);
        setQuizStats(quizStatsData);
      } catch (error) {
        console.error('Error fetching study progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* ブックマーク一覧 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookMarked className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">ブックマーク</h3>
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
              className="block p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium">{word.word}</span>
                  <p className="text-sm text-gray-600 mt-1">{word.meanings}</p>
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
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold">習得済みの単語</h3>
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
              className="block p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium">{word.word}</span>
                  <p className="text-sm text-gray-600 mt-1">{word.meanings}</p>
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
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">クイズの成績</h4>
              <div className="text-sm text-gray-600">
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
