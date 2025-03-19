"use client";

import { Button } from "@/components/ui/button";
import { AddWordsDialog } from "@/components/word-list/add-words-dialog";
import { EditWordListDialog } from "@/components/word-list/edit-word-list-dialog";
import { Input } from "@/components/ui/input";
import WordListFlashCard from "@/components/word-list/word-list-flashcard";
import WordListPDFButton from "@/components/word-list/word-list-pdf";
import type { Word, WordList } from "@/db/schema";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface Props {
  list: WordList;
  words: (Word & {
    notes?: string | null;
    addedAt: Date;
    progress?: {
      complete: number;
      mistakeCount: number;
      lastMistakeDate: string;
    };
  })[];
  isOwner: boolean;
}

/**
 * 単語リスト詳細のクライアントコンポーネント
 */
export function WordListDetailClient({ list, words, isOwner }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddWordsDialogOpen, setIsAddWordsDialogOpen] = useState(false);
  const [isRemovingWord, setIsRemovingWord] = useState<number | null>(null);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [showFlashCards, setShowFlashCards] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // 検索結果のフィルタリング
  const filteredWords = useMemo(() => {
    if (!debouncedSearch) return words;
    return words.filter(word => 
      word.word.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      word.meanings.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [words, debouncedSearch]);

  // コピーメッセージの自動非表示
  useEffect(() => {
    if (showCopiedMessage) {
      const timer = setTimeout(() => {
        setShowCopiedMessage(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showCopiedMessage]);

  // シェアリンクをコピー
  const handleShare = async () => {
    if (!list.isPublic || !list.shareId) {
      alert("公開リストのみシェアできます");
      return;
    }

    try {
      const shareUrl = `${window.location.origin}/wordlists/share/${list.shareId}`;
      await navigator.clipboard.writeText(shareUrl);
      setShowCopiedMessage(true);
    } catch (err) {
      alert("リンクのコピーに失敗しました");
      console.error(err);
    }
  };

  const handleDeleteList = async () => {
    if (!confirm("このリストを削除してもよろしいですか？")) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/wordlists/${list.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("削除に失敗しました");
      }

      router.refresh();
      router.push("/wordlists");
    } catch (error) {
      alert("リストの削除に失敗しました");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{list.name}</h1>
          {list.description && (
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              {list.description}
            </p>
          )}
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            {list.isPublic ? "公開" : "非公開"}リスト
          </p>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <div className="flex gap-2 items-center">
              {showCopiedMessage && (
                <span className="text-sm text-green-600">コピーしました！</span>
              )}
              {list.isPublic && (
                <Button variant="outline" onClick={handleShare}>
                  シェア
                </Button>
              )}
              <WordListPDFButton
                list={list}
                words={words.map((w) => ({
                  english: w.word,
                  japanese: Array.isArray(w.meanings)
                    ? w.meanings[0]
                    : w.meanings,
                }))}
              />
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(true)}
              >
                編集
              </Button>
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteList}
              disabled={isDeleting}
            >
              {isDeleting ? "削除中..." : "削除"}
            </Button>
          </div>
        )}
      </div>

      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full">
          <div className="relative flex-1 max-w-md">
            <form 
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                // フォーカスを外す
                (document.activeElement as HTMLElement)?.blur();
              }}
            >
              <div className="relative">
                <Input
                  type="search"
                  placeholder="単語を検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-20"
                />
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center">
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="h-7 px-2 mr-1"
                    >
                      ✕
                    </Button>
                  )}
                  <Button type="submit" variant="ghost" size="sm" className="h-7 px-2">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
          <div className="flex gap-2">
            <h2 className="text-lg sm:text-xl font-semibold">
              登録単語 ({filteredWords.length})
            </h2>
            {words.length > 0 && (
              <>
                <Button
                  variant="default"
                  onClick={() => router.push(`/quiz?list=${list.id}`)}
                >
                  クイズを開始
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFlashCards(!showFlashCards)}
                >
                  {showFlashCards ? "リストに戻る" : "フラッシュカード"}
                </Button>
              </>
            )}
            {isOwner && (
              <Button
                variant="outline"
                onClick={() => setIsAddWordsDialogOpen(true)}
              >
                単語を追加
              </Button>
            )}
          </div>
        </div>
      </div>

      {showFlashCards ? (
        <div className="mt-4">
          <WordListFlashCard listId={list.id.toString()} />
        </div>
      ) : filteredWords.length === 0 ? (
        <div className="text-center py-8">
          {debouncedSearch ? (
            <p className="text-gray-600">
              「{debouncedSearch}」に一致する単語は見つかりませんでした
            </p>
          ) : (
            <p className="text-gray-500">まだ単語が登録されていません</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredWords.map((word) => (
            <div
              key={word.id}
              className="p-3 sm:p-4 border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold">
                      {word.word}
                    </h3>
                    {word.progress && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 bg-gray-200 rounded-full w-24">
                          <div
                            className={`h-2 rounded-full ${
                              word.progress.complete === 1
                                ? "bg-green-500"
                                : word.progress.mistakeCount > 0
                                ? "bg-yellow-500"
                                : "bg-gray-300"
                            }`}
                            style={{
                              width: `${
                                word.progress.complete === 1
                                  ? 100
                                  : word.progress.mistakeCount > 0
                                  ? Math.min(
                                      ((3 - word.progress.mistakeCount) / 3) *
                                        100,
                                      100
                                    )
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">
                          {word.progress.complete === 1
                            ? "習得済み"
                            : word.progress.mistakeCount > 0
                            ? `${Math.min(
                                ((3 - word.progress.mistakeCount) / 3) * 100,
                                100
                              ).toFixed(0)}%`
                            : "未学習"}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-sm sm:text-base text-gray-600">
                    {word.meanings}
                  </p>
                  {word.notes && (
                    <p className="mt-2 text-sm text-gray-500">
                      メモ: {word.notes}
                    </p>
                  )}
                  {word.progress?.mistakeCount &&
                  word.progress?.mistakeCount > 0 ? (
                    <p className="mt-1 text-sm text-red-500">
                      間違えた回数: {word.progress.mistakeCount}回
                      {word.progress.lastMistakeDate &&
                        ` (最終: ${new Date(
                          word.progress.lastMistakeDate
                        ).toLocaleDateString()})`}
                    </p>
                  ) : null}
                </div>
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => {
                      if (
                        confirm(
                          "この単語をリストから削除してもよろしいですか？"
                        )
                      ) {
                        setIsRemovingWord(word.id);
                        fetch(`/api/wordlists/${list.id}/words`, {
                          method: "DELETE",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ wordId: word.id }),
                        })
                          .then((res) => {
                            if (!res.ok) {
                              throw new Error("削除に失敗しました");
                            }
                            router.refresh();
                          })
                          .catch((error) => {
                            alert("単語の削除に失敗しました");
                            console.error(error);
                          })
                          .finally(() => {
                            setIsRemovingWord(null);
                          });
                      }
                    }}
                    disabled={isRemovingWord === word.id}
                  >
                    {isRemovingWord === word.id ? "削除中..." : "削除"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 編集ダイアログ */}
      <EditWordListDialog
        list={list}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />

      {/* 単語追加ダイアログ */}
      <AddWordsDialog
        listId={list.id}
        isOpen={isAddWordsDialogOpen}
        onClose={() => setIsAddWordsDialogOpen(false)}
      />
    </div>
  );
}
