"use client";

import { Button } from "@/components/ui/button";
import { useSpeech } from "@/hooks/use-speech";
import { Volume2 } from "lucide-react";

interface WordSpeechProps {
  word: string;
}

/**
 * 単語の読み上げ機能を提供するコンポーネント
 */
export function WordSpeech({ word }: WordSpeechProps) {
  const { speak } = useSpeech();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => speak(word)}
      title="単語を読み上げる"
      className="hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      <Volume2 className="h-5 w-5" />
      <span className="sr-only">単語を読み上げる</span>
    </Button>
  );
}
