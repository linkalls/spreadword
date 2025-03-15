import { db } from "@/db/dbclient";
import { UserRoleEnum, userRoles } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { Session } from "next-auth";

export const isAdmin = async (session: Session):Promise<boolean> => {
  const adminRole = await db
    .select()
    .from(userRoles)
    .where(
      and(
        eq(userRoles.userId, session!.user!.id!),
        eq(userRoles.role, UserRoleEnum.admin)
      )
    );
  return adminRole ? true : false;
};
