"use client";

import { QuizCard } from "@/components/quiz/quiz-card";
import { QuizLoading } from "@/components/quiz/quiz-loading";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface QuizWord {
  id: number;
  word: string;
  meanings: string;
  choices: string[];
  ex?: string;
  bookmarked?: number;
  notes?: string;
}

export default function QuizPage() {
  const router = useRouter();
  const { status } = useSession();
  const [currentWord, setCurrentWord] = useState<QuizWord | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [words, setWords] = useState<QuizWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // セッションチェック
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const searchParams = useSearchParams();
  const listId = searchParams?.get("list");
  console.log("listId", listId);

  // リストから単語を取得する関数
  const fetchListWord = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        listId
          ? `/api/wordlists/${listId}/quiz` // リストIDがある場合はリストの単語を取得
          : "/api/quiz/random" // ない場合はランダムな単語を取得
      );
      if (!response.ok) {
        throw new Error("単語の取得に失敗しました");
      }
      const words = await response.json();
      console.log("words", words);
      if (!words || !Array.isArray(words) || words.length === 0) {
        throw new Error("単語が見つかりませんでした");
      }

      // 全ての単語を保存
      setWords(words);
      
      // 最初の単語を問題として使用
      if (words.length === 0) {
        throw new Error("単語が見つかりませんでした");
      }
      
      setCurrentWord(words[0]);
      setCurrentQuestionIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchListWord = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          listId
            ? `/api/wordlists/${listId}/quiz` // リストIDがある場合はリストの単語を取得
            : "/api/quiz/random" // ない場合はランダムな単語を取得
        );
        if (!response.ok) {
          throw new Error("単語の取得に失敗しました");
        }
        const words = await response.json();
        console.log("words", words);
        if (!words || !Array.isArray(words) || words.length === 0) {
          throw new Error("単語が見つかりませんでした");
        }
  
        // 全ての単語を保存
        setWords(words);
        
        // 最初の単語を問題として使用
        if (words.length === 0) {
          throw new Error("単語が見つかりませんでした");
        }
        
        setCurrentWord(words[0]);
        setCurrentQuestionIndex(0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };
    if (status === "authenticated") {
      fetchListWord();
    }
  }, [status,listId]);

  // 回答処理
  const handleAnswer = async (isCorrect: boolean, selectedChoice: string) => {
    try {
      if (!currentWord) return;

      // 結果を保存
      await fetch("/api/quiz/result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wordId: currentWord.id,
          selectedChoice,
          isCorrect,
        }),
      });

          // 結果を保存するだけで、遷移は「次の問題へ」ボタンで行う
    } catch (error) {
      console.error("Failed to save quiz result:", error);
    }
  };

  // ローディング表示
  if (isLoading || status === "loading") {
    return <QuizLoading />;
  }

  // エラー表示
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchListWord}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  // クイズ表示
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          {listId ? "リスト単語クイズ" : "ランダム単語クイズ"}
        </h1>
        {currentWord && (
          <QuizCard
            question={currentWord}
            onAnswer={handleAnswer}
            onComplete={() => router.push('/dashboard')}
            onNext={() => {
              const nextIndex = currentQuestionIndex + 1;
              setCurrentQuestionIndex(nextIndex);
              setCurrentWord(words[nextIndex]);
            }}
            isLast={currentQuestionIndex === words.length - 1}
          />
        )}
        <div className="mt-8 text-center">
          <button
            onClick={() =>
              listId
                ? router.push(`/wordlists/${listId}`)
                : router.push("/dashboard")
            }
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    </div>
  );
}
