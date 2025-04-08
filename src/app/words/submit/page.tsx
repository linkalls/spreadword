import { auth } from "@/auth";
import { SubmitWordForm } from "@/components/word-submission/submit-word-form";
import { redirect } from "next/navigation";

export default async function WordSubmitPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">単語を投稿</h1>
        <p className="text-gray-600">
          新しい単語を提案できます。投稿された単語は管理者の承認後に公開されます。
        </p>
      </div>
      <SubmitWordForm />
    </div>
  );
}