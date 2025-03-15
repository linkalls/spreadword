export interface QuizStats {
  total: number;
  correct: number;
  accuracy: number;
  recentResults: {
    id: number;
    wordId: number;
    isCorrect: boolean;
    timestamp: Date;
  }[];
}
