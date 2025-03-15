"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreateWordListDialog } from "@/components/word-list/create-word-list-dialog";
import type { WordList } from "@/db/schema";

type Props = {
  lists: WordList[];
};

export function WordListClient({ lists }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (lists.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg">単語リストがまだありません</p>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="mt-4"
        >
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
      <div className="flex justify-end mb-6">
        <Button onClick={() => setIsDialogOpen(true)}>
          新しいリストを作成
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => (
          <div
            key={list.id}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-bold">{list.name}</h3>
            {list.description && (
              <p className="mt-2 text-gray-600">{list.description}</p>
            )}
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {list.isPublic ? "公開" : "非公開"}
              </span>
              <Link
                href={`/wordlists/${list.id}`}
                className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90"
              >
                詳細を見る
              </Link>
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
