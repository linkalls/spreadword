import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProfileClient } from "./profile-client";

/**
 * プロフィールページ
 * ログインしているユーザーの情報を表示し、名前の変更を可能にします
 */
export default async function ProfilePage() {
  const session = await auth();
  
  // 未ログインの場合はホームページにリダイレクト
  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">プロフィール設定</h1>
      <ProfileClient user={{
        name: session.user.name || null,
        email: session.user.email || null,
        image: session.user.image || null
      }} />
    </div>
  );
}
