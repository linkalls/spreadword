"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

/**
 * セッション初期化コンポーネント
 * NextAuthのセッション状態を監視します
 */
export function SessionInitializer() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      // セッションがある場合のログ（デバッグ用）
      console.debug("Session initialized", {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      });
    }
  }, [session]);

  // 何もレンダリングしない
  return null;
}
