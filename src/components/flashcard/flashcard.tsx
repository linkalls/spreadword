"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface FlashCardData {
  id: number;
  word: string;
  meanings: string;
  part_of_speech: string | null;
  ex: string | null;
  userNotes?: string;
}

export default function FlashCardComponent() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState<FlashCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userNote, setUserNote] = useState<string>("");
  const { data: session } = useSession();
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (session) {
      fetchCards();
    }
  }, [session]);

  const fetchCards = async () => {
    try {
      // TODO: APIエンドポイントを実装する
      const response = await fetch("/api/flashcards");
      if (!response.ok) throw new Error("Failed to fetch cards");
      const data = await response.json();
      setCards(data);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!currentCard) return;

    try {
      const response = await fetch("/api/flashcards/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wordId: currentCard.id }),
      });

      if (!response.ok) throw new Error("Failed to update completion status");

      // 現在の単語を配列から削除
      setCards(cards.filter((card) => card.id !== currentCard.id));
      if (cards.length > 1) {
        handleNext();
      }
    } catch (error) {
      console.error("Error completing card:", error);
    }
  };

  const handleSpeak = () => {
    if (!currentCard || speaking) return;

    const utterance = new SpeechSynthesisUtterance(currentCard.word);
    utterance.lang = "en-US";
    setSpeaking(true);

    utterance.onend = () => {
      setSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  };

  const saveNote = async () => {
    if (!currentCard || !userNote.trim()) return;

    try {
      const response = await fetch("/api/flashcards/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wordId: currentCard.id,
          note: userNote,
        }),
      });

      if (!response.ok) throw new Error("Failed to save note");
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleNext = () => {
    if (userNote.trim()) {
      saveNote();
    }
    setIsFlipped(false);
    setUserNote("");
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrevious = () => {
    if (userNote.trim()) {
      saveNote();
    }
    setIsFlipped(false);
    setUserNote("");
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <RotateCw className="animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-8">
        <p>ログインしてフラッシュカード学習を始めましょう</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-8">
        <p>学習可能な単語がありません</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex justify-between items-center w-full">
          <span className="text-sm text-gray-600">
            {currentIndex + 1} / {cards.length}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSpeak}
              disabled={speaking || !currentCard}
            >
              {speaking ? "再生中..." : "発音を聞く"}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleComplete}
              disabled={!currentCard}
            >
              習得済みとしてマーク
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={cards.length <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Card
          className={`w-full aspect-[3/2] flex items-center justify-center p-8 cursor-pointer transform transition-all duration-500 ${
            isFlipped ? "scale-[-1]" : ""
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className={`text-center transform ${isFlipped ? "scale-[-1]" : ""}`}
          >
            {!isFlipped ? (
              <div>
                <h2 className="text-3xl font-bold mb-2">{currentCard.word}</h2>
                <p className="text-gray-500">{currentCard.part_of_speech}</p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  {currentCard.meanings}
                </h3>
                {currentCard.ex && (
                  <p className="text-sm text-gray-600 mt-4">{currentCard.ex}</p>
                )}
                <div
                  className="mt-4 border-t pt-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <textarea
                    className="w-full p-2 border rounded-md"
                    placeholder="ノートを追加（例：覚え方のコツ、関連単語など）"
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={cards.length <= 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
