import { test, expect } from '@playwright/test';

test.describe('ダッシュボード機能', () => {
  test.beforeEach(async ({ page }) => {
    // ログインが必要な場合はここでログイン処理を実行
    await page.goto('/dashboard');
  });

  test('ダッシュボードページが正しく表示される', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('学習ダッシュボード');
  });

  test('統計カードが表示される', async ({ page }) => {
    // 4つの統計カードが表示されることを確認
    const statsCards = page.locator('.grid > div');
    await expect(statsCards).toHaveCount(4);

    // 各カードのタイトルを確認
    const cardTitles = [
      '総単語数',
      '完了した単語',
      '進捗率',
      'クイズ正解率'
    ];

    for (const title of cardTitles) {
      await expect(page.locator(`text=${title}`)).toBeVisible();
    }
  });

  test('最近の学習活動が表示される', async ({ page }) => {
    const recentActivity = page.locator('text=最近の学習活動');
    await expect(recentActivity).toBeVisible();

    // アクティビティリストが表示されることを確認
    const activityList = page.locator('.space-y-4 > div');
    await expect(activityList).toBeVisible();
  });

  test('日別の学習統計が表示される', async ({ page }) => {
    const dailyStats = page.locator('text=日別の学習統計');
    await expect(dailyStats).toBeVisible();

    // 統計リストが表示されることを確認
    const statsList = page.locator('.space-y-4 > div').last();
    await expect(statsList).toBeVisible();

    // 各日の統計に「クイズ」と「復習」の情報が含まれていることを確認
    await expect(page.locator('text=クイズ:')).toBeVisible();
    await expect(page.locator('text=復習:')).toBeVisible();
  });

  test('統計の値が数値として表示される', async ({ page }) => {
    // 進捗率の値が数値として表示されることを確認
    const progressValue = page.locator('text=進捗率').locator('xpath=../..').locator('p.text-3xl');
    const progress = await progressValue.textContent();
    expect(Number(progress?.replace('%', ''))).not.toBeNaN();

    // 正解率の値が数値として表示されることを確認
    const accuracyValue = page.locator('text=クイズ正解率').locator('xpath=../..').locator('p.text-3xl');
    const accuracy = await accuracyValue.textContent();
    expect(Number(accuracy?.replace('%', ''))).not.toBeNaN();
  });
});
