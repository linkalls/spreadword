"use client";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";

export default function FeaturesPage() {
  const { data: session, status } = useSession();
  const user = session?.user;

  const features = [
    {
      title: "フラッシュカードで単語学習",
      description:
        "英単語の意味や発音を効率的に学び、メモ機能で自分だけのノートを残せます。",
      icon: "📝",
    },
    {
      title: "クイズで理解度チェック",
      description: "学習した単語の理解度をクイズ形式でチェックし、進捗を追跡できます。",
      icon: "🧠",
    },
    {
      title: "学習進捗のダッシュボード",
      description: "学習履歴や正答率などの統計情報を一目で確認できるダッシュボード機能。",
      icon: "📊",
    },
    {
      title: "学習レポートのPDFダウンロード",
      description: "間違えた単語や学習進捗をPDF形式でダウンロードして復習に活用できます。",
      icon: "📥",
    },
    // {
    //   title: "英単語の学習(実装中！！！)",
    //   description:
    //     "英単語の意味や発音を学び、大学受験や一般会話に役立つように。",
    //   icon: "🌏",
    // },
    {
      title: "AIとの英会話学習(実装するかも)",
      description: "メッセージをリアルタイムで修正し、より自然な英会話を学ぶ。",
      icon: "🔄",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">機能紹介</h1>
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-12 text-center">
        {status === "unauthenticated" ? (
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="text-lg mb-4">
              すべての機能を使うにはログインが必要です
            </p>
            <button
              onClick={() => signIn()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ログインして始める
            </button>
          </div>
        ) : status === "authenticated" && user ? (
          <div className="bg-green-50 p-6 rounded-lg">
            <p className="text-lg text-green-800">
              {user.name}さん、すべての機能をご利用いただけます！
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
