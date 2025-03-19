import { db } from "@/db/dbclient";
import { userRoles, UserRoleEnum } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { Session } from "next-auth";

/**
 * ユーザーが管理者権限を持っているかチェックする関数
 * @param session - 現在のユーザーセッション
 * @returns 管理者権限を持っている場合はtrue、それ以外はfalse
 */
export const isAdmin = async (session: Session | null): Promise<boolean> => {
  // console.log("Checking a
  // dmin for user:", session?.user?.id); // デバッグ用
  const adminRole = await db
    .select()
    .from(userRoles)
    .where(
      and(
        eq(userRoles.userId, session?.user?.id ?? ""),
        eq(userRoles.role, UserRoleEnum.ADMIN) // DBにはenumとして保存されているため、UserRoleEnum.adminを使用
      )
    );
  // console.log("Admin role query result:", adminRole); // デバッグ用
  return adminRole.length > 0;
};
