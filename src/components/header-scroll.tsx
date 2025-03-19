"use client";

import { useEffect, useState, useCallback } from "react";

type DebouncedFunction<T extends (...args: never[]) => void> = (...args: Parameters<T>) => void;

export function HeaderScroll({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  // デバウンス関数
  const debounce = <T extends (...args: never[]) => void>(
    func: T,
    wait: number
  ): DebouncedFunction<T> => {
    let timeout: ReturnType<typeof setTimeout>;
    
    return (...args: Parameters<T>) => {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // スクロールハンドラー
  const handleScroll = useCallback(() => {
    const debouncedScroll = debounce(() => {
      // スクロール位置が50px以上の場合にヘッダーの背景を変更
      setScrolled(window.scrollY > 50);
    }, 10); // デバウンス時間を10msに設定
    
    return debouncedScroll();
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-200 ease-in-out ${
        scrolled
          ? "bg-white/90 backdrop-blur-[2px] shadow-sm py-2"
          : "bg-gradient-to-r from-blue-50 to-indigo-50 py-4"
      }`}
    >
      {children}
    </header>
  );
}
