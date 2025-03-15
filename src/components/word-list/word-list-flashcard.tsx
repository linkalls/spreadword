"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";

interface FlashCardData {
  id: number;
  word: string;
  meanings: string;
  part_of_speech: string | null;
  ex: string | null;
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

  useEffect(() => {
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
    fetchCards();
  }, [listId]);

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
      <div className="flex justify-between items-center mb-4">
        <div className="flex justify-between items-center w-full">
          <span className="text-sm text-gray-600">
            {currentIndex + 1} / {cards.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSpeak}
            disabled={speaking || !currentCard}
          >
            {speaking ? "再生中..." : "発音を聞く"}
          </Button>
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
