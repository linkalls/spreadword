"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookmarkIcon, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";

interface FlashCardData {
  id: number;
  word: string;
  meanings: string;
  part_of_speech: string | null;
  ex: string | null;
  bookmarked?: number;
  notes?: string;
}

interface WordListFlashCardProps {
  listId: string;
}

export default function WordListFlashCard({ listId }: WordListFlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState<FlashCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userNote, setUserNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCards();
  }, [listId]);

  // カードデータが変更されたときの処理
  useEffect(() => {
    if (cards.length > 0 && currentIndex < cards.length) {
      const card = cards[currentIndex];
      setIsBookmarked(card.bookmarked === 1);
      setUserNote(card.notes || "");
    }
  }, [currentIndex, cards]);

  const fetchCards = async () => {
    try {
      const response = await fetch(`/api/wordlists/${listId}/flashcards`);
      if (!response.ok) throw new Error("Failed to fetch cards");
      const data = await response.json();
      setCards(data);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!cards.length || currentIndex >= cards.length) return;
    const currentCard = cards[currentIndex];

    try {
      const response = await fetch("/api/flashcards/bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wordId: currentCard.id,
          bookmarked: !isBookmarked
        }),
      });

      if (!response.ok) throw new Error("Failed to update bookmark status");
      setIsBookmarked(!isBookmarked);
      
      // カードの状態も更新
      setCards(prevCards => 
        prevCards.map(card => 
          card.id === currentCard.id 
            ? { ...card, bookmarked: !isBookmarked ? 1 : 0 }
            : card
        )
      );
    } catch (error) {
      console.error("Error updating bookmark:", error);
    }
  };

  const saveNote = async () => {
    if (!cards.length || currentIndex >= cards.length) return;
    const currentCard = cards[currentIndex];

    try {
      setSaving(true);
      const trimmedNote = userNote.trim();
      const response = await fetch("/api/flashcards/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wordId: currentCard.id,
          notes: trimmedNote,
        }),
      });

      if (!response.ok) throw new Error("Failed to save note");
      
      // ノートの状態に応じてブックマーク状態を更新
      setIsBookmarked(!!trimmedNote);
      
      // カードの状態も更新
      setCards(prevCards => 
        prevCards.map(card => 
          card.id === currentCard.id 
            ? { 
                ...card, 
                notes: trimmedNote,
                bookmarked: trimmedNote ? 1 : 0 
              }
            : card
        )
      );
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSpeak = () => {
    if (!cards.length || currentIndex >= cards.length) return;
    const currentCard = cards[currentIndex];
    if (speaking) return;

    const utterance = new SpeechSynthesisUtterance(currentCard.word);
    utterance.lang = "en-US";
    setSpeaking(true);

    utterance.onend = () => {
      setSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <RotateCw className="animate-spin" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-8">
        <p>このリストには単語が登録されていません</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col justify-between items-center mb-4 space-y-2 sm:space-y-0 sm:flex-row">
        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-2">
          <span className="text-sm text-gray-600">
            {currentIndex + 1} / {cards.length}
          </span>
          <div className="flex gap-2 flex-wrap justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSpeak}
              disabled={speaking || !currentCard}
            >
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
              onClick={async () => {
                if (!currentCard) return;
                try {
                  const response = await fetch(`/api/flashcards/${currentCard.id}/complete`, {
                    method: 'POST',
                  });
                  if (!response.ok) throw new Error('Failed to mark as complete');
                  setIsCompleted(true);
                } catch (error) {
                  console.error('Error marking flashcard as complete:', error);
                }
              }}
              disabled={!currentCard || isCompleted}
            >
              {isCompleted ? "完了済み" : "完了にする"}
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
          className="w-full relative cursor-pointer bg-white perspective-[1000px] min-h-[300px] md:min-h-[400px] flex items-center justify-center"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className={`w-full h-full absolute inset-0 backface-hidden transition-transform duration-300 ${
              isFlipped ? "[transform:rotateY(180deg)]" : ""
            }`}
          >
            <div className="flex items-center justify-center p-4 md:p-8 absolute inset-0">
              <div className="text-center w-full max-w-xl">
                <h2 className="text-xl md:text-3xl font-bold mb-2">{currentCard.word}</h2>
                <p className="text-sm md:text-base text-gray-500">{currentCard.part_of_speech}</p>
              </div>
            </div>
          </div>
          <div
            className={`w-full h-full absolute inset-0 backface-hidden transition-transform duration-300 [transform:rotateY(-180deg)] ${
              isFlipped ? "[transform:rotateY(0deg)]" : ""
            }`}
          >
            <div className="flex items-center justify-center p-4 md:p-8 absolute inset-0">
              <div className="w-full max-w-xl overflow-y-auto max-h-full py-2">
                <h3 className="text-lg md:text-xl font-semibold mb-4">
                  {currentCard.meanings}
                </h3>
                {currentCard.ex && (
                  <p className="text-xs md:text-sm text-gray-600 mt-4">{currentCard.ex}</p>
                )}
                <div
                  className="mt-4 border-t pt-4"
                  onClick={(e) => e.stopPropagation()}
                >
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
              </div>
            </div>
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
