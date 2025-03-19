"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { useCallback, useState } from "react";
import { Search, Loader2, Upload, Trash } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";

interface Word {
  id: number;
  word: string;
  meanings: string;
  part_of_speech: string | null;
  choices: string | null;
  ex: string | null;
}

interface PaginationInfo {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export function WordManagementClient() {
  const [words, setWords] = useState<Word[]>([]);
  const [selectedWords, setSelectedWords] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 20,
  });

  // 単語一覧の取得
  const fetchWords = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/words?page=${currentPage}&search=${encodeURIComponent(debouncedSearch)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch words");
      }
      const data = await response.json();
      setWords(data.words);
      setPaginationInfo(data.pagination);
    } catch (error) {
      console.error("Error fetching words:", error);
      toast.error("単語の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  // CSV/JSONファイルのインポート処理
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let importedWords: Omit<Word, "id">[];

      if (file.name.endsWith(".csv")) {
        // CSVパース処理
        importedWords = text
          .split("\n")
          .slice(1) // ヘッダーをスキップ
          .filter(line => line.trim())
          .map(line => {
            const [word, meanings, part_of_speech, choices, ex] = line.split(",");
            return { word, meanings, part_of_speech, choices, ex };
          });
      } else if (file.name.endsWith(".json")) {
        // JSONパース処理
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          throw new Error("Invalid JSON format: expected array");
        }
        importedWords = parsed.map(item => ({
          word: String(item.word),
          meanings: String(item.meanings),
          part_of_speech: item.part_of_speech ? String(item.part_of_speech) : null,
          choices: item.choices ? String(item.choices) : null,
          ex: item.ex ? String(item.ex) : null,
        }));
      } else {
        throw new Error("Unsupported file format");
      }

      const response = await fetch("/api/admin/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words: importedWords }),
      });

      if (!response.ok) throw new Error("Failed to import words");

      toast.success(`${importedWords.length}件の単語をインポートしました`);
      fetchWords();
    } catch (error) {
      console.error("Error importing words:", error);
      toast.error("ファイルのインポートに失敗しました");
    }
  };

  // 選択した単語の一括削除
  const handleBulkDelete = async () => {
    if (selectedWords.size === 0) return;

    try {
      const response = await fetch("/api/admin/words", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedWords) }),
      });

      if (!response.ok) throw new Error("Failed to delete words");

      toast.success(`${selectedWords.size}件の単語を削除しました`);
      setSelectedWords(new Set());
      fetchWords();
    } catch (error) {
      console.error("Error deleting words:", error);
      toast.error("単語の削除に失敗しました");
    }
  };

  // 単語の選択状態を切り替え
  const toggleWordSelection = (wordId: number) => {
    const newSelection = new Set(selectedWords);
    if (newSelection.has(wordId)) {
      newSelection.delete(wordId);
    } else {
      newSelection.add(wordId);
    }
    setSelectedWords(newSelection);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="単語を検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <div className="flex gap-2">
          <Label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          >
            <Upload className="mr-2 h-4 w-4" />
            インポート
          </Label>
          <Input
            id="file-upload"
            type="file"
            accept=".csv,.json"
            onChange={handleFileImport}
            className="hidden"
          />
          {selectedWords.size > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
            >
              <Trash className="mr-2 h-4 w-4" />
              選択した単語を削除
            </Button>
          )}
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedWords.size === words.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedWords(new Set(words.map(w => w.id)));
                    } else {
                      setSelectedWords(new Set());
                    }
                  }}
                  className="rounded border-gray-300"
                />
              </TableHead>
              <TableHead>単語</TableHead>
              <TableHead>意味</TableHead>
              <TableHead>品詞</TableHead>
              <TableHead>例文</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {words.map((word) => (
              <TableRow key={word.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedWords.has(word.id)}
                    onChange={() => toggleWordSelection(word.id)}
                    className="rounded border-gray-300"
                  />
                </TableCell>
                <TableCell>{word.word}</TableCell>
                <TableCell>{word.meanings}</TableCell>
                <TableCell>{word.part_of_speech}</TableCell>
                <TableCell>{word.ex}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* ページネーション */}
      {paginationInfo.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            前へ
          </Button>
          <span className="flex items-center">
            {currentPage} / {paginationInfo.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(paginationInfo.totalPages, prev + 1))}
            disabled={currentPage === paginationInfo.totalPages}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  );
}
