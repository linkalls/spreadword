import { recalculateAndSaveStats } from "./system-stats";

/**
 * システムの初期化処理
 * アプリケーション起動時に実行される
 */
export const initializeSystem = async () => {
  try {
    console.log("Initializing system...");
    
    // システム統計情報の初期化
    await recalculateAndSaveStats();
    
    console.log("System initialization complete.");
  } catch (error) {
    console.error("Failed to initialize system:", error);
    throw error;
  }
};
