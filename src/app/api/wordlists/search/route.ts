import { db } from "@/db/dbclient";
import { wordLists, users } from "@/db/schema";
import { eq, and, like } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return new NextResponse("検索クエリが必要です", { status: 400 });
    }

    // パブリックな単語リストを検索し、作成者の情報も取得
    const result = await db
      .select({
        id: wordLists.id,
        name: wordLists.name,
        description: wordLists.description,
        userId: wordLists.userId,
        createdAt: wordLists.createdAt,
        userName: users.name,
      })
      .from(wordLists)
      .leftJoin(users, eq(wordLists.userId, users.id))
      .where(
        and(
          eq(wordLists.isPublic, 1),
          like(wordLists.name, `%${query}%`)
        )
      )
      .orderBy(wordLists.createdAt)
      .limit(20);

    return new NextResponse(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error searching word lists:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
