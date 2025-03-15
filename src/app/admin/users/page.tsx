import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { UserManagementClient } from "./user-management-client"

export default async function UsersPage() {
  const session = await auth()
  
  // 認証されていない、またはadmin権限がない場合はリダイレクト
  if (!session?.user || session.user.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">ユーザー管理</h1>
      <UserManagementClient />
    </div>
  )
}
