"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Search,
  Wand2,
} from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { toast } from "sonner";

// 単語の型定義
interface Word {
  id: number;
  word: string;
  meanings: string;
  part_of_speech?: string;
  choices?: string;
  ex?: string;
}

interface PaginationInfo {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export default function WordManagementClient() {
  const [words, setWords] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 20,
  });

  // 新規単語追加用のstate
  const [newWord, setNewWord] = useState({
    word: "",
    meanings: "",
    part_of_speech: "",
    choices: "",
    ex: "",
  });

  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [autoGenerating, setAutoGenerating] = useState(false);

  // 単語一覧を取得
  const fetchWords = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/words?page=${currentPage}${
          searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
        }`
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "単語の取得に失敗しました");
      }
      const data = await res.json();
      setWords(data.words);
      setPaginationInfo(data.pagination);
    } catch (error) {
      console.error("Error fetching words:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("単語一覧の取得に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 単語一覧を取得
    const fetchWords = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/words?page=${currentPage}${
            searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
          }`
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "単語の取得に失敗しました");
        }
        const data = await res.json();
        setWords(data.words);
        setPaginationInfo(data.pagination);
      } catch (error) {
        console.error("Error fetching words:", error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("単語一覧の取得に失敗しました");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWords();
  }, [searchQuery, currentPage]);

  // 単語を追加
  const addWord = async () => {
    try {
      const res = await fetch("/api/admin/words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newWord),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "単語の追加に失敗しました");
      }

      // 一覧を再取得
      setCurrentPage(1);
      await fetchWords();

      // フォームをリセット
      setNewWord({
        word: "",
        meanings: "",
        part_of_speech: "",
        choices: "",
        ex: "",
      });
      setIsAddDialogOpen(false);
      toast.success("単語を追加しました");
    } catch (error) {
      console.error("Error adding word:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("単語の追加に失敗しました");
      }
    }
  };

  // Geminiを使って単語を自動生成
  const generateWordWithGemini = async () => {
    const wordToGenerate = selectedWord?.word || newWord.word;
    if (!wordToGenerate) {
      toast.error("単語を入力してください");
      return;
    }

    setAutoGenerating(true);
    try {
      const res = await fetch("/api/admin/words/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word: wordToGenerate }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "単語の自動生成に失敗しました");
      }

      const data = await res.json();

      if (selectedWord) {
        setSelectedWord({
          ...selectedWord,
          meanings: data.meanings,
          part_of_speech: data.part_of_speech,
          choices: data.choices,
          ex: data.ex,
        });
      } else {
        setNewWord({
          ...newWord,
          meanings: data.meanings,
          part_of_speech: data.part_of_speech,
          choices: data.choices,
          ex: data.ex,
        });
      }
      toast.success("単語情報を自動生成しました");
    } catch (error) {
      console.error("Error generating word:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("単語の自動生成に失敗しました");
      }
    } finally {
      setAutoGenerating(false);
    }
  };

  // 単語を更新
  const updateWord = async () => {
    if (!selectedWord) return;

    try {
      const res = await fetch(`/api/admin/words/${selectedWord.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedWord),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "単語の更新に失敗しました");
      }

      // 一覧を再取得
      await fetchWords();
      // 選択解除
      setSelectedWord(null);
      toast.success("単語を更新しました");
    } catch (error) {
      console.error("Error updating word:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("単語の更新に失敗しました");
      }
    }
  };

  // 単語を削除
  const deleteWord = async (id: number) => {
    if (!confirm("本当にこの単語を削除しますか？")) return;

    try {
      const res = await fetch(`/api/admin/words/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "単語の削除に失敗しました");
      }

      // 一覧を再取得
      await fetchWords();
      toast.success("単語を削除しました");
    } catch (error) {
      console.error("Error deleting word:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("単語の削除に失敗しました");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー部分 */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="単語を検索..."
              value={searchQuery}
              className="pl-8"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              onKeyDown={(e) => e.key === "Enter" && fetchWords()}
            />
          </div>
          <Button
            onClick={() => {
              setCurrentPage(1);
              fetchWords();
            }}
          >
            検索
          </Button>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新規単語を追加
        </Button>
      </div>

      {/* 単語一覧 */}
      {loading ? (
        <div className="flex h-[200px] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>単語</TableHead>
                  <TableHead>意味</TableHead>
                  <TableHead>品詞</TableHead>
                  <TableHead>例文</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {words.map((word) => (
                  <TableRow key={word.id}>
                    <TableCell className="font-medium">{word.word}</TableCell>
                    <TableCell>{word.meanings}</TableCell>
                    <TableCell>{word.part_of_speech || "-"}</TableCell>
                    <TableCell>{word.ex || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedWord(word)}
                        >
                          編集
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteWord(word.id)}
                        >
                          削除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ページネーション */}
          {paginationInfo.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                前へ
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm">
                  {currentPage} / {paginationInfo.totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(paginationInfo.totalPages, p + 1)
                  )
                }
                disabled={currentPage === paginationInfo.totalPages}
              >
                次へ
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 新規追加ダイアログ */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新規単語を追加</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="word">単語</Label>
              <div className="flex gap-2">
                <Input
                  id="word"
                  value={newWord.word}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNewWord({ ...newWord, word: e.target.value })
                  }
                  required
                />
                <Button
                  variant="secondary"
                  onClick={generateWordWithGemini}
                  disabled={autoGenerating}
                >
                  {autoGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  AIで生成
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meanings">意味</Label>
              <Textarea
                id="meanings"
                value={newWord.meanings}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setNewWord({ ...newWord, meanings: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="part_of_speech">品詞</Label>
              <Input
                id="part_of_speech"
                value={newWord.part_of_speech}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewWord({ ...newWord, part_of_speech: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="choices">選択肢（カンマ区切り）</Label>
              <Input
                id="choices"
                value={newWord.choices}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewWord({ ...newWord, choices: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ex">例文</Label>
              <Textarea
                id="ex"
                value={newWord.ex}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setNewWord({ ...newWord, ex: e.target.value })
                }
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button onClick={addWord}>追加</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 編集ダイアログ */}
      <Dialog
        open={!!selectedWord}
        onOpenChange={(open) => !open && setSelectedWord(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>単語を編集</DialogTitle>
          </DialogHeader>
          {selectedWord && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-word">単語</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-word"
                    value={selectedWord.word}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSelectedWord({ ...selectedWord, word: e.target.value })
                    }
                    required
                  />
                  <Button
                    variant="secondary"
                    onClick={() => {
                      generateWordWithGemini().then(() => {
                        if (selectedWord) {
                          setSelectedWord({
                            ...selectedWord,
                            meanings: newWord.meanings,
                            part_of_speech: newWord.part_of_speech,
                            choices: newWord.choices,
                            ex: newWord.ex,
                          });
                        }
                      });
                    }}
                    disabled={autoGenerating}
                  >
                    {autoGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    AIで生成
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-meanings">意味</Label>
                <Textarea
                  id="edit-meanings"
                  value={selectedWord.meanings}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setSelectedWord({
                      ...selectedWord,
                      meanings: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-part_of_speech">品詞</Label>
                <Input
                  id="edit-part_of_speech"
                  value={selectedWord.part_of_speech || ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSelectedWord({
                      ...selectedWord,
                      part_of_speech: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-choices">選択肢（カンマ区切り）</Label>
                <Input
                  id="edit-choices"
                  value={selectedWord.choices || ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSelectedWord({
                      ...selectedWord,
                      choices: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ex">例文</Label>
                <Textarea
                  id="edit-ex"
                  value={selectedWord.ex || ""}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setSelectedWord({ ...selectedWord, ex: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedWord(null)}>
                  キャンセル
                </Button>
                <Button onClick={updateWord}>更新</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
