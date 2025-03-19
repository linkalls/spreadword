"use client";

import { useState } from "react";
import { WordDetailCard } from "./word-detail-card";

interface ClientWordDetailProps {
  initialWord: {
    id: number;
    word: string;
    meanings: string;
    mistakeCount?: number;
    lastMistakeDate?: Date | null;
    bookmarked?: number;
    notes?: string;
  };
}

/**
 * クライアントサイドの単語詳細コンポーネント
 * 例文生成のステート管理とAPIコールを担当します
 */
export function ClientWordDetail({ initialWord }: ClientWordDetailProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState<{
    English: string;
    Japanese: string;
  }>();

  const handleGenerateExample = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch("/api/examples/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          words: [initialWord.word],
          prompt: `Please create a 2-line sentence using all of the following English words:
          ${initialWord.word} - ${initialWord.meanings}
          Conditions:
            - Use all the provided words at least once.
            - The sentences should have a story-like structure and be consistent in content.
            - The theme should be related to daily life or business scenes.
            - Use the words in a natural context.
            - The sentences must be grammatically correct and easy to read for junior high school.
            - The translation should be in natural Japanese.
            - Assume an English proficiency level suitable for university entrance exams.
            - Output in the following JSON format:
            {
              "English": "Write the English sentences here (multiple paragraphs allowed)",
              "Japanese": "Write the Japanese translation here (multiple paragraphs allowed)"
            }`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate example");
      }
      setGeneratedText(data);
    } catch (error) {
      console.error("Failed to generate example:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <WordDetailCard
      wordDetail={{
        id: initialWord.id,
        word: initialWord.word,
        meaning: initialWord.meanings,
        mistakeCount: initialWord.mistakeCount ?? 0,
        lastMistakeDate: initialWord.lastMistakeDate ?? null,
        bookmarked: initialWord.bookmarked,
        notes: initialWord.notes,
        generatedText,
      }}
      onGenerateExample={handleGenerateExample}
      isGenerating={isGenerating}
    />
  );
}
