# PostgreSQLへの移行手順

## 1. パッケージのインストール

必要なパッケージをインストールします：

```bash
bun add postgres pg drizzle-orm-postgres
```

## 2. 環境変数の設定

`.env`ファイルに以下の環境変数を追加：

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=spreadword
```

## 3. データベースクライアントの更新

`src/db/dbclient.ts`を以下のように更新：

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
```

## 4. スキーマの更新

`src/db/schema.ts`を更新し、PostgreSQL固有の型を使用：

```typescript
import { pgTable, serial, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

// テーブル定義の例
export const words = pgTable('words', {
  id: serial('id').primaryKey(),
  word: text('word').notNull(),
  meanings: text('meanings').notNull(),
  part_of_speech: text('part_of_speech'),
  ex: text('ex'),
  created_at: timestamp('created_at').defaultNow(),
});

export const userWords = pgTable('user_words', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  wordId: integer('word_id').notNull(),
  complete: boolean('complete').default(false),
  created_at: timestamp('created_at').defaultNow(),
});

// 他のテーブル定義も同様に更新
```

## 5. マイグレーションスクリプトの作成

```bash
bunx drizzle-kit generate:pg
```

## 6. データ移行スクリプト

`scripts/migrate-data.ts`を作成：

```typescript
import { db as sqliteDb } from '../src/db/sqlite-client';
import { db as pgDb } from '../src/db/dbclient';

async function migrateData() {
  // データの取得
  const words = await sqliteDb.query.words.findMany();
  const userWords = await sqliteDb.query.userWords.findMany();

  // データの移行
  for (const word of words) {
    await pgDb.insert(schema.words).values(word);
  }

  for (const userWord of userWords) {
    await pgDb.insert(schema.userWords).values(userWord);
  }

  console.log('データ移行完了');
}

migrateData().catch(console.error);
```

## 7. Docker Compose設定

```yaml
version: '3.8'
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 8. マイグレーション実行手順

1. PostgreSQLコンテナの起動:
```bash
docker-compose up -d
```

2. スキーマのマイグレーション:
```bash
bunx drizzle-kit push:pg
```

3. データの移行:
```bash
bun run scripts/migrate-data.ts
```

## 9. アプリケーションの設定変更

1. `next.config.ts`の更新：
```typescript
const nextConfig = {
  experimental: {
    serverActions: true,
  },
}

export default nextConfig;
```

2. APIルートの更新:
- Edge Runtimeを使用するルートで`runtime: 'edge'`を指定
- データベースクライアントを新しいものに置き換え

## 注意点

1. バックアップを取ってから移行を開始
2. ローカル環境でテスト後に本番環境へ移行
3. ダウンタイムの最小化のための計画を立てる
4. 移行後のデータ整合性の確認
