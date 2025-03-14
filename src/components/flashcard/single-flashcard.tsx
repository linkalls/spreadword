'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCw } from "lucide-react";
import { useSession } from "next-auth/react";

interface FlashCardData {
  id: number;
  word: string;
  meanings: string;
  part_of_speech: string | null;
  ex: string | null;
  userNotes?: string;
}

export default function SingleFlashCard({ wordId }: { wordId: number }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [card, setCard] = useState<FlashCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userNote, setUserNote] = useState<string>("");
  const { data: session } = useSession();
  const [speaking, setSpeaking] = useState(false);



  useEffect(() => {
    const fetchCard = async () => {
      try {
        const response = await fetch(`/api/flashcards/${wordId}`);
        if (!response.ok) throw new Error('Failed to fetch card');
        const data = await response.json();
        setCard(data);
      } catch (error) {
        console.error('Error fetching flashcard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session && wordId) {
      fetchCard();
    }
  }, [session, wordId]);

  const handleComplete = async () => {
    if (!card) return;
    
    try {
      const response = await fetch('/api/flashcards/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wordId: card.id }),
      });
      
      if (!response.ok) throw new Error('Failed to update completion status');
      
    } catch (error) {
      console.error('Error completing card:', error);
    }
  };

  const handleSpeak = () => {
    if (!card || speaking) return;
    
    const utterance = new SpeechSynthesisUtterance(card.word);
    utterance.lang = 'en-US';
    setSpeaking(true);
    
    utterance.onend = () => {
      setSpeaking(false);
    };
    
    speechSynthesis.speak(utterance);
  };

  const saveNote = async () => {
    if (!card || !userNote.trim()) return;
    
    try {
      const response = await fetch('/api/flashcards/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordId: card.id,
          note: userNote,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to save note');
      
    } catch (error) {
      console.error('Error saving note:', error);
    }
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

  if (!card) {
    return (
      <div className="text-center py-8">
        <p>単語が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-end mb-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSpeak}
            disabled={speaking}
          >
            {speaking ? "再生中..." : "発音を聞く"}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleComplete}
          >
            習得済みとしてマーク
          </Button>
        </div>
      </div>
      
      <Card
        className={`w-full aspect-[3/2] flex items-center justify-center p-8 cursor-pointer transform transition-all duration-500 ${
          isFlipped ? "scale-[-1]" : ""
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`text-center transform ${isFlipped ? "scale-[-1]" : ""}`}>
          {!isFlipped ? (
            <div>
              <h2 className="text-3xl font-bold mb-2">{card.word}</h2>
              <p className="text-gray-500">{card.part_of_speech}</p>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-semibold mb-4">{card.meanings}</h3>
              {card.ex && (
                <p className="text-sm text-gray-600 mt-4">{card.ex}</p>
              )}
              <div className="mt-4 border-t pt-4" onClick={(e) => e.stopPropagation()}>
                <textarea
                  className="w-full p-2 border rounded-md"
                  placeholder="ノートを追加（例：覚え方のコツ、関連単語など）"
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  onBlur={saveNote}
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
