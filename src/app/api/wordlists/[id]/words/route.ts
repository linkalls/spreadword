import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { addWordToList, removeWordFromList } from "@/db/actions/word-lists";

// 単語追加のリクエストスキーマ
const addWordSchema = z.object({
  wordId: z.number(),
  notes: z.string().optional(),
});

// 単語削除のリクエストスキーマ
const removeWordSchema = z.object({
  wordId: z.number(),
});

/**
 * リストに単語を追加
 * POST /api/wordlists/[id]/words
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {id} = await params;

    const listId = parseInt(id, 10);
    if (isNaN(listId)) {
      return Response.json(
        { error: "Invalid list ID" },
        { status: 400 }
      );
    }

    const json = await request.json();
    const { wordId, notes } = addWordSchema.parse(json);

    const added = await addWordToList({
      listId,
      userId: session.user.id,
      wordId,
      notes,
    });

    if (!added) {
      return Response.json(
        { error: "Failed to add word to list" },
        { status: 400 }
      );
    }

    return Response.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { errors: error.errors },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      console.error("Failed to add word to list:", error.message);
    }
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * リストから単語を削除
 * DELETE /api/wordlists/[id]/words
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const listId = parseInt(id, 10);
    if (isNaN(listId)) {
      return Response.json(
        { error: "Invalid list ID" },
        { status: 400 }
      );
    }

    const json = await request.json();
    const { wordId } = removeWordSchema.parse(json);

    const removed = await removeWordFromList({
      listId,
      userId: session.user.id,
      wordId,
    });

    if (!removed) {
      return Response.json(
        { error: "Failed to remove word from list" },
        { status: 400 }
      );
    }

    return Response.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { errors: error.errors },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      console.error("Failed to remove word from list:", error.message);
    }
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
