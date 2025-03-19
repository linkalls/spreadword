import { db } from "@/db/dbclient";
import { users, accounts, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

// テストユーザーの型定義
interface TestUser {
  id: string;
  name: string;
  email: string;
  image: string;
  provider: "google";
  providerAccountId: string;
  accessToken: string;
  sessionToken: string;
  expiresAt: number;
}

// テストユーザーのデータ
export const TEST_USER: TestUser = {
  id: "test-google-user",
  name: "Test User",
  email: "test-google@example.com",
  image: "https://example.com/avatar.jpg",
  provider: "google",
  providerAccountId: "google-123",
  accessToken: "test-access-token",
  sessionToken: "test-session-token",
  expiresAt: 1735689600000 // 2025/1/1
};

/**
 * テストユーザーのセットアップ
 * - usersテーブルにテストユーザーを作成
 * - accountsテーブルにOAuth情報を作成
 * - sessionsテーブルにセッション情報を作成
 */
export async function seedTestUser() {
  try {
    // 1. テストユーザーの作成
    await db.insert(users).values({
      id: TEST_USER.id,
      name: TEST_USER.name,
      email: TEST_USER.email,
      image: TEST_USER.image
    });

    // 2. OAuth認証情報の作成
    await db.insert(accounts).values({
      userId: TEST_USER.id,
      type: "oauth",
      provider: TEST_USER.provider,
      providerAccountId: TEST_USER.providerAccountId,
      access_token: TEST_USER.accessToken,
      expires_at: TEST_USER.expiresAt
    });

    // 3. セッション情報の作成
    await db.insert(sessions).values({
      sessionToken: TEST_USER.sessionToken,
      userId: TEST_USER.id,
      expires: new Date(TEST_USER.expiresAt)
    });

  } catch (error) {
    console.error("Failed to seed test user:", error);
    throw error;
  }
}

/**
 * テストデータのクリーンアップ
 * - sessionsテーブルのレコードを削除
 * - accountsテーブルのレコードを削除
 * - usersテーブルのレコードを削除
 */
export async function cleanupTestUser() {
  try {
    // 1. セッションの削除
    await db.delete(sessions)
      .where(eq(sessions.userId, TEST_USER.id));

    // 2. OAuth情報の削除
    await db.delete(accounts)
      .where(eq(accounts.userId, TEST_USER.id));

    // 3. ユーザーの削除
    await db.delete(users)
      .where(eq(users.id, TEST_USER.id));

  } catch (error) {
    console.error("Failed to cleanup test user:", error);
    throw error;
  }
}
