"use client";

import { userAtom, loadingAtom } from "@/atoms/userAtom";
import { useSetAtom } from "jotai";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function SessionInitializer() {
  const { data: session, status } = useSession();
  const setUser = useSetAtom(userAtom);
  const setLoading = useSetAtom(loadingAtom);

  useEffect(() => {
    // セッションの読み込み状態を設定
    setLoading(status === "loading");

    if (session?.user) {
      setUser({
        id: session.user.id || "",
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || undefined,
      });
    } else {
      setUser(null);
    }
  }, [session, setUser, status, setLoading]);

  return null;
}