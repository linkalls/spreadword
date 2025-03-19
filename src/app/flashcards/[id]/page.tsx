import { Metadata } from "next";
import SingleFlashCard from "@/components/flashcard/single-flashcard";

export const metadata: Metadata = {
  title: "単語詳細 | SpreadWord",
  description: "単語の詳細とフラッシュカードでの学習",
};

export default async function FlashCardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const {id} = await params;
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">単語詳細</h1>
      <p className="text-gray-600 mb-8">
        カードをクリックして単語の意味を確認できます。
      </p>
      <SingleFlashCard wordId={parseInt(id)} />
    </div>
  );
}
