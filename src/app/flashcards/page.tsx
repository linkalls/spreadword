import { Metadata } from "next";
import FlashCardComponent from "@/components/flashcard/flashcard";

export const metadata: Metadata = {
  title: "フラッシュカード | SpreadWord",
  description: "単語を効率的に学習するフラッシュカード機能",
};

export default function FlashCardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">フラッシュカード学習</h1>
      <p className="text-gray-600 mb-8">
        カードをクリックして単語の意味を確認できます。左右のボタンで次の単語に進むことができます。
      </p>
      <FlashCardComponent />
    </div>
  );
}
