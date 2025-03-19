/**
 * 単語進捗管理コンポーネント
 * 単語の完了状態の表示と切り替えを行います
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface WordProgressProps {
  word: {
    id: number;
    word: string;
    meanings: string;
    part_of_speech?: string | null;
    complete: boolean | number;
  };
}

export function WordProgress({ word }: WordProgressProps) {
  const router = useRouter();
  const [isComplete, setIsComplete] = useState(word.complete);
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * 進捗状態を更新する
   */
  async function toggleComplete() {
    setIsUpdating(true);
    try {
      const response = await fetch("/api/words/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wordId: word.id,
          complete: !isComplete,
        }),
      });

      if (!response.ok) {
        throw new Error("更新に失敗しました");
      }

      setIsComplete(!isComplete);
      router.refresh(); // ページを更新して最新の進捗状況を反映
    } catch (error) {
      console.error("Failed to update progress:", error);
      alert("進捗の更新に失敗しました");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <Link href={`/words/${word.id}`} className="flex-1">
        <div>
          <h3 className="text-lg font-medium">{word.word}</h3>
          <p className="text-gray-600">{word.meanings}</p>
          {word.part_of_speech && (
            <span className="text-sm text-gray-500">{word.part_of_speech}</span>
          )}
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleComplete();
        }}
        disabled={isUpdating}
        className={`
        ml-4 px-4 py-2 rounded-full font-medium
        ${
          isComplete
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
      `}
      >
        {isUpdating ? "更新中..." : isComplete ? "✓ 完了" : "未完了"}
      </button>
    </div>
  );
}

/**
 * 進捗サマリーコンポーネント
 * 全体の進捗状況を表示します
 */
interface ProgressSummaryProps {
  summary: {
    total: number;
    completed: number;
    percentage: number;
  };
}

export function ProgressSummary({ summary }: ProgressSummaryProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-xl font-bold mb-3">学習進捗</h2>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${summary.percentage}%` }}
            />
          </div>
        </div>
        <div className="text-right">
          <span className="font-medium">
            {summary.completed} / {summary.total}
          </span>
          <span className="text-gray-500 ml-2">
            ({Math.round(summary.percentage)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
