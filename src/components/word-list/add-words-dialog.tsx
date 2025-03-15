import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Word } from "@/db/schema";

type Props = {
  listId: number;
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

  if (!isOpen) return null;

  const handleToggleWord = (wordId: number) => {
    const newSelected = new Set(selectedWords);
    if (selectedWords.has(wordId)) {
      newSelected.delete(wordId);
    } else {
      newSelected.add(wordId);
    }
    setSelectedWords(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "単語の追加に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <h2 className="text-xl font-bold mb-4">単語を追加</h2>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="space-y-4 flex-1 overflow-hidden">
            <div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="単語を検索..."
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {words.length > 0 ? (
                <div className="grid gap-2">
                  {words.map((word) => (
                    <div
                      key={word.id}
                      className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleToggleWord(word.id)}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedWords.has(word.id)}
                          onChange={() => handleToggleWord(word.id)}
                          className="mt-1"
                        />
                        <div>
                          <h3 className="font-medium">{word.word}</h3>
                          <p className="text-sm text-gray-600">{word.meanings}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchTerm.trim() ? (
                <p className="text-center py-4 text-gray-500">
                  単語が見つかりませんでした
                </p>
              ) : null}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 mt-4">
              {error}
            </p>
          )}

          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              {selectedWords.size}個の単語を選択中
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={isLoading || selectedWords.size === 0}
              >
                {isLoading ? "追加中..." : "追加する"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
