"use client";
import { loadingAtom, userAtom } from "@/atoms/userAtom";
import { useAtomValue } from "jotai";
import { signIn } from "next-auth/react";

export default function FeaturesPage() {
  const isLoading = useAtomValue(loadingAtom);

  const user = useAtomValue(userAtom);

  const features = [
    {
      title: "英単語の学習(実装中！！！)",
      description:
        "英単語の意味や発音を学び、大学受験や一般会話に役立つように。",
      icon: "🌏",
    },
    {
      title: "AIとの英会話学習(実装するかも)",
      description: "メッセージをリアルタイムで修正し、より自然な英会話を学ぶ。",
      icon: "🔄",
    },
    // {
    //   title: "グループチャット",
    //   description:
    //     "複数人でのグループチャットで、プロジェクトや趣味の話題を共有。",
    //   icon: "👥",
    // },
    // {
    //   title: "ファイル共有",
    //   description: "画像や文書の共有もワンタッチで簡単に。",
    //   icon: "📁",
    // },
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
      {isLoading ? (
        <div className="mt-12 text-center">ユーザー情報を取得中....</div>
      ) : (
        <div className="mt-12 text-center">
        {!user ? (
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
        ) : (
          <div className="bg-green-50 p-6 rounded-lg">
            <p className="text-lg text-green-800">
              {user.name}さん、すべての機能をご利用いただけます！
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
