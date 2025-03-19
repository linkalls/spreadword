// import { createClient } from "@libsql/client";

// export const turso = createClient({
//   url: process.env.TURSO_DATABASE_URL!,
//   authToken: process.env.TURSO_AUTH_TOKEN,
// });

import * as schema from "@/db/schema";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { cache } from "react";

// シングルトンインスタンスを保持
let clientInstance: ReturnType<typeof createClient> | null = null;

// シングルトンクライアントの取得
const getClient = cache(() => {
  if (clientInstance) return clientInstance;

  // 環境設定の検証
  const url = process.env.DATABASE_URL
    // process.env.BUN_ENV === "production"
      // ? 
      // process.env.TURSO_DATABASE_URL
      // : process.env.TURSO_LOCAL_DATABASE_URL;

  if (!url) {
    throw new Error(
      `Database URL not configured for ${process.env.BUN_ENV} environment`
    );
  }

  // クライアントの設定
  clientInstance = createClient({
    url,
    authToken: process.env.AUTH_TOKEN
    });

  return clientInstance;
});

// drizzleインスタンスを作成
export const db = drizzle(getClient(), {
  schema,
  logger: process.env.BUN_ENV === "development",
});
