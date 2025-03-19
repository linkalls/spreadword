import { isAdmin } from "@/app/admin/adminRoleFetch";
import { auth } from "@/auth";
import { UserRoles } from "@/types/auth";
import Image from "next/image";
import Link from "next/link";
import { AuthButtons } from "./auth-buttons";
import { HeaderScroll } from "./header-scroll";
import { MobileMenu } from "./mobile-menu";

/**
 * ヘッダーコンポーネント
 * サーバーサイドでセッション情報を取得し、ナビゲーションとユーザー情報を表示します
 */
export default async function Header() {
  // サーバーサイドでセッションを取得
  const session = await auth();

  const userRole = await isAdmin(session);
  // Next.jsのセッションユーザーを独自の型に変換
  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        id: session.user.id,
        role: session.user.role,
      }
    : null;

  if (userRole && user) {
    user.role = UserRoles.ADMIN;
  }

  return (
    <HeaderScroll>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-500 dark:hover:to-indigo-500 transition-all"
        >
          SpreadWord
        </Link>

        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            <li>
              <Link
                href="/"
                className="relative py-2 px-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200 before:content-[''] before:absolute before:-bottom-1 before:left-0 before:w-full before:h-0.5 before:bg-blue-600 dark:before:bg-blue-400 before:origin-right before:scale-x-0 before:transition-transform hover:before:scale-x-100 hover:before:origin-left"
              >
                ホーム
              </Link>
            </li>
            {!user && (
              <>
                <li>
                  <Link
                    href="/about"
                    className="relative py-2 px-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 before:content-[''] before:absolute before:-bottom-1 before:left-0 before:w-full before:h-0.5 before:bg-blue-600 before:origin-right before:scale-x-0 before:transition-transform hover:before:scale-x-100 hover:before:origin-left"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="relative py-2 px-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 before:content-[''] before:absolute before:-bottom-1 before:left-0 before:w-full before:h-0.5 before:bg-blue-600 before:origin-right before:scale-x-0 before:transition-transform hover:before:scale-x-100 hover:before:origin-left"
                  >
                    機能
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="relative py-2 px-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 before:content-[''] before:absolute before:-bottom-1 before:left-0 before:w-full before:h-0.5 before:bg-blue-600 before:origin-right before:scale-x-0 before:transition-transform hover:before:scale-x-100 hover:before:origin-left"
                  >
                    お問い合わせ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="relative py-2 px-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 before:content-[''] before:absolute before:-bottom-1 before:left-0 before:w-full before:h-0.5 before:bg-blue-600 before:origin-right before:scale-x-0 before:transition-transform hover:before:scale-x-100 hover:before:origin-left"
                  >
                    ブログ
                  </Link>
                </li>
              </>
            )}
            {user && (
              <>
                <li>
                  <Link
                    href="/words"
                    className="relative py-2 px-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 before:content-[''] before:absolute before:-bottom-1 before:left-0 before:w-full before:h-0.5 before:bg-blue-600 before:origin-right before:scale-x-0 before:transition-transform hover:before:scale-x-100 hover:before:origin-left"
                  >
                    単語一覧
                  </Link>
                </li>
                <li>
                  <Link
                    href="/flashcards"
                    className="relative py-2 px-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 before:content-[''] before:absolute before:-bottom-1 before:left-0 before:w-full before:h-0.5 before:bg-blue-600 before:origin-right before:scale-x-0 before:transition-transform hover:before:scale-x-100 hover:before:origin-left"
                  >
                    フラッシュカード
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="relative py-2 px-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 before:content-[''] before:absolute before:-bottom-1 before:left-0 before:w-full before:h-0.5 before:bg-blue-600 before:origin-right before:scale-x-0 before:transition-transform hover:before:scale-x-100 hover:before:origin-left"
                  >
                    ダッシュボード
                  </Link>
                </li>
                <li>
                  <Link
                    href="/wordlists"
                    className="relative py-2 px-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 before:content-[''] before:absolute before:-bottom-1 before:left-0 before:w-full before:h-0.5 before:bg-blue-600 before:origin-right before:scale-x-0 before:transition-transform hover:before:scale-x-100 hover:before:origin-left"
                  >
                    単語リスト
                  </Link>
                </li>
                <li>
                  <Link
                    href="/quiz"
                    className="relative py-2 px-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 before:content-[''] before:absolute before:-bottom-1 before:left-0 before:w-full before:h-0.5 before:bg-blue-600 before:origin-right before:scale-x-0 before:transition-transform hover:before:scale-x-100 hover:before:origin-left"
                  >
                    単語クイズ
                  </Link>
                </li>
                {user.role === "admin" && (
                  <li>
                    <Link
                      href="/admin"
                      className="relative py-2 px-1 text-red-600 hover:text-red-700 font-medium transition-colors duration-200 before:content-[''] before:absolute before:-bottom-1 before:left-0 before:w-full before:h-0.5 before:bg-red-600 before:origin-right before:scale-x-0 before:transition-transform hover:before:scale-x-100 hover:before:origin-left"
                    >
                      管理画面
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>
        </nav>

        <div className="flex items-center space-x-4">
          {user && (
            <Link href="/profile" className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/50 rounded-full py-1 px-3 border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/70 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white overflow-hidden">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || ""}
                    className="w-full h-full object-cover"
                    width={32}
                    height={32}
                  />
                ) : (
                  <span className="font-medium">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline-block">
                {user.name}
              </span>
            </Link>
          )}

          <AuthButtons user={user} />
          <MobileMenu user={user} />
        </div>
      </div>
    </HeaderScroll>
  );
}
