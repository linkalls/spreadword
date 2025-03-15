import { db } from "@/db/dbclient";
import { words } from "@/db/schema";
import { like } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/app/admin/adminRoleFetch";

// 単語一覧を取得（検索機能付き）
export async function GET(req: Request) {
  const session = await auth();
  const adminRole = await isAdmin(session!);

  if (!session?.user || !adminRole) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const wordsList = await db.query.words.findMany({
      where: search ? like(words.word, `%${search}%`) : undefined,
    });
    return NextResponse.json(wordsList);
  } catch (error) {
    console.error("Error fetching words:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// 新規単語を追加
export async function POST(req: Request) {
  const session = await auth();
  const adminRole = await isAdmin(session!);

  if (!session?.user || !adminRole) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { word, meanings, part_of_speech, choices, ex } = body;

    // 必須フィールドの検証
    if (!word || !meanings) {
      return new NextResponse("Word and meanings are required", { status: 400 });
    }

    const newWord = await db.insert(words).values({
      word,
      meanings,
      part_of_speech,
      choices,
      ex,
    }).returning();

    return NextResponse.json(newWord[0]);
  } catch (error) {
    console.error("Error adding word:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
