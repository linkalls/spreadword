import { auth } from "@/auth"
import { redirect } from "next/navigation"
import WordManagementClient from "@/components/admin/word-management-client"

// 単語管理ページのメインコンポーネント
export default async function WordsPage() {
  // セッション情報を取得
  const session = await auth()
  
  // 認証されていない、またはadmin権限がない場合はリダイレクト
  if (!session?.user || session.user.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">単語管理</h1>
      <WordManagementClient />
    </div>
  )
}
