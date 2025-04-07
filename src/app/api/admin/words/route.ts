import { db } from "@/db/dbclient";
import { words } from "@/db/schema";
import { eq, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/app/admin/adminRoleFetch";
import { z } from "zod";

// 検索文字列のエスケープ処理
const sanitizeSearchTerm = (term: string) => {
  // SQLインジェクション対策
  return term.replace(/[%_\\]/g, '\\$&');
};

// LIKEパターンの作成
const createLikePattern = (value: string) => {
  return `%${sanitizeSearchTerm(value)}%`;
};

const PAGE_SIZE = 20;

// バリデーションスキーマ
const WordSchema = z.object({
  word: z.string().min(1).max(100),
  meanings: z.string().min(1),
  part_of_speech: z.string(),
  choices: z.array(z.string()),
  ex: z.string(),
});

const BatchWordsSchema = z.object({
  words: z.array(WordSchema),
});

// 単語一覧を取得（検索機能、ページネーション付き）
export async function GET(req: Request) {
  try {
    const session = await auth();
    const adminRole = await isAdmin(session!);

    if (!session?.user || !adminRole) {
      return NextResponse.json(
        { error: "権限がありません" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const offset = (page - 1) * PAGE_SIZE;

    // 検索条件の構築
    let searchCondition;
    if (search) {
      const pattern = createLikePattern(search);
      searchCondition = sql`(LOWER(${words.word}) LIKE LOWER(${pattern}) OR LOWER(${words.meanings}) LIKE LOWER(${pattern}))`;
    }

    // 並列でデータを取得
    const [wordsList, totalCount] = await Promise.all([
      // 単語一覧の取得
      db.select()
        .from(words)
        .where(searchCondition)
        .limit(PAGE_SIZE)
        .offset(offset)
        .orderBy(words.id),

      // 総件数の取得
      db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(words)
        .where(searchCondition)
        .then(result => result[0].count),
    ]);

    return NextResponse.json({
      words: wordsList,
      pagination: {
        total: totalCount,
        totalPages: Math.ceil(totalCount / PAGE_SIZE),
        currentPage: page,
        limit: PAGE_SIZE,
      },
    });
  } catch (error) {
    console.error("Error fetching words:", error);
    // より詳細なエラー情報をログに出力
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    // データベース接続エラーの場合
    if (error instanceof Error && error.message.includes('connection')) {
      return NextResponse.json(
        { error: "データベース接続エラーが発生しました。しばらく待ってから再試行してください。" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: "単語の取得に失敗しました",
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : '不明なエラー' : undefined
      },
      { status: 500 }
    );
  }
}

// 新規単語を追加（単一または複数）
export async function POST(req: Request) {
  try {
    const session = await auth();
    const adminRole = await isAdmin(session!);

    if (!session?.user || !adminRole) {
      return NextResponse.json(
        { error: "権限がありません" },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log("Request body:", body);
    console.log("Choices after join:", body.choices);

    // 単一の単語追加か複数の単語追加かを判定
    const isBatchOperation = Array.isArray(body.words);

    if (isBatchOperation) {
      // バッチ処理の検証
      const validationResult = BatchWordsSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: "入力データが不正です", details: validationResult.error },
          { status: 400 }
        );
      }

      // トランザクションでバッチ処理
      const newWords = await db.transaction(async (tx) => {
        const insertedWords = [];
        for (const wordData of validationResult.data.words) {
          // choices配列をJSON文字列に変換
          const processedWordData = {
            ...wordData,
            choices: JSON.stringify(wordData.choices)
          };

          const [newWord] = await tx
            .insert(words)
            .values(processedWordData)
            .returning();
          insertedWords.push(newWord);
        }
        return insertedWords;
      });

      return NextResponse.json({
        success: true,
        words: newWords,
      });
    } else {
      // 単一の単語追加の検証
      const validationResult = WordSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: "入力データが不正です", details: validationResult.error },
          { status: 400 }
        );
      }
      // choices配列をJSON文字列に変換
      const wordData = {
        ...validationResult.data,
        choices: JSON.stringify(validationResult.data.choices)
      };

      const [newWord] = await db
        .insert(words)
        .values(wordData)
        .returning();

      return NextResponse.json({
        success: true,
        word: newWord,
      });
    }
  } catch (error: unknown) {
    console.error("Error adding words:", error);
    
    // エラーオブジェクトの型を確認
    if (error instanceof Error) {
      // SQLiteの一意性制約違反エラーの場合
      if (error.message.includes('UNIQUE constraint failed')) {
        const match = error.message.match(/word\.(.*?)\]/);
        const field = match ? match[1] : 'word';
        return NextResponse.json(
          { error: `この${field}は既に登録されています` },
          { status: 400 }
        );
      }
      
      // その他のエラー（Errorインスタンスの場合）
      return NextResponse.json(
        { 
          error: error.message.includes('既に登録されています') 
            ? error.message 
            : "単語の追加に失敗しました"
        },
        { status: 500 }
      );
    }
    
    // 不明なエラーの場合
    return NextResponse.json(
      { error: "単語の追加に失敗しました" },
      { status: 500 }
    );
  }
}

// 単語の一括削除
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const adminRole = await isAdmin(session!);

    if (!session?.user || !adminRole) {
      return NextResponse.json(
        { error: "権限がありません" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "削除する単語のIDを指定してください" },
        { status: 400 }
      );
    }

    // トランザクションで一括削除
    await db.transaction(async (tx) => {
      await tx
        .delete(words)
        .where(
          or(...ids.map(id => eq(words.id, id)))
        );
    });

    return NextResponse.json({
      success: true,
      message: `${ids.length}件の単語を削除しました`,
    });
  } catch (error) {
    console.error("Error deleting words:", error);
    return NextResponse.json(
      { error: "単語の削除に失敗しました" },
      { status: 500 }
    );
  }
}
