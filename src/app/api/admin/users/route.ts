import { auth } from "@/auth";
import { db } from "@/db/dbclient";
import { users, userRoles, UserRoleEnum } from "@/db/schema";
import { eq, and, ilike, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // 管理者権限のチェック
    const isAdmin = await db
      .select()
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, session.user.id),
          eq(userRoles.role, UserRoleEnum.ADMIN)
        )
      )
      .then(roles => roles.length > 0);

    if (!isAdmin) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    // クエリパラメータの取得
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * PAGE_SIZE;

    // 検索条件の構築
    const searchCondition = search
      ? or(
          ilike(users.name || "", `%${search}%`),
          ilike(users.email || "", `%${search}%`)
        )
      : undefined;

    // 並列でユーザー一覧と総数を取得
    const [usersWithRoles, totalCount] = await Promise.all([
      // ユーザー一覧の取得（ロール情報を含む）
      db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        roles: sql<{ role: string }[]>`
          COALESCE(
            json_group_array(
              json_object('role', ${userRoles.role})
            ) FILTER (WHERE ${userRoles.role} IS NOT NULL),
            '[]'
          )
        `.mapWith((roles): { role: string }[] => {
          try {
            return JSON.parse(roles);
          } catch {
            return [];
          }
        }),
      })
      .from(users)
      .leftJoin(userRoles, eq(users.id, userRoles.userId))
      .where(searchCondition)
      .groupBy(users.id)
      .limit(PAGE_SIZE)
      .offset(offset),

      // 総ユーザー数の取得
      db
        .select({
          count: sql<number>`count(DISTINCT ${users.id})`,
        })
        .from(users)
        .where(searchCondition)
        .then(result => result[0].count),
    ]);

    // ページネーション情報の計算
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return NextResponse.json({
      users: usersWithRoles.map(user => ({
        ...user,
        roles: user.roles ?? [],
      })),
      pagination: {
        total: totalCount,
        totalPages,
        currentPage: page,
        limit: PAGE_SIZE,
      },
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "ユーザー情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // 管理者権限のチェック
    const isAdmin = await db
      .select()
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, session.user.id),
          eq(userRoles.role, UserRoleEnum.ADMIN)
        )
      )
      .then(roles => roles.length > 0);

    if (!isAdmin) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role } = body;

    // ロール値の検証
    function isValidRole(value: string): value is UserRoleEnum {
      return value === "admin" || value === "user";
    }

    if (!userId || !role || !isValidRole(role)) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    // トランザクションで権限を更新
    await db.transaction(async (tx) => {
      // 既存の権限を削除
      await tx
        .delete(userRoles)
        .where(eq(userRoles.userId, userId));

      // 新しい権限を追加（userロール以外の場合のみ）
      if (role !== "user") {
        await tx.insert(userRoles).values({
          userId,
          role: role as UserRoleEnum,
          assignedAt: new Date(),
          assignedBy: session.user.id,
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "ユーザー権限の更新に失敗しました" },
      { status: 500 }
    );
  }
}
