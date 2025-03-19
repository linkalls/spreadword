import Link from "next/link";
export default function Footer() {
  return (
    <>
      {/* フッター */}
      <footer className="py-8 px-6 bg-gray-800 text-white mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">spreadWord</h3>
            <p className="text-gray-300">効率的な英単語学習アプリ</p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-8">
            <div>
              <h4 className="font-medium mb-2">アプリ</h4>
              <ul className="space-y-1 text-gray-300">
                <li>
                  <Link href="/features" className="hover:text-white">
                    機能
                  </Link>
                </li>
                <li>
                  <Link href="/demo" className="hover:text-white">
                    デモ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">情報</h4>
              <ul className="space-y-1 text-gray-300">
                <li>
                  <Link href="/about" className="hover:text-white">
                    私たちについて
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    お問い合わせ
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link href="/terms/privacy" className="hover:text-white">
                    プライバシーポリシー
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-8 pt-4 border-t border-gray-700 text-center text-gray-400">
          <p>© {new Date().getFullYear()} spreadWord. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
