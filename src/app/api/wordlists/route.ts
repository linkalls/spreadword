import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { createWordList, getUserWordLists, getPublicWordLists } from "@/db/actions/word-lists";

// 単語リスト作成のリクエストスキーマ
const createWordListSchema = z.object({
  name: z.string().min(1, "リスト名は必須です"),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

/**
 * 単語リスト一覧を取得
 * GET /api/wordlists
 * Query Parameters:
 * - public: boolean - 公開リストのみを取得する場合はtrue
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get("public") === "true";

    if (isPublic) {
      const lists = await getPublicWordLists();
      return Response.json(lists);
    }

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lists = await getUserWordLists(session!.user!.id!);
    return Response.json(lists);
  } catch (error) {
    console.error("Failed to fetch word lists:", error);
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * 新しい単語リストを作成
 * POST /api/wordlists
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const { name, description, isPublic } = createWordListSchema.parse(json);

    const list = await createWordList({
      userId: session!.user!.id!,
      name,
      description,
      isPublic,
    });

    return Response.json(list);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return Response.json({ errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      console.error("Failed to create word list:", error.message);
    }
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
