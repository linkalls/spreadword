import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 単語の詳細情報の型定義
interface WordDetail {
  word: string;
  meaning: string;
  mistakeCount: number;
  lastMistakeDate: Date;
  generatedText?: {
    English: string;
    Japanese: string;
  };
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
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{wordDetail.word}</CardTitle>
        <p className="text-gray-600">{wordDetail.meaning}</p>
      </CardHeader>
      <CardContent>
        {/* 間違えた回数と最後に間違えた日付の表示 */}
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            間違えた回数: {wordDetail.mistakeCount}回
          </p>
          <p className="text-sm text-gray-500">
            最後に間違えた日: {wordDetail.lastMistakeDate.toLocaleDateString()}
          </p>
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
