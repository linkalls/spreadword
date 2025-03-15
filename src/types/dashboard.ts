// ダッシュボードの型定義
export interface Activity {
  id: number;
  wordId: number;
  word: string | null;
  activityType: string;
  result: boolean | null;
  timestamp: string | Date;
}



export interface DailyStat {
  date: string;
  totalActivities: number;
  quizCount: number;
  reviewCount: number;
  correctAnswers: number;
}

export interface GeneralStats {
  totalWords: number;
  completedWords: number;
  progressPercentage: number;
  quizAccuracy: number;
  recentActivity: Activity[];
}

export interface DashboardStats {
  generalStats: GeneralStats;
  dailyStats: DailyStat[];
}
