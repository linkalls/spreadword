import { auth } from "@/auth";
import {
  deleteWordList,
  getWordList,
  getWordsInList,
  updateWordList,
} from "@/db/actions/word-lists";
import { NextRequest } from "next/server";
import { z } from "zod";

// 単語リスト更新のリクエストスキーマ
const updateWordListSchema = z.object({
  name: z.string().min(1, "リスト名は必須です").optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

/**
 * 単語リストの詳細を取得
 * GET /api/wordlists/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    const listId = id;

    if (!listId) {
      return Response.json({ error: "Invalid list ID" }, { status: 400 });
    }

    // リストの基本情報を取得
    const list = await getWordList(listId);
    if (!list) {
      return Response.json({ error: "Word list not found" }, { status: 404 });
    }

    // プライベートリストの場合、所有者のみアクセス可能
    if (!list.isPublic && (!session?.user || list.userId !== session.user.id)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // リストに含まれる単語を取得
    const words = await getWordsInList(listId);

    return Response.json({
      ...list,
      words,
    });
  } catch (error) {
    console.error("Failed to fetch word list:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * 単語リストを更新
 * PUT /api/wordlists/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const listId = id;
    if (!id) {
      return Response.json({ error: "Invalid list ID" }, { status: 400 });
    }

    const json = await request.json();
    const { name, description, isPublic } = updateWordListSchema.parse(json);

    const updatedList = await updateWordList({
      listId,
      userId: session.user.id,
      name,
      description,
      isPublic,
    });

    if (!updatedList) {
      return Response.json({ error: "Word list not found" }, { status: 404 });
    }

    return Response.json(updatedList);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return Response.json({ errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      console.error("Failed to update word list:", error.message);
    }
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * 単語リストを削除
 * DELETE /api/wordlists/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const listId = id;
    if (!listId) {
      return Response.json({ error: "Invalid list ID" }, { status: 400 });
    }

    const deleted = await deleteWordList(listId, session.user.id);
    if (!deleted) {
      return Response.json({ error: "Word list not found" }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete word list:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
