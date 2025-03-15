// import { createClient } from "@libsql/client";

// export const turso = createClient({
//   url: process.env.TURSO_DATABASE_URL!,
//   authToken: process.env.TURSO_AUTH_TOKEN,
// });

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// スキーマを型定義として渡す
export const db = drizzle(turso, { schema });
