"use client";

import { useCallback, useState, useEffect } from 'react';

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);

  // コンポーネントのアンマウント時に音声を停止
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (speaking) return;

    // ブラウザの音声合成APIがサポートされているか確認
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      return;
    }

    try {
      // 音声合成の設定
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";

      // 音声再生完了時のハンドラを設定してから状態を更新
      utterance.onend = () => {
        setSpeaking(false);
      };

      // エラー発生時のハンドラ
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setSpeaking(false);
      };

      // 音声の中断を防ぐために既存の音声をキャンセル
      window.speechSynthesis.cancel();

      // 一時的なポーズ状態をリセット
      window.speechSynthesis.resume();

      // 状態を更新してから音声再生を開始
      setSpeaking(true);

      // 音声再生完了を確実に検知するためのタイムアウト
      const timeoutId = setTimeout(() => {
        if (!window.speechSynthesis.speaking) {
          setSpeaking(false);
        }
      }, 5000); // 5秒後にチェック

      // 音声再生開始
      window.speechSynthesis.speak(utterance);

      // クリーンアップ関数でタイムアウトをクリア
      return () => clearTimeout(timeoutId);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setSpeaking(false);
    }
  }, [speaking]);

  return {
    speak,
    speaking
  };
}
