import { isAdmin } from "@/app/admin/adminRoleFetch";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

// adminページのメインコンポーネント
export default async function AdminPage() {
  // セッション情報を取得
  const session = await auth();

  // console.log(session!.user);

  // 認証されていない、またはadmin権限がない場合はリダイレクト
  if (!session?.user) {
    redirect("/auth/signin");
  }

  //* admin roleがあるかどうかをdbから取得して判定する
  // const adminRole = await db.query.userRoles.findFirst({
  //   where: {
  //     userId: session!.user!.id!,
  //     role: "admin",
  //   },
  // });
  const adminRole = await isAdmin(session);
  if (!adminRole) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">管理者ページ</h1>

      {/* 各セクションへのリンク */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="/admin/users"
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">ユーザー管理</h2>
          <p className="text-gray-600">ユーザーの追加、編集、削除を行います</p>
        </a>

        <a
          href="/admin/words"
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">単語管理</h2>
          <p className="text-gray-600">単語の追加、編集、削除を行います</p>
        </a>
      </div>
    </div>
  );
}
