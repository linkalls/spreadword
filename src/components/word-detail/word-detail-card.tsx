import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WordSpeech } from './word-speech';
import { BookmarkIcon } from 'lucide-react';

// 単語の詳細情報の型定義
interface WordDetail {
  id: number;
  word: string;
  meaning: string;
  mistakeCount: number;
  lastMistakeDate: Date | null;
  generatedText?: {
    English: string;
    Japanese: string;
  };
  bookmarked?: number;
  notes?: string;
}

interface WordDetailCardProps {
  wordDetail: WordDetail;
  onGenerateExample: () => Promise<void>;
  isGenerating: boolean;
}

/**
 * 間違えた単語の詳細を表示するカードコンポーネント
 * - 単語の基本情報（単語、意味、間違えた回数など）を表示
 * - Geminiを使用して例文を生成するボタンを提供
 * - 生成された例文を日英で表示
 */
export const WordDetailCard: React.FC<WordDetailCardProps> = ({
  wordDetail,
  onGenerateExample,
  isGenerating,
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIsBookmarked(wordDetail.bookmarked === 1);
    setNotes(wordDetail.notes || "");
  }, [wordDetail]);

  const handleBookmark = async () => {
    try {
      const response = await fetch("/api/flashcards/bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wordId: wordDetail.id,
          bookmarked: !isBookmarked
        }),
      });

      if (!response.ok) throw new Error("Failed to update bookmark status");
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error("Error updating bookmark:", error);
    }
  };

  const saveNote = async () => {
    try {
      setSaving(true);
      const trimmedNotes = notes.trim();
      const response = await fetch("/api/flashcards/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wordId: wordDetail.id,
          notes: trimmedNotes,
        }),
      });

      if (!response.ok) throw new Error("Failed to save note");
      
      // ノートの状態に応じてブックマーク状態を更新
      setIsBookmarked(!!trimmedNotes);
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4 justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl font-bold">{wordDetail.word}</CardTitle>
            <WordSpeech word={wordDetail.word} />
          </div>
          <Button
            variant={isBookmarked ? "default" : "outline"}
            size="sm"
            onClick={handleBookmark}
            className="min-w-[120px]"
          >
            <BookmarkIcon className={`h-4 w-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
            {isBookmarked ? "ブックマーク解除" : "ブックマーク"}
          </Button>
        </div>
        <p className="text-gray-600">{wordDetail.meaning}</p>
      </CardHeader>
      <CardContent>
        {/* 間違えた回数と最後に間違えた日付の表示 */}
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            間違えた回数: {wordDetail.mistakeCount}回
          </p>
          <p className="text-sm text-gray-500">
            最後に間違えた日: {wordDetail.lastMistakeDate?.toLocaleDateString() ?? "なし"}
          </p>
        </div>

        {/* ノート入力フィールド */}
        <div className="mb-6 space-y-2">
          <textarea
            className="w-full p-2 border rounded-md"
            placeholder="ノートを追加（例：覚え方のコツ、関連単語など）"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveNote()}
            disabled={saving}
            className="w-full"
          >
            {saving ? "保存中..." : "ノートを保存"}
          </Button>
        </div>

        {/* 例文生成ボタン */}
        <div className="mb-6">
          <Button
            onClick={onGenerateExample}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? '例文を生成中...' : '新しい例文を生成'}
          </Button>
        </div>

        {/* 生成されたテキストの表示 */}
        {wordDetail.generatedText && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">生成されたストーリー</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">English</h4>
                <p className="text-blue-600 whitespace-pre-line">{wordDetail.generatedText.English}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-2">Japanese</h4>
                <p className="text-gray-600 whitespace-pre-line">{wordDetail.generatedText.Japanese}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
