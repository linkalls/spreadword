import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import type { Word } from "@/db/schema";

type Props = {
  listId: string;
  isOpen: boolean;
  onClose: () => void;
};

/**
 * 単語追加ダイアログ
 */
export function AddWordsDialog({ listId, isOpen, onClose }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [words, setWords] = useState<Word[]>([]);
  const [selectedWords, setSelectedWords] = useState<Set<number>>(new Set());

  // 単語を検索
  useEffect(() => {
    if (!searchTerm.trim()) {
      setWords([]);
      return;
    }

    const searchWords = async () => {
      try {
        const res = await fetch(`/api/words/search?q=${encodeURIComponent(searchTerm)}`);
        if (!res.ok) {
          throw new Error("単語の検索に失敗しました");
        }
        const data = await res.json();
        setWords(data);
      } catch (err) {
        console.error("Failed to search words:", err);
        setWords([]);
      }
    };

    // デバウンス処理
    const timeoutId = setTimeout(searchWords, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleToggleWord = (wordId: number) => {
    const newSelected = new Set(selectedWords);
    if (selectedWords.has(wordId)) {
      newSelected.delete(wordId);
    } else {
      newSelected.add(wordId);
    }
    setSelectedWords(newSelected);
  };

  const handleSubmit = async () => {
    if (selectedWords.size === 0) return;

    setIsLoading(true);
    setError("");

    try {
      const promises = Array.from(selectedWords).map(wordId =>
        fetch(`/api/wordlists/${listId}/words`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ wordId }),
        })
      );

      const results = await Promise.all(promises);
      const failedResults = results.filter(res => !res.ok);

      if (failedResults.length > 0) {
        throw new Error("一部の単語の追加に失敗しました");
      }

      // 成功したらリストページをリフレッシュ
      router.refresh();
      onClose();
      setSelectedWords(new Set());
      setSearchTerm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "単語の追加に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>単語を追加</SheetTitle>
        </SheetHeader>
        
        <div className="mt-4 space-y-4 h-[calc(100vh-12rem)]">
          <div className="sticky top-0 bg-background pt-2 pb-4 z-10">
            <Label htmlFor="search">検索</Label>
            <Input
              id="search"
              type="search"
              placeholder="単語を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <ScrollArea className="h-[calc(100%-5rem)] pr-4">
            {words.length > 0 ? (
              <div className="space-y-2">
                {words.map((word) => (
                  <div
                    key={word.id}
                    className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    onClick={() => handleToggleWord(word.id)}
                  >
                    <Checkbox
                      checked={selectedWords.has(word.id)}
                      onCheckedChange={() => handleToggleWord(word.id)}
                    />
                    <div className="flex-1 cursor-pointer">
                      <div className="font-medium">{word.word}</div>
                      <div className="text-sm text-muted-foreground">
                        {word.meanings}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm.trim() ? (
              <div className="text-center py-4 text-muted-foreground">
                単語が見つかりませんでした
              </div>
            ) : null}
          </ScrollArea>
        </div>

        {error && (
          <p className="text-sm text-destructive mt-4">{error}</p>
        )}

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedWords.size}個の単語を選択中
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || selectedWords.size === 0}
            >
              {isLoading ? "追加中..." : "追加する"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
