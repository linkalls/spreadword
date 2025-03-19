import { test, expect } from '@playwright/test';
import { seedTestUser, cleanupTestUser, TEST_USER } from './helpers/seed-auth';
import { seedTestData, cleanupTestData } from './helpers/seed-test-data';

test.describe('単語リスト機能', () => {
  // テストの実行前にテストユーザーとテストデータをセットアップ
  test.beforeAll(async () => {
    await cleanupTestUser();
    await seedTestUser();
    await seedTestData();
  });

  // テスト完了後にクリーンアップ
  test.afterAll(async () => {
    await cleanupTestData();
    await cleanupTestUser();
  });

  // 各テストの実行前にセッションCookieを設定
  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: TEST_USER.sessionToken,
        domain: 'localhost:3001',
        path: '/',
      },
    ]);
    await page.goto('/wordlists');
  });

  test('既存の単語リストの表示確認', async ({ page }) => {
    // テストデータで作成したリストが表示されることを確認
    await expect(page.getByText('テスト用公開リスト')).toBeVisible();
    await expect(page.getByText('テスト用非公開リスト')).toBeVisible();
  });

  test('新規リスト作成', async ({ page }) => {
    // リスト作成ダイアログを開く
    await page.getByRole('button', { name: '新しいリストを作成' }).click();

    // ダイアログが表示されることを確認
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 空のリスト名でエラーが表示されることを確認
    const submitButton = dialog.getByRole('button', { name: '作成' });
    await submitButton.click();
    await expect(page.getByText('リスト名は必須です')).toBeVisible();

    // 正しい入力でリストを作成
    await dialog.getByLabel('リスト名').fill('新しいテスト用リスト');
    await dialog.getByLabel('説明').fill('E2Eテストで作成したリスト');
    await dialog.getByLabel('公開').check();
    await submitButton.click();

    // リストが作成され、一覧に表示されることを確認
    await expect(page.getByText('新しいテスト用リスト')).toBeVisible();
    await expect(page.getByText('E2Eテストで作成したリスト')).toBeVisible();
  });

  test('既存リストの編集', async ({ page }) => {
    // テスト用公開リストをクリック
    await page.getByText('テスト用公開リスト').click();
    
    // 編集ボタンをクリック
    await page.getByRole('button', { name: '編集' }).click();

    // ダイアログが表示されることを確認
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // リスト情報を編集
    await dialog.getByLabel('リスト名').fill('更新後のリスト名');
    await dialog.getByLabel('説明').fill('更新後の説明文');
    await dialog.getByRole('button', { name: '保存' }).click();

    // 更新された情報が表示されることを確認
    await expect(page.getByText('更新後のリスト名')).toBeVisible();
    await expect(page.getByText('更新後の説明文')).toBeVisible();
  });

  test('単語の追加と確認', async ({ page }) => {
    // テスト用公開リストをクリック
    await page.getByText('テスト用公開リスト').click();

    // 既存の単語が表示されることを確認
    await expect(page.getByText('test')).toBeVisible();
    await expect(page.getByText('example')).toBeVisible();

    // 単語追加ダイアログを開く
    await page.getByRole('button', { name: '単語を追加' }).click();
    const dialog = page.getByRole('dialog');

    // 新しい単語を追加
    await dialog.getByLabel('英語').fill('playwright');
    await dialog.getByLabel('日本語').fill('プレイライト');
    await dialog.getByLabel('メモ').fill('E2Eテストフレームワーク');
    await dialog.getByRole('button', { name: '追加' }).click();

    // 追加された単語が表示されることを確認
    await expect(page.getByText('playwright')).toBeVisible();
    await expect(page.getByText('プレイライト')).toBeVisible();
  });

  test('単語の編集', async ({ page }) => {
    // テスト用公開リストをクリック
    await page.getByText('テスト用公開リスト').click();

    // 最初の単語の編集ボタンをクリック
    await page.getByRole('button', { name: '編集' }).first().click();

    // 単語情報を更新
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('英語').fill('updated');
    await dialog.getByLabel('日本語').fill('更新済み');
    await dialog.getByLabel('メモ').fill('更新後のメモ');
    await dialog.getByRole('button', { name: '保存' }).click();

    // 更新された情報が表示されることを確認
    await expect(page.getByText('updated')).toBeVisible();
    await expect(page.getByText('更新済み')).toBeVisible();
  });
});
