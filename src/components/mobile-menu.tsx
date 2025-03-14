"use client";

import Link from "next/link";
import { useState } from "react";
import { type SessionUser } from "@/types/auth";

interface MobileMenuProps {
  user: SessionUser | null;
}

export function MobileMenu({ user }: MobileMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* モバイル用メニューボタン */}
      <button
        className="md:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-expanded={isMenuOpen}
      >
        <span className="sr-only">メニュー</span>
        {isMenuOpen ? (
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
        className={`md:hidden px-4 pt-2 pb-4 bg-white/95 backdrop-blur-sm shadow-lg absolute w-full transform transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-10 pointer-events-none"
        }`}
      >
        <ul className="space-y-3">
          <li>
            <Link
              href="/"
              className="block py-2 px-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              ホーム
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="block py-2 px-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/features"
              className="block py-2 px-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              機能
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="block py-2 px-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              お問い合わせ
            </Link>
          </li>
          {user && (
            <>
              <li>
                <Link
                  href="/dashboard"
                  className="block py-2 px-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ダッシュボード
                </Link>
              </li>
              <li>
                <Link
                  href="/quiz"
                  className="block py-2 px-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  単語クイズ
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </>
  );
}
