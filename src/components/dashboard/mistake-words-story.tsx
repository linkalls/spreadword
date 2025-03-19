"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface MistakeWord {
  word: string;
  meanings: string;
  mistakeCount: number | null;
}

interface MistakeWordsStoryProps {
  words: MistakeWord[];
}

/**
 * 間違えた単語一覧と、それらの単語を使用した長文生成機能を提供するコンポーネント
 */
export function MistakeWordsStory({ words }: MistakeWordsStoryProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<{
    English: string;
    Japanese: string;
  }>();

  const handleGenerateStory = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch("/api/examples/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          words: words.map((w) => w.word),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate story");
      }

      const data = await response.json();
      setGeneratedStory(data);
    } catch (error) {
      console.error("Failed to generate story:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 間違えた単語一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>間違えた単語一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {words.map((word, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-lg">{word.word}</p>
                <p className="text-gray-600">{word.meanings}</p>
                <p className="text-sm text-gray-500">
                  間違えた回数: {word.mistakeCount ?? 0}回
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 長文生成セクション */}
      <Card>
        <CardHeader>
          <CardTitle>ストーリー生成</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={handleGenerateStory}
              disabled={isGenerating || words.length === 0}
              className="w-full"
            >
              {isGenerating
                ? "ストーリーを生成中..."
                : "単語を使ってストーリーを生成"}
            </Button>

            {generatedStory && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">
                    English
                  </h4>
                  <p className="text-blue-600 whitespace-pre-line">
                    {generatedStory.English}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">
                    Japanese
                  </h4>
                  <p className="text-gray-600 whitespace-pre-line">
                    {generatedStory.Japanese}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
