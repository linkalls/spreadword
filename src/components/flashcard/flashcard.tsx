"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookmarkIcon, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

interface FlashCardData {
  id: number;
  word: string;
  meanings: string;
  part_of_speech: string | null;
  ex: string | null;
  userNotes?: string;
  bookmarked?: number;
}

export default function FlashCardComponent() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState<FlashCardData[]>([]);
  const [totalCards, setTotalCards] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userNote, setUserNote] = useState<string>("");
  const { data: session } = useSession();
  const [speaking, setSpeaking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/flashcards");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch cards");
      }
      const data = await response.json();
      
      if (!data.words || !Array.isArray(data.words)) {
        throw new Error("Invalid response format");
      }

      setCards(data.words);
      setTotalCards(data.total || 0);

      // カードがある場合は初期状態を設定
      if (data.words.length > 0) {
        setIsBookmarked(data.words[0].bookmarked === 1);
        setUserNote(data.words[0].userNotes || "");
      }
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      setError(error instanceof Error ? error.message : "エラーが発生しました");
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchCards();
    }
  }, [session, fetchCards]);

  useEffect(() => {
    if (cards.length > 0 && currentIndex < cards.length) {
      const card = cards[currentIndex];
      setIsBookmarked(card.bookmarked === 1);
      setUserNote(card.userNotes || "");
    }
  }, [currentIndex, cards]);

  const [completingCard, setCompletingCard] = useState(false);

  const handleComplete = async () => {
    if (!cards.length || currentIndex >= cards.length || completingCard) return;
    const currentCard = cards[currentIndex];

    try {
      setCompletingCard(true);
      const response = await fetch("/api/flashcards/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wordId: currentCard.id }),
      });

      if (!response.ok) throw new Error("Failed to update completion status");

      // 現在の単語を配列から削除
      setCards(prevCards => prevCards.filter(card => card.id !== currentCard.id));
      setTotalCards(prev => Math.max(0, prev - 1));
      
      // 最後の単語だった場合は完了メッセージを表示
      if (cards.length <= 1) {
        setError("すべての単語を学習しました！");
      } else {
        handleNext();
      }
    } catch (error) {
      console.error("Error completing card:", error);
    } finally {
      setCompletingCard(false);
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

  const handleSpeak = () => {
    if (!cards.length || currentIndex >= cards.length || speaking) return;
    const currentCard = cards[currentIndex];

    const utterance = new SpeechSynthesisUtterance(currentCard.word);
    utterance.lang = "en-US";
    setSpeaking(true);

    utterance.onend = () => {
      setSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  };

  const [saving, setSaving] = useState(false);

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
                userNotes: trimmedNote,
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

  const handleNext = async () => {
    try {
      if (userNote.trim()) {
        await saveNote();
      }
    } finally {
      setIsFlipped(false);
      setUserNote("");
      setCurrentIndex(prev => (prev + 1) % cards.length);
    }
  };

  const handlePrevious = async () => {
    try {
      if (userNote.trim()) {
        await saveNote();
      }
    } finally {
      setIsFlipped(false);
      setUserNote("");
      setCurrentIndex(prev => Math.max(0, (prev - 1 + cards.length) % cards.length));
    }
  };

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <div className="flex justify-center items-center min-h-[300px] sm:min-h-[400px]">
          <RotateCw className="w-6 h-6 animate-spin" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchCards}>再試行</Button>
        </div>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <p className="mb-4">ログインしてフラッシュカード学習を始めましょう</p>
        </div>
      </Card>
    );
  }

  if (cards.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <p className="mb-4">学習可能な単語がありません</p>
          <p className="text-sm text-gray-500">
            {totalCards > 0 
              ? "他の単語は習得済みです！"
              : "単語リストを確認してください"}
          </p>
        </div>
      </Card>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-2">
          <span className="text-xs sm:text-sm text-gray-600">
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
              disabled={!currentCard || completingCard}
            >
              {completingCard ? "保存中..." : "習得済みとしてマーク"}
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
