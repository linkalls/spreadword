import { isAdmin } from "@/app/admin/adminRoleFetch";
import { auth } from "@/auth";
import { db } from "@/db/dbclient";
import { userRoles, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  const adminRole = await isAdmin(session!);

  if (!session?.user || !adminRole) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const offset = (page - 1) * limit;

    // 総件数を取得
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .then(result => Number(result[0].count));

    // ページネーションを適用してデータを取得
    const usersWithRoles = await db.query.users.findMany({
      with: {
        roles: true,
      },
      limit: limit,
      offset: offset,
      orderBy: (users, { desc }) => [desc(users.id)]
    });

    return NextResponse.json({
      users: usersWithRoles,
      pagination: {
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// ユーザー権限の更新
export async function PUT(req: Request) {
  const session = await auth();
  const adminRole = await isAdmin(session!);

  if (!session?.user || !adminRole) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { userId, role } = await req.json();

    // 既存の権限を削除
    await db.delete(userRoles).where(eq(userRoles.userId, userId));

    // 新しい権限を設定
    await db.insert(userRoles).values({
      userId,
      role,
      assignedBy: session.user.id,
    });

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("Error updating user role:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
