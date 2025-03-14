'use client';

import { useState } from 'react';

interface Choice {
  text: string;
  isCorrect: boolean;
}

interface QuizCardProps {
  word: string;
  wordId: number;
  choices: Choice[];
  onAnswer: (wordId: number, selectedChoice: string, isCorrect: boolean, next?: boolean) => void;
}

export function QuizCard({ word, wordId, choices, onAnswer }: QuizCardProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleChoiceSelect = (choice: Choice) => {
    if (isAnswered) return;

    setSelectedChoice(choice.text);
    setIsAnswered(true);
    setIsCorrect(choice.isCorrect);
    onAnswer(wordId, choice.text, choice.isCorrect);
  };

  const handleNext = () => {
    setSelectedChoice(null);
    setIsAnswered(false);
    setIsCorrect(false);
    onAnswer(wordId, '', false, true); // 最後のtrueは次の問題へ進むことを示す
  };

  const getChoiceStyle = (choice: Choice) => {
    if (!isAnswered) {
      return "border-gray-200 hover:border-blue-500 hover:bg-blue-50";
    }

    if (choice.text === selectedChoice) {
      return choice.isCorrect
        ? "border-green-500 bg-green-50"
        : "border-red-500 bg-red-50";
    }

    if (choice.isCorrect) {
      return "border-green-500 bg-green-50";
    }

    return "border-gray-200 opacity-50";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-xl font-medium text-gray-900 mb-4">{word}</h3>
      <div className="space-y-3">
        {choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleChoiceSelect(choice)}
            disabled={isAnswered}
            className={`w-full p-4 text-left rounded-lg border transition-colors ${getChoiceStyle(
              choice
            )}`}
          >
            {choice.text}
          </button>
        ))}
      </div>
      {isAnswered && (
        <>
          <div
            className={`mt-4 p-4 rounded-lg ${
              isCorrect ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <p className="font-medium">
              {isCorrect ? "正解！" : "不正解..."}
            </p>
            {!isCorrect && (
              <p className="text-sm mt-1">
                正解は: {choices.find((c) => c.isCorrect)?.text}
              </p>
            )}
          </div>
          <button
            onClick={handleNext}
            className="mt-4 w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            次の問題へ
          </button>
        </>
      )}
    </div>
  );
}
