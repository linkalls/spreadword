"use client";

import { signIn, signOut } from "next-auth/react";
import { type AuthButtonsProps } from "@/types/auth";

export function AuthButtons({ user }: AuthButtonsProps) {
  return !user ? (
    <button
      onClick={() => signIn()}
      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
    >
      ログイン
    </button>
  ) : (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all duration-200"
    >
      ログアウト
    </button>
  );
}
