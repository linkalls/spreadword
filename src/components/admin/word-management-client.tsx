"use client"

import { useState, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// 単語の型定義
interface Word {
  id: number
  word: string
  meanings: string
  part_of_speech?: string
  choices?: string
  ex?: string
}

export default function WordManagementClient() {
  const [words, setWords] = useState<Word[]>([])
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  // 新規単語追加用のstate
  const [newWord, setNewWord] = useState({
    word: "",
    meanings: "",
    part_of_speech: "",
    choices: "",
    ex: "",
  })

  // 単語一覧を取得
  const fetchWords = async () => {
    try {
      const res = await fetch(`/api/admin/words${searchQuery ? `?search=${searchQuery}` : ""}`)
      if (!res.ok) throw new Error("Failed to fetch words")
      const data = await res.json()
      setWords(data)
    } catch (error) {
      console.error("Error fetching words:", error)
    }
  }

  // 単語を追加
  const addWord = async () => {
    try {
      const res = await fetch("/api/admin/words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newWord),
      })
      if (!res.ok) throw new Error("Failed to add word")
      
      // 一覧を再取得
      fetchWords()
      
      // フォームをリセット
      setNewWord({
        word: "",
        meanings: "",
        part_of_speech: "",
        choices: "",
        ex: "",
      })
    } catch (error) {
      console.error("Error adding word:", error)
    }
  }

  // 単語を更新
  const updateWord = async () => {
    if (!selectedWord) return
    
    try {
      const res = await fetch(`/api/admin/words/${selectedWord.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedWord),
      })
      if (!res.ok) throw new Error("Failed to update word")
      
      // 一覧を再取得
      fetchWords()
      // 選択解除
      setSelectedWord(null)
    } catch (error) {
      console.error("Error updating word:", error)
    }
  }

  // 単語を削除
  const deleteWord = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/words/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete word")
      
      // 一覧を再取得
      fetchWords()
    } catch (error) {
      console.error("Error deleting word:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* 検索フォーム */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="単語を検索..."
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
        />
        <Button onClick={fetchWords}>検索</Button>
      </div>

      {/* 新規単語追加フォーム */}
      <div className="p-4 bg-white rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold mb-4">新規単語を追加</h3>
        <div className="space-y-2">
          <Label htmlFor="word">単語</Label>
          <Input
            id="word"
            value={newWord.word}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewWord({ ...newWord, word: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meanings">意味</Label>
          <Textarea
            id="meanings"
            value={newWord.meanings}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewWord({ ...newWord, meanings: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="part_of_speech">品詞</Label>
          <Input
            id="part_of_speech"
            value={newWord.part_of_speech}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewWord({ ...newWord, part_of_speech: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="choices">選択肢（カンマ区切り）</Label>
          <Input
            id="choices"
            value={newWord.choices}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewWord({ ...newWord, choices: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ex">例文</Label>
          <Textarea
            id="ex"
            value={newWord.ex}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewWord({ ...newWord, ex: e.target.value })}
          />
        </div>
        <Button onClick={addWord}>追加</Button>
      </div>

      {/* 単語一覧 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">単語一覧</h3>
        <div className="grid gap-4">
          {words.map((word) => (
            <div
              key={word.id}
              className="p-4 bg-white rounded-lg shadow flex justify-between items-start"
            >
              <div>
                <h4 className="font-semibold">{word.word}</h4>
                <p className="text-sm text-gray-600">{word.meanings}</p>
                {word.part_of_speech && (
                  <p className="text-sm text-gray-500">{word.part_of_speech}</p>
                )}
                {word.ex && <p className="text-sm text-gray-600">例文: {word.ex}</p>}
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedWord(word)}
                >
                  編集
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteWord(word.id)}
                >
                  削除
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 編集モーダル */}
      {selectedWord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold">単語を編集</h3>
            <div className="space-y-2">
              <Label htmlFor="edit-word">単語</Label>
              <Input
                id="edit-word"
                value={selectedWord.word}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSelectedWord({ ...selectedWord, word: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-meanings">意味</Label>
              <Textarea
                id="edit-meanings"
                value={selectedWord.meanings}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setSelectedWord({ ...selectedWord, meanings: e.target.value })
                }
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-choices">選択肢（カンマ区切り）</Label>
              <Input
                id="edit-choices"
                value={selectedWord.choices || ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSelectedWord({ ...selectedWord, choices: e.target.value })
                }
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
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedWord(null)}>
                キャンセル
              </Button>
              <Button onClick={updateWord}>更新</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
