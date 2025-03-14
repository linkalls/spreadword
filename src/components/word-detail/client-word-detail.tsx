'use client';

import React, { useState } from 'react';
import { WordDetailCard } from './word-detail-card';

interface ClientWordDetailProps {
  initialWord: {
    word: string;
    meanings: string;
    mistakeCount?: number;
    lastMistakeDate?: Date;
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
      const response = await fetch('/api/examples/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          words: [initialWord.word],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate example');
      }

      const data = await response.json();
      setGeneratedText(data);
    } catch (error) {
      console.error('Failed to generate example:', error);
      // ここでエラー通知を表示することもできます
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <WordDetailCard
      wordDetail={{
        word: initialWord.word,
        meaning: initialWord.meanings,
        mistakeCount: initialWord.mistakeCount ?? 0,
        lastMistakeDate: initialWord.lastMistakeDate ?? new Date(),
        generatedText,
      }}
      onGenerateExample={handleGenerateExample}
      isGenerating={isGenerating}
    />
  );
}
