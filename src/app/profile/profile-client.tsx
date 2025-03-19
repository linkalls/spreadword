"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

interface ProfileClientProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

/**
 * プロフィールクライアントコンポーネント
 * ユーザー情報の表示と名前の変更機能を提供します
 */
export function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name || "");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 名前を更新する
   */
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) throw new Error("名前の更新に失敗しました");

      toast.success("名前を更新しました");
      router.refresh(); // ページを更新して変更を反映
    } catch (error) {
      toast.error("エラーが発生しました");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-8">
        {/* プロフィール画像とメールアドレス */}
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-2xl">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || ""}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{user.name?.[0].toUpperCase() || "U"}</span>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">メールアドレス</p>
            <p className="font-medium">{user.email}</p>
          </div>
        </div>

        {/* 名前変更フォーム */}
        <form onSubmit={handleUpdateName} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">名前</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="名前を入力"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "更新中..." : "保存"}
          </Button>
        </form>
      </div>
    </div>
  );
}
