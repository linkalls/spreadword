"use client";
import { userAtom } from "@/atoms/userAtom";
import { useAtomValue } from "jotai";

export default function AboutPage() {
  const user = useAtomValue(userAtom);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">
        SpreadWordについて
      </h1>

      <div className="max-w-2xl mx-auto space-y-6">
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">私たちのミッション</h2>
          <p className="text-gray-600">
            SpreadWordは、世界中の人々がより簡単にコミュニケーションを取れるようにすることを目指しています。
            {user && (
              <span className="block mt-2 text-blue-600">
                {user.name}さんもぜひ一緒に世界とつながりましょう！
              </span>
            )}
          </p>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">チームについて</h2>
          <p className="text-gray-600">
            私はより良い英単語学習ツールの開発に取り組んでいます。
          </p>
        </section>

        {/* <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">ビジョン</h2>
          <p className="text-gray-600">
            言語や文化の壁を超えて、誰もが自由にコミュニケーションを取れる世界を作ります。
            {!user && (
              <span className="block mt-2 text-blue-600">
                あなたもぜひ参加してください！
              </span>
            )}
          </p>
        </section> */}
      </div>
    </div>
  );
}
