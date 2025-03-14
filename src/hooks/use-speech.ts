"use client";

interface UseSpeechOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

/**
 * Web Speech APIを使用するためのカスタムフック
 * 
 * @param options - 音声合成のオプション
 * @returns テキストを読み上げるための関数と状態
 */
export function useSpeech(options: UseSpeechOptions = {}) {
  const defaultOptions = {
    language: "en-US",
    rate: 1,
    pitch: 1,
    volume: 1,
    ...options,
  };

  // ブラウザが音声合成をサポートしているか確認
  const isSpeechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  /**
   * テキストを音声で読み上げる
   * @param text - 読み上げるテキスト
   */
  const speak = (text: string) => {
    if (!isSpeechSupported) {
      console.warn("Speech synthesis is not supported in this browser.");
      return;
    }

    // 現在の読み上げを停止
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = defaultOptions.language;
    utterance.rate = defaultOptions.rate;
    utterance.pitch = defaultOptions.pitch;
    utterance.volume = defaultOptions.volume;

    window.speechSynthesis.speak(utterance);
  };

  /**
   * 現在の読み上げを停止する
   */
  const stop = () => {
    if (!isSpeechSupported) return;
    window.speechSynthesis.cancel();
  };

  return {
    speak,
    stop,
    isSupported: isSpeechSupported,
  };
}
