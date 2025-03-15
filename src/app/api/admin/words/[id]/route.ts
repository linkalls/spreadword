import { auth } from "@/auth";
import { db } from "@/db/dbclient";
import { words } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

// 入力バリデーション用のスキーマ
const wordSchema = z.object({
  word: z.string().min(1),
  meanings: z.string().min(1),
  part_of_speech: z.string().optional(),
  choices: z.string().optional(),
  ex: z.string().optional(),
});

// PUTリクエスト（単語更新）
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = wordSchema.parse(body);

    const {id} = await params

    await db
      .update(words)
      .set(validatedData)
      .where(eq(words.id, parseInt(id)));

    return NextResponse.json({ message: "Word updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid input", { status: 400 });
    }
    console.error("Error updating word:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETEリクエスト（単語削除）
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string } >}
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const {id} = await params
    await db.delete(words).where(eq(words.id, parseInt(id)));

    return NextResponse.json({ message: "Word deleted successfully" });
  } catch (error) {
    console.error("Error deleting word:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
