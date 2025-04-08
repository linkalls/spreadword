import { auth } from "@/auth";
import { db } from "@/db/dbclient";
import { userRoles, UserRoleEnum, userSubmittedWords } from "@/db/schema";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { SubmissionsClient } from "./submissions-client";

async function isAdmin(userId: string) {
  const userRole = await db
    .select()
    .from(userRoles)
    .where(eq(userRoles.userId, userId))
    .get();

  return userRole?.role === UserRoleEnum.ADMIN;
}

export default async function WordSubmissionsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // 管理者権限チェック
  if (!(await isAdmin(session.user.id))) {
    redirect("/");
  }

  // 投稿一覧を取得
  const submissions = await db
    .select()
    .from(userSubmittedWords)
    .orderBy(userSubmittedWords.submitted_at);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">単語投稿の管理</h1>
        <p className="text-gray-600">
          ユーザーから投稿された単語の承認・却下を行えます。
        </p>
      </div>
      <SubmissionsClient initialSubmissions={submissions} />
    </div>
  );
}