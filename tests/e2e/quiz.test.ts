import { test, expect } from '@playwright/test';

test.describe('クイズ機能', () => {
  test.beforeEach(async ({ page }) => {
    // ログインが必要な場合はここでログイン処理を実行
    await page.goto('/quiz');
  });

  test('クイズページが正しく表示される', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('単語クイズ');
    await expect(page.locator('button:has-text("ダッシュボードに戻る")')).toBeVisible();
  });

  test('クイズの選択肢が表示される', async ({ page }) => {
    // 選択肢のボタンが4つ表示されることを確認
    const choices = page.locator('button.w-full');
    await expect(choices).toHaveCount(4);
  });

  test('クイズに回答すると結果が表示される', async ({ page }) => {
    // 最初の選択肢をクリック
    const firstChoice = page.locator('button.w-full').first();
    await firstChoice.click();

    // 結果が表示されることを確認
    const result = page.locator('div.mt-4');
    await expect(result).toBeVisible();
    
    // 正解または不正解のメッセージが表示されることを確認
    const resultText = await result.textContent();
    expect(resultText).toMatch(/正解！|不正解\.\.\./);
  });

  test('クイズ結果の後に新しい問題が表示される', async ({ page }) => {
    // 最初の問題のテキストを保存
    const firstQuestion = await page.locator('h3').textContent();

    // 回答を選択
    await page.locator('button.w-full').first().click();

    // 2秒待機（新しい問題が表示されるまでの時間）
    await page.waitForTimeout(2000);

    // 新しい問題のテキストを取得
    const nextQuestion = await page.locator('h3').textContent();

    // 問題が変更されていることを確認
    expect(nextQuestion).not.toBe(firstQuestion);
  });
});
