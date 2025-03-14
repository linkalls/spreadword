export interface ReportSection {
  id: keyof ReportSections;
  title: string;
  enabled: boolean;
  order: number;
}

export interface ReportSections {
  header: boolean;
  summary: boolean;
  statistics: boolean;
  incorrectWords: boolean;
  learningTips: boolean;
}

export interface ReportTemplate {
  layout: "simple" | "detailed" | "custom";
  colorScheme: "light" | "dark" | "custom";
  sections: ReportSection[];
  customColors?: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

export interface LearningStatistics {
  totalWordsLearned: number;
  correctAnswerRate: number;
  totalStudyTime: number;
  dailyStreak: number;
  mostMistakenWords: Array<{
    word: string;
    meaning: string;
    mistakeCount: number;
  }>;
}

export interface ReportData {
  date: string;
  formattedDate: string;
  statistics: LearningStatistics;
  incorrectWords: Array<{
    english: string;
    japanese: string;
    timestamp: Date;
  }>;
  tips?: string[];
}
