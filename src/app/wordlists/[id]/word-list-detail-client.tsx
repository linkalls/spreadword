"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EditWordListDialog } from "@/components/word-list/edit-word-list-dialog";
import { AddWordsDialog } from "@/components/word-list/add-words-dialog";
import type { WordList, Word } from "@/db/schema";

interface Props {
  list: WordList;
  words: (Word & {
    notes?: string | null;
    addedAt: Date;
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
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{list.name}</h1>
          {list.description && (
            <p className="mt-2 text-gray-600">{list.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {list.isPublic ? "公開" : "非公開"}リスト
          </p>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <div className="flex gap-2 items-center">
              {showCopiedMessage && (
                <span className="text-sm text-green-600">
                  コピーしました！
                </span>
              )}
              {list.isPublic && (
                <Button
                  variant="outline"
                  onClick={handleShare}
                >
                  シェア
                </Button>
              )}
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

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          登録単語 ({words.length})
        </h2>
        {isOwner && (
          <Button
            variant="outline"
            onClick={() => setIsAddWordsDialogOpen(true)}
          >
            単語を追加
          </Button>
        )}
      </div>

      {words.length === 0 ? (
        <p className="text-center py-8 text-gray-500">
          まだ単語が登録されていません
        </p>
      ) : (
        <div className="grid gap-4">
          {words.map((word) => (
            <div
              key={word.id}
              className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{word.word}</h3>
                  <p className="mt-1 text-gray-600">{word.meanings}</p>
                  {word.notes && (
                    <p className="mt-2 text-sm text-gray-500">
                      メモ: {word.notes}
                    </p>
                  )}
                </div>
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => {
                      if (confirm("この単語をリストから削除してもよろしいですか？")) {
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
