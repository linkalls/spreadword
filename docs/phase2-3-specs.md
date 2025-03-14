# フェーズ 2-3 詳細仕様書

## フェーズ 2: ユーザー体験の向上

### 1. 音声機能の追加

#### Web Speech API の実装

- **機能概要**
  - 単語の発音を音声で聞ける機能
- **技術仕様**

```typescript
interface SpeechFeatures {
  // 音声合成機能
  textToSpeech: {
    language: string;    // 'en-US'
    rate: number;       // 0.1 ~ 10
    pitch: number;      // 0 ~ 2
    volume: number;     // 0 ~ 1
  };

```

- **UI コンポーネント**
  - 音声再生ボタン
  - 録音開始/停止ボタン
  - 音声波形表示

### 2. PDF レポート機能の強化

#### カスタマイズ可能なレポート生成システム

- **機能概要**

  - 詳細な学習統計の PDF レポート生成
  - カスタマイズ可能なテンプレート
  - Gemini 生成コンテンツの組み込み

- **技術仕様**

```typescript
interface PDFReport {
  template: {
    layout: "simple" | "detailed" | "custom";
    colorScheme: "light" | "dark" | "custom";
    sections: ReportSection[];
  };

  content: {
    userStats: LearningStatistics;
    progressGraphs: GraphData[];
    weakPoints: string[];
    geminiContent: {
      examples: string[];
      tips: string[];
    };
  };
}

interface ReportSection {
  id: string;
  title: string;
  type: "stats" | "graph" | "text" | "examples";
  enabled: boolean;
  order: number;
}
```

### 3. UI/UX の改善

#### モバイル対応とダークモード

- **機能概要**

  - レスポンシブデザインの強化
  - ダークモードの実装
  - アニメーション効果
  - アクセシビリティ対応

- **技術仕様**

```typescript
interface ThemeConfig {
  mode: "light" | "dark" | "system";
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    // その他のカラーパレット
  };
  animation: {
    duration: number;
    easing: string;
  };
}
```

## フェーズ 3: ソーシャル機能

### 1. グループ機能

#### 学習グループシステム

- **機能概要**

  - グループの作成・参加
  - グループ内チャット
  - 共同学習セッション

- **技術仕様**

```typescript
interface StudyGroup {
  id: string;
  name: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  members: {
    userId: string;
    role: "admin" | "moderator" | "member";
    joinedAt: Date;
  }[];
  settings: {
    isPrivate: boolean;
    maxMembers: number;
    joinRequireApproval: boolean;
  };
}

interface GroupChat {
  groupId: string;
  messages: {
    id: string;
    userId: string;
    content: string;
    timestamp: Date;
    attachments?: string[];
  }[];
}
```

### 2. ゲーミフィケーション

#### 実績・チャレンジシステム

- **機能概要**

  - デイリーチャレンジ
  - 実績バッジ
  - レベルアップシステム
  - 報酬メカニズム

- **技術仕様**

```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  criteria: {
    type: "words_learned" | "daily_streak" | "quiz_score" | "practice_time";
    threshold: number;
    timeframe?: "daily" | "weekly" | "monthly" | "all_time";
  };
  reward: {
    type: "badge" | "points" | "title" | "feature_unlock";
    value: any;
  };
}

interface UserProgress {
  level: number;
  experience: number;
  achievements: string[]; // 獲得済み実績ID
  dailyStreak: number;
  totalPoints: number;
}
```

### 3. ランキングシステム

#### マルチレベルのリーダーボード

- **機能概要**
  - グローバルランキング
  - グループ別ランキング
  - 期間別ランキング
- **技術仕様**

```typescript
interface Leaderboard {
  type: "global" | "group" | "weekly" | "monthly";
  entries: {
    userId: string;
    rank: number;
    score: number;
    stats: {
      wordsLearned: number;
      quizAccuracy: number;
      practiceTime: number;
    };
  }[];
  timeframe?: {
    start: Date;
    end: Date;
  };
}
```

## データベース設計

### 新規テーブル

```sql
-- グループ管理
CREATE TABLE study_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  level TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  settings JSONB NOT NULL
);

-- グループメンバーシップ
CREATE TABLE group_members (
  group_id TEXT REFERENCES study_groups(id),
  user_id TEXT REFERENCES users(id),
  role TEXT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (group_id, user_id)
);

-- 実績システム
CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL,
  reward JSONB NOT NULL
);

-- ユーザー実績
CREATE TABLE user_achievements (
  user_id TEXT REFERENCES users(id),
  achievement_id TEXT REFERENCES achievements(id),
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, achievement_id)
);

-- ランキング履歴
CREATE TABLE ranking_history (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  timeframe JSONB,
  rankings JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
