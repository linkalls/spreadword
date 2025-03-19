"use client";

import { Button } from "@/components/ui/button";
import { CreateWordListDialog } from "@/components/word-list/create-word-list-dialog";
import type { WordList } from "@/db/schema";
import Link from "next/link";
import { useState } from "react";

type WordListWithWords = WordList & {
  words?: {
    word: string;
    meanings: string;
  }[];
};

type Props = {
  lists: WordListWithWords[];
};

export function WordListClient({ lists }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (lists.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-base sm:text-lg">単語リストがまだありません</p>
        <Button onClick={() => setIsDialogOpen(true)} className="mt-3 sm:mt-4">
          新しいリストを作成
        </Button>
        <CreateWordListDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsDialogOpen(true)}>
          新しいリストを作成
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => (
          <div
            key={list.id}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
          >
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2 line-clamp-1">
                {list.name}
              </h3>
              {list.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {list.description}
                </p>
              )}
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {list.isPublic ? "公開" : "非公開"}
                </span>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/quiz?listId=${list.id}`}
                  className="inline-flex items-center justify-center px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                >
                  クイズ
                </Link>
                <Link
                  href={`/wordlists/${list.id}`}
                  className="inline-flex items-center justify-center px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  詳細を見る
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CreateWordListDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
