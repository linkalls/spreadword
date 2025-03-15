import Footer from "@/components/footer";
import Image from "next/image";
import Link from "next/link";
import filePng from "../../public/file.png";
import globePng from "../../public/globe.png";
import iconPng from "../../public/icon.png";
import multiPng from "../../public/multi.png";

export default function Home() {
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* ヘッダーセクション
      <header className="w-full py-4 px-6 flex justify-between items-center bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <Image src="/icon.webp" alt="SpreadWord Logo" width={40} height={40} />
          <h1 className="text-2xl font-bold text-blue-600">spreadWord</h1>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-blue-600 hover:underline">ログイン</Link>
          <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">無料登録</Link>
        </div>
      </header> */}

      {/* ヒーローセクション */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="md:w-1/2">
            <h2 className="text-4xl font-bold mb-4">効率的に英単語を学習</h2>
            <p className="text-lg mb-6">
              spreadWordは、あなたの英語学習をサポートする最新の単語学習アプリです。
              スマートな反復学習システムで、効率的に語彙力を向上させましょう。
            </p>
            <div className="flex gap-4">
              <Link
                href="/auth/signin"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                今すぐ始める
              </Link>
              <Link
                href="/demo"
                className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 font-medium"
                prefetch={true}
              >
                デモを見る
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <Image
              src={iconPng}
              alt="アプリデモ"
              width={500}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">主な特徴</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-md transition-shadow">
              <Image
                src={globePng}
                alt="スマート学習"
                width={64}
                height={64}
                className="mb-4 w-auto"
              />
              <h3 className="text-xl font-semibold mb-2">
                スマート学習システム
              </h3>
              <p className="text-center text-gray-600">
                間違えた単語を自動的に復習に組み込み、効率的な学習を実現します
              </p>
            </div>
            <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-md transition-shadow">
              <Image
                src={filePng}
                alt="進捗管理"
                width={64}
                height={64}
                className="mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">詳細な進捗管理</h3>
              <p className="text-center text-gray-600">
                学習統計とPDFレポートで、あなたの成長を可視化します
              </p>
            </div>
            <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-md transition-shadow">
              <Image
                src={multiPng}
                alt="カスタムリスト"
                width={100}
                height={100}
                className="mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">カスタム単語リスト</h3>
              <p className="text-center text-gray-600">
                自分だけの単語リストを作成し、共有することができます
              </p>
            </div>
            <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-md transition-shadow">
              <Image
                src="/window.svg"
                alt="フラッシュカード"
                width={64}
                height={64}
                className="mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">フラッシュカード学習</h3>
              <p className="text-center text-gray-600">
                効率的な単語暗記とメモ機能で学習をサポートします
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 登録促進セクション */}
      
      <section className="py-16 px-6 bg-blue-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">今日から始めましょう</h2>
          <p className="text-lg mb-8">
            無料プランで利用を開始して、効率的な英単語学習を体験してみませんか？
          </p>
          <Link
            href="/auth/signin"
            className="px-8 py-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-lg"
          >
            無料アカウントを作成
          </Link>
        </div>
      </section>

      {/* フッターセクション */}
      <Footer />
    </div>
  );
}
