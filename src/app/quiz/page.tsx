'use client';

import { QuizCard } from "@/components/quiz/quiz-card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Word {
  id: number;
  word: string;
  meanings: string;
  choices?: string;
}

interface Choice {
  text: string;
  isCorrect: boolean;
}

export default function QuizPage() {
  const router = useRouter();
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ランダムな単語を取得する関数
  const fetchRandomWord = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/quiz/random");
      if (!response.ok) {
        throw new Error("単語の取得に失敗しました");
      }
      const data = await response.json();
      const word = data.words[0]; // 最初の単語を使用

      // 選択肢を生成
      let quizChoices: Choice[] = [];
      if (word.choices) {
        // choices文字列をパースしてシャッフル
        const allChoices = JSON.parse(word.choices);
        quizChoices = allChoices.map((choice: string) => ({
          text: choice,
          isCorrect: choice === word.meanings,
        }));
      } else {
        // ダミーの選択肢を生成（実際のアプリではより良い選択肢生成ロジックが必要）
        quizChoices = [
          { text: word.meanings, isCorrect: true },
          { text: "ダミー選択肢1", isCorrect: false },
          { text: "ダミー選択肢2", isCorrect: false },
          { text: "ダミー選択肢3", isCorrect: false },
        ];
      }

      // 選択肢をシャッフル
      quizChoices.sort(() => Math.random() - 0.5);

      setCurrentWord(word);
      setChoices(quizChoices);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomWord();
  }, []);

  // 回答処理
  const handleAnswer = async (
    wordId: number,
    selectedChoice: string,
    isCorrect: boolean,
    next?: boolean
  ) => {
    try {
      if (!next) {
        // 結果を保存
        await fetch("/api/quiz/result", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wordId,
            selectedChoice,
            isCorrect,
          }),
        });
      } else {
        // 次の問題を表示
        fetchRandomWord();
      }
    } catch (error) {
      console.error("Failed to save quiz result:", error);
    }
  };

  // ローディング表示
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">問題を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchRandomWord}
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
        <h1 className="text-2xl font-bold text-gray-900 mb-8">単語クイズ</h1>
        {currentWord && (
          <QuizCard
            word={currentWord.word}
            wordId={currentWord.id}
            choices={choices}
            onAnswer={handleAnswer}
          />
        )}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    </div>
  );
}
