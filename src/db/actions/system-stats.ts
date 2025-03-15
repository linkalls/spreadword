import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { db } from '../dbclient';
import { words } from '../schema';

const STATS_FILE_PATH = join(process.cwd(), 'src/db/system-stats.json');

interface SystemStats {
  totalWords: number;
  lastUpdated: string;
}

/**
 * システム統計情報を読み込む
 * ファイルが存在しない場合やエラーの場合はDBから再計算
 */
export const getSystemStats = async (): Promise<SystemStats> => {
  try {
    const stats = JSON.parse(readFileSync(STATS_FILE_PATH, 'utf-8'));
    return stats;
  } catch (error) {
    // ファイルが存在しないか、読み込みエラーの場合は再計算
    console.log(error)
    return await recalculateAndSaveStats();
  }
};

/**
 * システム統計情報を再計算してファイルに保存
 */
export const recalculateAndSaveStats = async (): Promise<SystemStats> => {
  try {
    // DBから総単語数を取得
    const allWords = await db.select().from(words);
    const totalWords = allWords.length;

    const stats: SystemStats = {
      totalWords,
      lastUpdated: new Date().toISOString(),
    };

    // 統計情報をファイルに保存
    writeFileSync(STATS_FILE_PATH, JSON.stringify(stats, null, 2));

    return stats;
  } catch (error) {
    console.error('Error recalculating system stats:', error);
    throw error;
  }
};

/**
 * 総単語数を更新
 * @param delta 増減値（追加: +1, 削除: -1）
 */
export const updateTotalWords = async (delta: number): Promise<void> => {
  try {
    const stats = await getSystemStats();
    
    const updatedStats: SystemStats = {
      totalWords: Math.max(0, stats.totalWords + delta), // 負の値にならないように
      lastUpdated: new Date().toISOString(),
    };

    writeFileSync(STATS_FILE_PATH, JSON.stringify(updatedStats, null, 2));
  } catch (error) {
    console.error('Error updating total words count:', error);
    throw error;
  }
};
