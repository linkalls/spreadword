import { auth } from "@/auth";
import { forkWordList, getWordList } from "@/db/actions/word-lists";
import { NextResponse } from "next/server";
import { z } from "zod";

const forkSchema = z.object({
  name: z.string().min(1, "リスト名は必須です"),
  description: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { id: sourceListId } = await params;
    const sourceList = await getWordList(sourceListId);
    if (!sourceList) {
      return NextResponse.json(
        { error: "元のリストが見つかりません" },
        { status: 404 }
      );
    }

    if (!sourceList.isPublic) {
      return NextResponse.json(
        { error: "非公開リストはフォークできません" },
        { status: 403 }
      );
    }

    const json = await request.json();
    const { name, description } = forkSchema.parse(json);

    const forkedList = await forkWordList({
      sourceListId,
      userId: session.user.id,
      name,
      description,
    });

    return NextResponse.json(forkedList);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error("Error forking word list:", error);
    return NextResponse.json(
      { error: "リストのフォークに失敗しました" },
      { status: 500 }
    );
  }
}
