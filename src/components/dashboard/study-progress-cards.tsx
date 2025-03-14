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
}

export function StudyProgressCards() {
  const [bookmarkedWords, setBookmarkedWords] = useState<WordData[]>([]);
  const [completedWords, setCompletedWords] = useState<WordData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookmarkedRes, completedRes] = await Promise.all([
          fetch('/api/flashcards/bookmarked'),
          fetch('/api/words/completed')
        ]);

        if (!bookmarkedRes.ok || !completedRes.ok) throw new Error('Failed to fetch data');

        const bookmarkedData = await bookmarkedRes.json();
        const completedData = await completedRes.json();

        setBookmarkedWords(bookmarkedData);
        setCompletedWords(completedData);
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
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookMarked className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">メモした単語</h3>
          <span className="ml-auto text-sm text-gray-500">
            {bookmarkedWords.length}語
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
                {word.notes && (
                  <span className="text-xs text-gray-500 mt-1">メモあり</span>
                )}
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

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold">習得済みの単語</h3>
          <span className="ml-auto text-sm text-gray-500">
            {completedWords.length}語
          </span>
        </div>
        <div className="space-y-2">
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
                <span className="text-xs text-green-500 mt-1">
                  習得済み
                </span>
              </div>
            </Link>
          ))}
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
