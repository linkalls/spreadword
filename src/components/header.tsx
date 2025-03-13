"use client";

import { signIn, signOut } from "next-auth/react";
import Img from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { userAtom } from "@/atoms/userAtom";

export default function Header() {
  const user = useAtomValue(userAtom);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // スクロールによるヘッダースタイル変更
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-md py-2"
          : "bg-gradient-to-r from-blue-50 to-indigo-50 py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all"
        >
          SpreadWord
        </Link>

        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            <li>
              <Link
                href="/"
                className="relative py-2 px-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 before:content-[''] before:absolute before:-bottom-1 before:left-0 before:w-full before:h-0.5 before:bg-blue-600 before:origin-right before:scale-x-0 before:transition-transform hover:before:scale-x-100 hover:before:origin-left"
              >
                ホーム
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="relative py-2 px-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 before:content-[''] before:absolute before:-bottom-1 before:left-0 before:w-full before:h-0.5 before:bg-blue-600 before:origin-right before:scale-x-0 before:transition-transform hover:before:scale-x-100 hover:before:origin-left"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/features"
                className="relative py-2 px-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 before:content-[''] before:absolute before:-bottom-1 before:left-0 before:w-full before:h-0.5 before:bg-blue-600 before:origin-right before:scale-x-0 before:transition-transform hover:before:scale-x-100 hover:before:origin-left"
              >
                機能
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="relative py-2 px-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 before:content-[''] before:absolute before:-bottom-1 before:left-0 before:w-full before:h-0.5 before:bg-blue-600 before:origin-right before:scale-x-0 before:transition-transform hover:before:scale-x-100 hover:before:origin-left"
              >
                お問い合わせ
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center space-x-4">
          {!user ? (
            <button
              onClick={() => signIn()}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              ログイン
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-blue-50 rounded-full py-1 px-3 border border-blue-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white overflow-hidden">
                  {user.image ? (
                    <Img
                      src={user.image}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      width={32}
                      height={32}
                    />
                  ) : (
                    <span className="font-medium">
                      {user.name[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">
                  {user.name}
                </span>
              </div>
              <button
                onClick={() => signOut({ redirectTo: "/" })}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all duration-200"
              >
                ログアウト
              </button>
            </div>
          )}

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
        </div>
      </div>

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
        </ul>
      </div>
    </header>
  );
}
