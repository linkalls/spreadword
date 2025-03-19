"use client";

import { useEffect, useState } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Search } from "lucide-react";

interface PublicWordList {
  id: number;
  name: string;
  description: string | null;
  userId: string;
  createdAt: Date;
  userName?: string;
}

export default function SearchPublicLists() {
  const [searchTerm, setSearchTerm] = useState("");
  const [lists, setLists] = useState<PublicWordList[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm) {
      const searchLists = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/wordlists/search?q=${encodeURIComponent(searchTerm)}`);
          if (!response.ok) throw new Error("検索に失敗しました");
          const data = await response.json();
          setLists(data);
        } catch (error) {
          console.error("Error searching word lists:", error);
        } finally {
          setLoading(false);
        }
      };

      // Debounce search
      const timer = setTimeout(() => {
        searchLists();
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setLists([]);
    }
  }, [searchTerm]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="search"
          placeholder="パブリックな単語リストを検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
      </div>

      {loading ? (
        <div className="text-center">検索中...</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {lists.map((list) => (
            <Card key={list.id} className="p-4 h-full flex flex-col">
              <div className="flex-1">
                <h3 className="font-bold mb-2 line-clamp-1">{list.name}</h3>
                {list.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {list.description}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  作成者: {list.userName || "Unknown"}
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.location.href = `/wordlists/${list.id}`;
                  }}
                >
                  詳細を見る
                </Button>
              </div>
            </Card>
          ))}
          {lists.length === 0 && searchTerm && (
            <div className="text-center text-gray-500">
              検索結果が見つかりませんでした
            </div>
          )}
        </div>
      )}
    </div>
  );
}
