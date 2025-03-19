"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSpeech } from "@/hooks/use-speech";
import { BookmarkIcon, Loader2, Volume2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface QuizQuestion {
  id: number;
  word: string;
  meanings: string;
  choices: string[];
  ex?: string;
  bookmarked?: number;
  notes?: string;
}

interface QuizCardProps {
  question: QuizQuestion;
  onAnswer: (isCorrect: boolean, selectedChoice: string) => void;
  onComplete: () => void;
  onNext: () => void;
  isLast: boolean;
}

export function QuizCard({ question, onAnswer, onComplete, onNext, isLast }: QuizCardProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // 問題が変わったらステートをリセット
  useEffect(() => {
    setSelectedChoice(null);
    setIsAnswered(false);
  }, [question.id]);
  const { speak, speaking } = useSpeech();
  const [isBookmarked, setIsBookmarked] = useState(question.bookmarked === 1);
  const [saving, setSaving] = useState(false);
  const [userNote, setUserNote] = useState(question.notes || "");

  const handleSpeak = useCallback(() => {
    speak(question.word);
  }, [question.word, speak]);

  const handleBookmark = async () => {
    try {
      const response = await fetch("/api/flashcards/bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wordId: question.id,
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
      const trimmedNote = userNote.trim();
      const response = await fetch("/api/flashcards/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wordId: question.id,
          notes: trimmedNote,
        }),
      });

      if (!response.ok) throw new Error("Failed to save note");
      
      // ノートの状態に応じてブックマーク状態を更新
      setIsBookmarked(!!trimmedNote);
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAnswer = useCallback(() => {
    if (!selectedChoice) return;

    const isCorrect = selectedChoice === question.meanings;
    setIsAnswered(true);
    onAnswer(isCorrect, selectedChoice);
  }, [selectedChoice, question.meanings, onAnswer]);

  return (
    <Card className="p-6">
      <div className="flex flex-col space-y-6">
        {/* 単語とコントロール */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">{question.word}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSpeak}
              disabled={speaking}
              aria-label="発音を聞く"
            >
              {speaking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
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

        {/* 選択肢 */}
        <div className="grid grid-cols-1 gap-3">
          {question.choices.map((choice, index) => (
            <Button
              key={index}
              variant={
                isAnswered
                  ? (choice === question.meanings || 
                     (choice === selectedChoice && selectedChoice === question.meanings))
                    ? "success" // 正解の選択肢または正解した選択を緑色に
                    : choice === selectedChoice && choice !== question.meanings
                    ? "destructive" // 間違えた選択肢を赤色に
                    : "outline"
                  : selectedChoice === choice
                  ? "default"
                  : "outline"
              }
              className="justify-start h-auto py-4 px-6 whitespace-normal text-left"
              onClick={() => !isAnswered && setSelectedChoice(choice)}
              disabled={isAnswered}
            >
              {choice}
            </Button>
          ))}
        </div>

        {/* 解答後の表示 */}
        {isAnswered && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              {question.ex && (
                <div className="mb-4">
                  <h3 className="font-semibold text-sm mb-2">例文:</h3>
                  <p className="text-sm text-gray-600">{question.ex}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <textarea
                  className="w-full p-2 border rounded-md"
                  placeholder="ノートを追加（例：覚え方のコツ、関連単語など）"
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
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
            </div>

            <Button
              className="w-full"
              onClick={() => {
                if (isLast) {
                  onComplete();
                } else {
                  onNext();
                }
              }}
              variant="success"
            >
              {isLast ? "結果を見る" : "次の問題へ"}
            </Button>
          </div>
        )}

        {/* 解答ボタン */}
        {!isAnswered && (
          <Button
            onClick={handleAnswer}
            disabled={!selectedChoice}
            className="w-full"
          >
            回答する
          </Button>
        )}
      </div>
    </Card>
  );
}
