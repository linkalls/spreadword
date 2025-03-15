"use client";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";

export default function FeaturesPage() {
  const { data: session, status } = useSession();
  const user = session?.user;

  const features = [
    {
      title: "高度な学習アルゴリズム",
      description: "間違えた単語を自動的に復習に組み込み、出題頻度を最適化します。過去の学習データを分析して、あなたに最適な学習パスを提供します。",
      icon: "🎯",
    },
    {
      title: "カスタム単語リスト",
      description: "自分だけの単語リストを作成し、他のユーザーと共有できます。公開/非公開の設定や、シェアリンク機能で柔軟な共有が可能です。",
      icon: "📚",
    },
    {
      title: "フラッシュカードで効率学習",
      description: "英単語の意味や発音を効率的に学び、メモ機能で自分だけのノートを残せます。リストごとの進捗も一目で確認できます。",
      icon: "📝",
    },
    {
      title: "インタラクティブなクイズ",
      description: "学習した単語の理解度を4択クイズでチェック。間違えた単語は自動的に復習リストに追加され、確実な定着を支援します。",
      icon: "🧠",
    },
    {
      title: "詳細な学習ダッシュボード",
      description: "学習履歴、正答率、時間帯別の学習効率など、多角的な統計情報を可視化。モチベーション維持をサポートします。",
      icon: "📊",
    },
    {
      title: "AIによる学習レポート",
      description: "間違えた単語の詳細分析、Geminiによる例文生成、復習推奨スケジュールなどを含むPDFレポートを自動生成します。",
      icon: "📥",
    }
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
