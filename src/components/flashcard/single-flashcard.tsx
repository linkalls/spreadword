"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookmarkIcon, RotateCw, Save, Volume2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

interface FlashCardData {
  id: number;
  word: string;
  meanings: string;
  part_of_speech: string | null;
  ex: string | null;
  notes?: string;
  bookmarked?: number;
}

export default function SingleFlashCard({ wordId }: { wordId: number }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [saving, setSaving] = useState(false);
  const [card, setCard] = useState<FlashCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [speaking, setSpeaking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const response = await fetch(`/api/flashcards/${wordId}`);
        if (!response.ok) throw new Error("Failed to fetch card");
        const data = await response.json();
        setCard(data);
        setIsBookmarked(data.bookmarked === 1);
        setNotes(data.notes || "");
      } catch (error) {
        console.error("Error fetching flashcard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session && wordId) {
      fetchCard();
    }
  }, [session, wordId]);

  const handleComplete = useCallback(async () => {
    if (!card) return;

    try {
      const response = await fetch("/api/flashcards/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wordId: card.id }),
      });

      if (!response.ok) throw new Error("Failed to update completion status");
    } catch (error) {
      console.error("Error completing card:", error);
    }
  }, [card]);

  const handleBookmark = async () => {
    if (!card) return;

    try {
      const response = await fetch("/api/flashcards/bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wordId: card.id,
          bookmarked: !isBookmarked
        }),
      });

      if (!response.ok) throw new Error("Failed to update bookmark status");
      setIsBookmarked(!isBookmarked);
      
      // カードの状態も更新
      setCard(prev => 
        prev ? { ...prev, bookmarked: !isBookmarked ? 1 : 0 } : null
      );
    } catch (error) {
      console.error("Error updating bookmark:", error);
    }
  };

  const handleSpeak = useCallback(() => {
    if (!card || speaking) return;

    const utterance = new SpeechSynthesisUtterance(card.word);
    utterance.lang = "en-US";
    setSpeaking(true);

    utterance.onend = () => {
      setSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  }, [card, speaking]);

  const saveNote = useCallback(async () => {
    if (!card) return;

    try {
      setSaving(true);
      const trimmedNotes = notes.trim();
      const response = await fetch("/api/flashcards/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wordId: card.id,
          notes: trimmedNotes,
        }),
      });

      if (!response.ok) throw new Error("Failed to save note");
      
      // ノートの状態に応じてブックマーク状態を更新
      setIsBookmarked(!!trimmedNotes);
      
      // カードの状態も更新
      setCard(prev => 
        prev ? {
          ...prev,
          notes: trimmedNotes,
          bookmarked: trimmedNotes ? 1 : 0
        } : null
      );
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setSaving(false);
    }
  }, [card, notes]);

  if (loading) {
    return (
      <div 
        className="flex justify-center items-center min-h-[300px] sm:min-h-[400px]"
        role="status"
        aria-label="フラッシュカードを読み込み中"
      >
        <RotateCw className="animate-spin" aria-hidden="true" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-8" role="alert">
        <p>ログインしてフラッシュカード学習を始めましょう</p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="text-center py-8" role="alert">
        <p>単語が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-end mb-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSpeak}
            disabled={speaking}
            aria-label={speaking ? "発音を再生中" : "単語の発音を聞く"}
          >
            <Volume2 className="h-4 w-4 mr-1" aria-hidden="true" />
            {speaking ? "再生中..." : "発音を聞く"}
          </Button>
          <Button
            variant={isBookmarked ? "default" : "outline"}
            size="sm"
            onClick={handleBookmark}
            className="min-w-[120px]"
          >
            <BookmarkIcon className={`h-4 w-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
            {isBookmarked ? "ブックマーク解除" : "ブックマーク"}
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleComplete}
            aria-label="この単語を習得済みとしてマーク"
          >
            習得済みとしてマーク
          </Button>
        </div>
      </div>

      <Card
        className="w-full aspect-[3/2] relative cursor-pointer bg-white perspective-[1000px] min-h-[300px] sm:min-h-[400px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsFlipped(!isFlipped)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsFlipped(!isFlipped);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`フラッシュカード: ${card.word}、クリックまたはEnterキーで${isFlipped ? '表' : '裏'}を表示`}
        aria-pressed={isFlipped}
      >
        <div
          className={`w-full h-full absolute backface-hidden transition-transform duration-300 ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
          aria-hidden={isFlipped}
        >
          <div className="flex items-center justify-center p-4 sm:p-8 absolute inset-0">
            <div className="text-center max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{card.word}</h2>
              <p className="text-sm sm:text-base text-gray-500">{card.part_of_speech}</p>
            </div>
          </div>
        </div>
        <div
          className={`w-full h-full absolute backface-hidden transition-transform duration-300 [transform:rotateY(-180deg)] ${
            isFlipped ? "[transform:rotateY(0deg)]" : ""
          }`}
          aria-hidden={!isFlipped}
        >
          <div className="flex items-center justify-center p-4 sm:p-8 absolute inset-0">
            <div className="max-w-xl">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">{card.meanings}</h3>
              {card.ex && (
                <p className="text-xs sm:text-sm text-gray-600 mt-4">{card.ex}</p>
              )}
              <div
                className="mt-4 border-t pt-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-2">
                  <label htmlFor="notes" className="sr-only">
                    学習ノート
                  </label>
                  <textarea
                    id="notes"
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ノートを追加（例：覚え方のコツ、関連単語など）"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={() => notes.trim() && saveNote()}
                    rows={2}
                    aria-label="単語に関するメモやノート"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveNote}
                    disabled={saving || !notes.trim()}
                    className="w-full"
                    aria-busy={saving}
                  >
                    <Save className="h-4 w-4 mr-1" aria-hidden="true" />
                    {saving ? "保存中..." : "ノートを保存"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
