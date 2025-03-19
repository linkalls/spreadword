import { auth } from "@/auth"
import { redirect } from "next/navigation"
import WordManagementClient from "@/components/admin/word-management-client"
import { isAdmin } from "@/app/admin/adminRoleFetch";

export default async function WordsPage() {
  const session = await auth()
  const adminRole = await isAdmin(session!);
  
  // 認証されていない、またはadmin権限がない場合はリダイレクト
  if (!session?.user || !adminRole) {
    redirect("/")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">単語管理</h1>
      <WordManagementClient />
    </div>
  )
}
