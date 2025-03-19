"use client";

import { WordProgress, ProgressSummary } from "@/components/word-progress";
import { WordSearch } from "@/components/word-search";
import { Pagination } from "@/components/ui/pagination";

interface Word {
  id: number;
  word: string;
  meanings: string;
  part_of_speech?: string | null;
  complete: number | boolean;
}

interface Summary {
  total: number;
  completed: number;
  percentage: number;
}

interface WordsClientProps {
  initialSummary: Summary;
  initialWords: {
    words: Word[];
    totalPages: number;
    currentPage: number;
  };
  search: string;
}

export function WordsClient({ initialSummary, initialWords, search }: WordsClientProps) {

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">単語学習</h1>
        <WordSearch />
      </div>
      
      {/* 進捗サマリー */}
      <ProgressSummary summary={initialSummary} />

      {/* 単語リスト */}
      <div className="space-y-4">
        {initialWords.words.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            単語がまだ登録されていません
          </div>
        ) : (
          <>
            {initialWords.words.map((word) => (
              <WordProgress key={word.id} word={word} />
            ))}
            
            {/* ページネーション */}
            <Pagination 
              currentPage={initialWords.currentPage}
              totalPages={initialWords.totalPages}
              search={search}
            />
          </>
        )}
      </div>
    </div>
  );
}
