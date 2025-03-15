"use client";
import Link from "next/link";
import { useState } from "react";

interface DemoWord {
  id: number;
  word: string;
  meaning: string;
  example: string;
}

const demoWords: DemoWord[] = [
  {
    id: 1,
    word: "innovation",
    meaning: "革新、新機軸",
    example: "The company is known for its continuous innovation in technology.",
  },
  {
    id: 2,
    word: "sustainable",
    meaning: "持続可能な",
    example: "We need to find sustainable solutions to environmental problems.",
  },
  {
    id: 3,
    word: "collaborate",
    meaning: "協力する、共同作業する",
    example: "Different teams collaborate to complete the project.",
  },
];

export default function DemoPage() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const currentWord = demoWords[currentWordIndex];

  const handleNext = () => {
    setCurrentWordIndex((prev) => (prev + 1) % demoWords.length);
    setIsFlipped(false);
    setShowQuiz(false);
    setSelectedAnswer(null);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">スプレッドワード デモ</h1>

      {/* デモナビゲーション */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="flex justify-center gap-4 mb-8">
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => {
              setShowQuiz(false);
              setIsFlipped(false);
            }}
          >
            フラッシュカード
          </button>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => {
              setShowQuiz(true);
              setIsFlipped(false);
            }}
          >
            クイズモード
          </button>
        </div>

        {/* フラッシュカードデモ */}
        {!showQuiz && (
          <div 
            className={`bg-white p-8 rounded-lg shadow-lg cursor-pointer transition-all duration-500 transform ${
              isFlipped ? "bg-blue-50" : ""
            }`}
            style={{ minHeight: "300px" }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="text-center">
              {!isFlipped ? (
                <>
                  <h2 className="text-3xl font-bold mb-4">{currentWord.word}</h2>
                  <p className="text-gray-500">カードをクリックして意味を表示</p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mb-4">{currentWord.meaning}</h3>
                  <p className="text-lg mb-4">例文:</p>
                  <p className="text-gray-600">{currentWord.example}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* クイズデモ */}
        {showQuiz && (
          <div className="bg-white p-8 rounded-lg shadow-lg" style={{ minHeight: "300px" }}>
            <h2 className="text-2xl font-bold mb-6 text-center">
              &quot;{currentWord.word}&quot; の意味は？
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {[...demoWords, { id: 4, word: "", meaning: "効果的な、有効な", example: "" }]
                .sort(() => Math.random() - 0.5)
                .map((option, index) => (
                  <button
                    key={index}
                    className={`p-4 rounded-md border ${
                      selectedAnswer === index
                        ? option.meaning === currentWord.meaning
                          ? "bg-green-100 border-green-500"
                          : "bg-red-100 border-red-500"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedAnswer(index)}
                  >
                    {option.meaning}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* ナビゲーションボタン */}
        <div className="flex justify-center mt-8">
          <button
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            onClick={handleNext}
          >
            次の単語へ
          </button>
        </div>
      </div>

      {/* 機能説明セクション */}
      <div className="max-w-4xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">主な機能</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">📝 フラッシュカード学習</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>シンプルで効果的な単語学習</li>
              <li>例文で実践的な使い方を学習</li>
              <li>自分だけのメモを追加可能</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">🎯 インタラクティブクイズ</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>4択クイズで理解度をチェック</li>
              <li>間違えた単語は自動で復習リストに追加</li>
              <li>学習進捗の可視化</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTAセクション */}
      <div className="text-center mt-16">
        <Link
          href="/auth/signin"
          className="inline-block px-8 py-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-lg"
        >
          無料で始める
        </Link>
        <p className="mt-4 text-gray-600">
          会員登録後、すべての機能をご利用いただけます
        </p>
      </div>
    </div>
  );
}
