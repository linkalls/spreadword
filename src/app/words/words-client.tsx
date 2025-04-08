"use client";

import { WordProgress, ProgressSummary } from "@/components/word-progress";
import { WordSearch } from "@/components/word-search";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Wand2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Word {
  id: number;
  word: string;
  meanings: string;
  part_of_speech?: string | null;
  complete: number | boolean;
}

interface Summary {
  total: number;
  completed: number;
  percentage: number;
}

interface WordsClientProps {
  initialSummary: Summary;
  initialWords: {
    words: Word[];
    totalPages: number;
    currentPage: number;
  };
  search: string;
}

export function WordsClient({ initialSummary, initialWords, search }: WordsClientProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [newWord, setNewWord] = useState({
    word: "",
    meanings: "",
    part_of_speech: "",
    choices: "",
    ex: "",
  });

  // 単語の自動生成
  const generateWordWithGemini = async () => {
    if (!newWord.word) {
      toast.error("単語を入力してください");
      return;
    }

    setAutoGenerating(true);
    try {
      const res = await fetch("/api/words/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word: newWord.word }),
      });

      if (!res.ok) throw new Error("単語の生成に失敗しました");

      const { word: generatedWord } = await res.json();
      setNewWord({
        ...newWord,
        meanings: generatedWord.meanings,
        part_of_speech: generatedWord.part_of_speech || "",
        choices: Array.isArray(generatedWord.choices) ? generatedWord.choices.join(", ") : "",
        ex: generatedWord.ex || "",
      });

      toast.success("単語情報を生成しました");
    } catch {
      toast.error("単語の生成に失敗しました");
    } finally {
      setAutoGenerating(false);
    }
  };

  // 単語の追加
  const addWord = async () => {
    try {
      const wordData = {
        ...newWord,
        choices: newWord.choices.split(",").map(choice => choice.trim()),
      };

      const res = await fetch("/api/words/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wordData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "単語の投稿に失敗しました");
      }

      toast.success("単語を投稿しました。承認までしばらくお待ちください。");
      setNewWord({
        word: "",
        meanings: "",
        part_of_speech: "",
        choices: "",
        ex: "",
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "単語の投稿に失敗しました");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">単語学習</h1>
        <div className="flex gap-4">
          <WordSearch />
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            単語を追加
          </Button>
        </div>
      </div>
      
      {/* 進捗サマリー */}
      <ProgressSummary summary={initialSummary} />

      {/* 単語リスト */}
      <div className="space-y-4">
        {initialWords.words.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            単語がまだ登録されていません
          </div>
        ) : (
          <>
            {initialWords.words.map((word) => (
              <WordProgress key={word.id} word={word} />
            ))}
            
            {/* ページネーション */}
            <Pagination 
              currentPage={initialWords.currentPage}
              totalPages={initialWords.totalPages}
              search={search}
            />
          </>
        )}
      </div>

      {/* 単語追加モーダル */}
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
                  onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
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
              <Label htmlFor="meanings">意味 *</Label>
              <Textarea
                id="meanings"
                value={newWord.meanings}
                onChange={(e) => setNewWord({ ...newWord, meanings: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="part_of_speech">品詞</Label>
              <Input
                id="part_of_speech"
                value={newWord.part_of_speech}
                onChange={(e) => setNewWord({ ...newWord, part_of_speech: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="choices">選択肢（カンマ区切り） *</Label>
              <Input
                id="choices"
                value={newWord.choices}
                onChange={(e) => setNewWord({ ...newWord, choices: e.target.value })}
                placeholder="誤答1, 誤答2, 誤答3, 正解"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ex">例文</Label>
              <Textarea
                id="ex"
                value={newWord.ex}
                onChange={(e) => setNewWord({ ...newWord, ex: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button onClick={addWord}>投稿する</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
