import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db/dbclient";
import { words } from "@/db/schema";
import { sql } from "drizzle-orm";

/**
 * 単語を検索
 * GET /api/words/search
 * Query Parameters:
 * - q: 検索キーワード
 * - limit: 取得する最大件数（デフォルト: 10）
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!query) {
      return Response.json([]);
    }

    // 単語本体、意味、品詞のいずれかにマッチする単語を検索
    const searchResults = await db
      .select()
      .from(words)
      .where(
        sql`(
          word LIKE ${`%${query}%`} OR
          meanings LIKE ${`%${query}%`} OR
          part_of_speech LIKE ${`%${query}%`}
        )`
      )
      .limit(limit);

    return Response.json(searchResults);
  } catch (error) {
    console.error("Failed to search words:", error);
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
