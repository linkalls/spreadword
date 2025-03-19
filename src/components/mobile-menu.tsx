'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { type SessionUser } from "@/types/auth";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  user: SessionUser | null;
}

// スクロール制御用のヘルパー関数
const usePreventScroll = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
};

// フックを定義してユーザーがadminかどうかを確認する
const useIsAdmin = (user: SessionUser | null) => {
  if (!user) return false;
  return user.role === "admin";
};

export function MobileMenu({ user }: MobileMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdmin = useIsAdmin(user);
  
  // スクロール制御の適用
  usePreventScroll(isMenuOpen);

  return (
    <>
      {/* モバイル用メニューボタン */}
      <button
        className="md:hidden p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-expanded={isMenuOpen}
      >
        <span className="sr-only">メニュー</span>
        {isMenuOpen ? (
          <svg
            className="w-7 h-7 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width={24}
            height={24}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-7 h-7 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width={24}
            height={24}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* モバイルメニュー */}
      <div
        className={cn(
          "md:hidden fixed top-[60px] left-0 w-full h-[calc(100vh-60px)] bg-white/95 backdrop-blur-sm shadow-lg",
          "transition-all duration-300 ease-out transform-gpu",
          "overflow-y-auto overscroll-contain",
          isMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
        aria-hidden={!isMenuOpen}
        role="dialog"
        aria-label="メインメニュー"
      >
        <nav className="px-4 py-6">
          <ul className="space-y-3" role="menu">
          <li role="none">
            <Link
              href="/"
              className="block py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-[0.98]"
              role="menuitem"
              onClick={() => setIsMenuOpen(false)}
            >
              ホーム
            </Link>
          </li>
          {!user && (
            <>
              <li role="none">
                <Link
                  href="/about"
                  className="block py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-[0.98]"
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
              </li>
              <li role="none">
                <Link
                  href="/features"
                  className="block py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-[0.98]"
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                >
                  機能
                </Link>
              </li>
              <li role="none">
                <Link
                  href="/contact"
                  className="block py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-[0.98]"
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                >
                  お問い合わせ
                </Link>
              </li>
              <li role="none">
                <Link
                  href="/blog"
                  className="block py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-[0.98]"
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ブログ
                </Link>
              </li>
            </>
          )}
          {user && (
            <>
              <li role="none">
                <Link
                  href="/words"
                  className="block py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-[0.98]"
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                >
                  単語一覧
                </Link>
              </li>
              <li role="none">
                <Link
                  href="/flashcards"
                  className="block py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-[0.98]"
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                >
                  フラッシュカード
                </Link>
              </li>
              <li role="none">
                <Link
                  href="/dashboard"
                  className="block py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-[0.98]"
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ダッシュボード
                </Link>
              </li>
              <li role="none">
                <Link
                  href="/wordlists"
                  className="block py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-[0.98]"
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                >
                  単語リスト
                </Link>
              </li>
              <li role="none">
                <Link
                  href="/quiz"
                  className="block py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-[0.98]"
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                >
                  単語クイズ
                </Link>
              </li>
              {isAdmin && (
                <li role="none">
                  <Link
                    href="/admin"
                    className="block py-3 px-4 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 active:scale-[0.98]"
                    role="menuitem"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    管理画面
                  </Link>
                </li>
              )}
            </>
          )}
          </ul>
        </nav>
      </div>
    </>
  );
}
