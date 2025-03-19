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
  // フォント設定
  fontSizes?: {
    title: number;
    heading: number;
    subheading: number;
    body: number;
  };
  // マージン設定（単位: mm）
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  // グラフスタイル
  chartStyle?: {
    showLegend: boolean;
    showGrid: boolean;
    barColor?: string;
    lineColor?: string;
    legendPosition: "top" | "bottom" | "left" | "right";
  };
  // スペーシング（単位: mm）
  spacing?: {
    betweenSections: number;
    betweenElements: number;
    paragraphSpacing: number;
  };
  // ヘッダー・フッター設定
  headerFooter?: {
    showHeader: boolean;
    showFooter: boolean;
    headerText?: string;
    footerText?: string;
    includePageNumber: boolean;
    includeDatetime: boolean;
  };
}

export interface LearningStatistics {
  totalWordsLearned: number;
  correctAnswerRate: number;
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
