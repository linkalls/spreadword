import { test, expect } from '@playwright/test';
import { seedTestUser, cleanupTestUser, TEST_USER } from './helpers/seed-auth';
import { seedTestData, cleanupTestData } from './helpers/seed-test-data';

test.describe('クイズ機能', () => {
  // テストの実行前にテストユーザーとテストデータをセットアップ
  test.beforeAll(async () => {
    await cleanupTestUser(); // 念のため既存のテストユーザーを削除
    await seedTestUser();
    await seedTestData();
  });

  // テスト完了後にクリーンアップ
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

  test('単語リストからクイズを開始できる', async ({ page }) => {
    // テスト用の公開リストのページに移動
    await page.goto('/wordlists');
    await page.getByText('テスト用公開リスト').click();

    // クイズボタンをクリック
    await page.getByRole('link', { name: 'クイズ' }).click();

    // クイズページに遷移したことを確認
    await expect(page.locator('h1')).toHaveText('単語クイズ');
    
    // リスト名が表示されていることを確認
    const listName = await page.locator('.text-sm').textContent();
    expect(listName).toContain('テスト用公開リスト');
  });

  test('ランダムクイズを開始できる', async ({ page }) => {
    // クイズページに直接移動
    await page.goto('/quiz');

    // ランダムクイズの開始ボタンをクリック
    await page.getByRole('button', { name: 'ランダムクイズを開始' }).click();

    // クイズが開始されたことを確認
    await expect(page.locator('button.w-full')).toHaveCount(4);
  });

  test('クイズの基本機能と表示を確認', async ({ page }) => {
    await page.goto('/quiz');
    
    // 1. ヘッダー要素の確認
    await expect(page.locator('h1')).toHaveText('単語クイズ');
    await expect(page.getByRole('button', { name: 'ダッシュボードに戻る' })).toBeVisible();

    // 2. クイズを開始
    await page.getByRole('button', { name: 'ランダムクイズを開始' }).click();

    // 3. クイズ問題の確認
    // テスト用の単語の1つが表示されていることを確認
    const questionText = await page.locator('h3').textContent();
    expect(['test', 'example']).toContain(questionText?.toLowerCase());

    // 4. 選択肢の確認
    const choices = page.locator('button.w-full');
    await expect(choices).toHaveCount(4);

    // 5. 進捗表示の確認
    const progress = page.locator('.text-sm.text-gray-500');
    await expect(progress).toContainText('問目');
  });

  test('クイズの回答と結果表示の確認', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: 'ランダムクイズを開始' }).click();

    // 最初の問題のテキストを保存
    const firstQuestion = await page.locator('h3').textContent();

    // 選択肢をクリック
    const firstChoice = page.locator('button.w-full').first();
    await firstChoice.click();

    // 結果が表示されることを確認
    const result = page.locator('div.mt-4');
    await expect(result).toBeVisible();
    
    // 正解または不正解のメッセージが表示されることを確認
    const resultText = await result.textContent();
    expect(resultText).toMatch(/正解！|不正解\.\.\./);

    // 次の問題ボタンをクリック
    await page.getByRole('button', { name: '次の問題' }).click();

    // 新しい問題のテキストを取得
    const nextQuestion = await page.locator('h3').textContent();
    expect(nextQuestion).not.toBe(firstQuestion);

    // 進捗が更新されていることを確認
    const progress = page.locator('.text-sm.text-gray-500');
    await expect(progress).toContainText('2 問目');
  });

  test('クイズの最終結果表示', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: 'ランダムクイズを開始' }).click();

    // 5問回答する
    for (let i = 0; i < 5; i++) {
      await page.locator('button.w-full').first().click();
      if (i < 4) {
        await page.getByRole('button', { name: '次の問題' }).click();
      }
    }

    // 最終結果が表示されることを確認
    await expect(page.getByText('クイズ完了！')).toBeVisible();
    await expect(page.getByText('正解率:')).toBeVisible();
    await expect(page.getByRole('button', { name: '新しいクイズを開始' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ダッシュボードに戻る' })).toBeVisible();
  });
});
