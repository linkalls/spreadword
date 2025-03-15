# SpreadWord 実装計画 III

## 実装済み機能 ✅

### データベース基盤
- [x] `user_words`中間テーブルの作成と設定
- [x] 基本的なリレーション構造の確立
- [x] 初期マイグレーションの実行

### クイズ機能
- [x] 基本的な4択クイズの実装
- [x] ランダム単語選択メカニズム
- [x] 即時フィードバック表示

### ダッシュボード
- [x] 基本的な学習統計の表示
- [x] 学習履歴の記録
- [x] PDF出力機能の基本実装
  - [x] 統計情報のセクション
  - [x] 間違えた単語のセクション
  - [x] 学習アドバイスのセクション

## 実装予定の機能と改善点 🚀

### 1. 学習体験の強化

#### 1.1 インタラクティブな学習モード
- [x] フラッシュカードモード
  ```typescript
  interface FlashCard {
    word: string;
    meaning: string;
    example: string;
    pronunciation: string;
    userNotes?: string;
  }
  ```
- [ ] スペルチェックモード
- [ ] 音声発音練習モード（Web Speech API 活用）
- [x] 間違えた単語の詳細学習機能
  ```typescript
  interface MistakeAnalysis {
    word: string;
    mistakeCount: number;
    lastMistakeDate: Date;
    generatedExamples: {
      english: string;
      japanese: string;
      usedWords: string[];
      difficulty: "easy" | "medium" | "hard";
    }[];
    aiSuggestions: {
      similarWords: string[];
      memorizationTips: string[];
    };
  }
  ```

#### 1.2 パーソナライズされた学習パス
- [ ] レベル別学習コース
  ```typescript
  interface LearningPath {
    level: "beginner" | "intermediate" | "advanced";
    dailyWordGoal: number;
    recommendedWords: string[];
    estimatedTimeMinutes: number;
  }
  ```
- [ ] AI による苦手単語の特定と復習推奨
- [ ] 学習ペースの最適化アルゴリズム

### 2. ダッシュボード機能の拡張

#### 2.1 詳細な学習分析
- [x] 時間帯別の学習効率グラフ
- [ ] カテゴリー別の習熟度分析
- [x] 苦手分野の可視化
  ```typescript
  interface LearningAnalytics {
    categoryPerformance: {
      category: string;
      correctRate: number;
      timeSpent: number;
      improvement: number;
    }[];
    weakPoints: string[];
    recommendedActions: string[];
  }
  ```

#### 2.2 PDF機能の強化（実装中）
- [x] 基本的なPDFレポート生成
- [ ] カスタマイズ可能なテンプレート
- [ ] 学習目標の進捗状況表示
- [x] 間違えた単語の詳細レポート
  - [x] Geminiで生成された例文集
  - [x] 復習推奨スケジュール
  - [x] 関連語彙マップ

### 3. ソーシャル機能とモチベーション維持

#### 3.1 コミュニティ機能
- [ ] 学習グループの作成と参加
  ```typescript
  interface StudyGroup {
    id: string;
    name: string;
    level: string;
    members: User[];
    weeklyGoal: number;
    leaderboard: LeaderboardEntry[];
  }
  ```
- [ ] グループチャレンジ機能
- [ ] 進捗共有機能

#### 3.2 ゲーミフィケーション
- [ ] デイリーチャレンジ
- [ ] 実績システム
- [ ] ランキングボード
  ```typescript
  interface Achievement {
    id: string;
    title: string;
    description: string;
    criteria: {
      type: "words_learned" | "daily_streak" | "quiz_score";
      threshold: number;
    };
    reward: {
      type: "badge" | "points" | "special_feature";
      value: any;
    };
  }
  ```

## 優先順位とマイルストーン

### フェーズ 1: 基本機能（完了） ✅
1. [x] フラッシュカードモードの実装
2. [x] ダッシュボード分析機能の基本実装
3. [x] 間違えた単語の詳細ページ実装
4. [x] /dashboard/details/[date]ページの実装
   - [x] 間違えた単語一覧表示
   - [x] Geminiを活用した英文生成
   - [x] PDFダウンロード機能

### フェーズ 2: ユーザー体験の向上（開発中） 🚧

0. quiz機能の改善
   - [x] completeのものは、次のquizに出ないようにする
   - [x] 間違えたものは、次のquizに出やすくする
   - [x] 間違えたものは、間違えた回数に応じて出やすくする

1. 単語リストのユーザー作成機能
   - [x] カスタム単語リストの作成(userに紐づけ)
   - [x] リスト内単語の学習進捗追跡
     - [x] 進捗状況の視覚化（プログレスバー）
     - [x] 習得状態の表示
     - [x] 間違えた回数と日付の表示
   - [x] リスト共有機能（公開/非公開設定）
     - [x] 公開/非公開の切り替え
     - [x] シェアリンクの生成（ランダムID使用）
     - [x] シェアページの実装
   - [x] リスト内単語のクイズ機能
     - [x] リスト内単語からのランダム選択機能
     - [x] 進捗に基づく重み付け
     - [x] クイズ開始ボタンの追加
   - [x] リスト内単語のフラッシュカード表示


2. PDFレポート機能の強化
   - [x] 基本的なレポートテンプレート
   - [x] 学習進捗のグラフ表示
   - [x] Gemini生成コンテンツの組み込み
   - [ ] カスタマイズオプションの追加

3. UI/UX の改善
   - [ ] モバイルレスポンシブ対応の強化
   - [ ] ダークモード実装
   - [ ] アニメーション効果の追加
   - [ ] アクセシビリティの向上

   4. adminの設定
   - [ ] ユーザーの追加
   - [ ] 単語の追加
   - [ ] 単語の編集
   - [ ] 単語の削除
   - [ ] ユーザーの削除
   

### フェーズ 3: ソーシャル機能（計画中） 📋

1. グループ機能
   - [ ] 学習グループの作成・参加
   - [ ] グループ内チャット
   - [ ] 共同学習セッション

2. ゲーミフィケーション
   - [ ] デイリーチャレンジ
   - [ ] 実績バッジ
   - [ ] レベルアップシステム
   - [ ] 報酬メカニズム

3. ランキング
   - [ ] グローバルランキング
   - [ ] グループ別ランキング
   - [ ] 週間/月間ベストプレイヤー

## 技術的考慮事項

### パフォーマンス最適化（優先度: 高） ⚡

1. クエリ最適化
   ```sql
   -- インデックス追加例
   CREATE INDEX idx_user_words_user_id ON user_words(user_id);
   CREATE INDEX idx_learning_history_date ON learning_history(learning_date);
   ```

2. フロントエンド最適化
   - [ ] コード分割の実装
   - [ ] 画像最適化
   - [ ] レンダリングパフォーマンス改善

3. キャッシュ戦略
   - [x] APIレスポンスのキャッシュ
   - [x] 総単語数のJSONキャッシュによる最適化
   - [ ] 静的アセットの最適化
   - [ ] Service Worker活用

### セキュリティ（優先度: 高） 🔒

1. API保護
   - [ ] レート制限の実装
   - [ ] 入力バリデーション強化
   - [ ] XSS/CSRF対策

2. データ保護
   - [ ] 暗号化の強化
   - [ ] バックアップ戦略の改善
   - [ ] アクセス制御の最適化

### モニタリング（優先度: 中） 📊

1. エラー追跡
   - [ ] ログ収集システムの導入
   - [ ] アラート設定
   - [ ] エラー分析ダッシュボード

2. パフォーマンス監視
   - [ ] メトリクス収集
   - [ ] ユーザー行動分析
   - [ ] システムヘルスチェック
