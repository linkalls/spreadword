import { auth } from "@/auth"
import { db } from "@/db/dbclient"
import { words } from "@/db/schema"
import { NextResponse } from "next/server"
import { z } from "zod"

// 入力バリデーション用のスキーマ
const wordSchema = z.object({
  word: z.string().min(1),
  meanings: z.string().min(1),
  part_of_speech: z.string().optional(),
  choices: z.string().optional(),
  ex: z.string().optional(),
})

// GETリクエスト（単語一覧取得）
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    const wordList = await db.query.words.findMany({
      where: search ? (words, { like }) => like(words.word, `%${search}%`) : undefined
    })

    return NextResponse.json(wordList)
  } catch (error) {
    console.error("Error fetching words:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// POSTリクエスト（単語追加）
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const validatedData = wordSchema.parse(body)

    const result = await db.insert(words).values(validatedData)
    return NextResponse.json({ 
      message: "Word added successfully", 
      id: result.lastInsertRowid 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid input", { status: 400 })
    }
    console.error("Error adding word:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
