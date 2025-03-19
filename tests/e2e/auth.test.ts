import { test, expect } from '@playwright/test';
import { seedTestUser, cleanupTestUser, TEST_USER } from './helpers/seed-auth';
import { seedTestData, cleanupTestData } from './helpers/seed-test-data';

test.describe('認証機能と保護されたリソースのテスト', () => {
  // テストの実行前にテストユーザーとテストデータをセットアップ
  test.beforeAll(async () => {
    await cleanupTestUser(); // 念のため既存のテストユーザーを削除
    await seedTestUser();
    await seedTestData();
  });

  // 全てのテストが完了し、機能確認が終わった後にクリーンアップ
  test.afterAll(async () => {
    await cleanupTestData();
    await cleanupTestUser();
  });

  // 各テストの実行前にセッションCookieを設定
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: TEST_USER.sessionToken,
        domain: 'localhost:3001',
        path: '/',
      },
    ]);
  });

  test('未ログイン状態で保護されたページにアクセスできない', async ({ page }) => {
    // Cookieを消去してログアウト状態にする
    await page.context().clearCookies();

    // ダッシュボードページにアクセス
    await page.goto('/dashboard');

    // ログインページにリダイレクトされることを確認
    expect(page.url()).toContain('/auth/signin');
  });

  test('ログイン後にユーザー機能が使用できる', async ({ page }) => {
    // 1. ダッシュボードページにアクセス
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toHaveText(/ダッシュボード/);
    const userName = await page.locator('text=' + TEST_USER.name).isVisible();
    expect(userName).toBeTruthy();

    // 2. 単語リスト一覧の確認
    await page.goto('/wordlists');
    await expect(page.getByText('テスト用公開リスト')).toBeVisible();
    await expect(page.getByText('テスト用非公開リスト')).toBeVisible();

    // 3. クイズ機能の確認
    await page.goto('/quiz');
    await expect(page.getByRole('button', { name: 'ランダムクイズを開始' })).toBeVisible();

    // 4. フラッシュカード機能の確認
    await page.goto('/flashcards');
    await expect(page.getByRole('heading', { name: 'フラッシュカード' })).toBeVisible();
  });

  test('各機能の基本的な操作が可能', async ({ page }) => {
    // 1. 単語リストの確認
    await page.goto('/wordlists');
    await page.getByText('テスト用公開リスト').click();
    await expect(page.getByText('test')).toBeVisible();
    await expect(page.getByText('example')).toBeVisible();

    // 2. クイズの実行
    await page.goto('/quiz');
    await page.getByRole('button', { name: 'ランダムクイズを開始' }).click();
    await expect(page.locator('button.w-full')).toHaveCount(4);

    // 3. フラッシュカードの操作
    await page.goto('/flashcards/test-public-list');
    await expect(page.getByRole('button', { name: 'カードをめくる' })).toBeVisible();
  });

  test('ログアウトボタンで正常にログアウトできる', async ({ page }) => {
    // ダッシュボードページにアクセス
    await page.goto('/dashboard');

    // ログアウトボタンをクリック
    await page.getByRole('button', { name: 'ログアウト' }).click();

    // ホームページにリダイレクトされることを確認
    expect(page.url()).toBe('/');

    // 保護されたページにアクセスするとログインページにリダイレクトされることを確認
    await page.goto('/dashboard');
    expect(page.url()).toContain('/auth/signin');
  });
});
