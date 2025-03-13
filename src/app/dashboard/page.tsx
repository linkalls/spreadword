"use client";

import { userAtom } from "@/atoms/userAtom";
import { useAtomValue } from "jotai";

export default function DashboardPage() {
  const user = useAtomValue(userAtom);

  if (!user) {
    return <p className="text-center">ログインしていません</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>ようこそ {user.name} さん！</p>
      <p>メールアドレス: {user.email}</p>
    </div>
  );
}
