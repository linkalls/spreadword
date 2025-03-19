import { Page } from '@playwright/test';

export async function authenticateUser(page: Page) {
  // セッショントークンをモック
  const mockSession = {
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24時間後
  };

  // セッションをlocalStorageに保存
  await page.evaluate((session) => {
    localStorage.setItem('next-auth.session-token', JSON.stringify(session));
  }, mockSession);

  // セッションCookieを設定
  await page.context().addCookies([
    {
      name: 'next-auth.session-token',
      value: 'mock-session-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
  ]);
}

// テストデータのクリーンアップ用関数
export async function cleanupAuth(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('next-auth.session-token');
  });
  await page.context().clearCookies();
}
