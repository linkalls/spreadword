import { auth } from "@/auth";
import { db } from "@/db/dbclient";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * ユーザープロフィールを更新するAPI
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return new NextResponse("Invalid name", { status: 400 });
    }

    // データベースでユーザー名を更新
    await db
      .update(users)
      .set({ name: name.trim() })
      .where(eq(users.id, session.user.id));

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[PROFILE_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
