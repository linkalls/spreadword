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

#### 2.2 PDFレポート機能
- [x] 基本的なPDFレポート生成
  - [x] 学習統計の表示
  - [x] 間違えた単語の一覧
  - [x] 学習アドバイス

### 3. ソーシャル機能とモチベーション維持

#### 3.1 コミュニティ機能実装計画 🤝

##### 1. 基本的なグループ機能 👥
- [ ] グループのデータベーススキーマ設計
  ```typescript
  interface Group {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    ownerId: string;
    isPrivate: boolean;
    maxMembers: number;
    currentMembers: number;
  }
  ```
- [ ] グループメンバーシップのスキーマ
  ```typescript
  interface GroupMember {
    userId: string;
    groupId: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: Date;
  }
  ```
- [ ] グループCRUD API実装
  - [ ] グループ作成
  - [ ] グループ詳細取得
  - [ ] グループ更新
  - [ ] グループ削除
- [ ] グループ参加/退会機能
  - [ ] 招待システム
  - [ ] 参加承認フロー
  - [ ] 退会処理

##### 2. グループ活動機能 📊
- [ ] グループ学習進捗表示
  ```typescript
  interface GroupProgress {
    groupId: string;
    totalWordsLearned: number;
    averageQuizScore: number;
    activeMembers: number;
    weeklyProgress: {
      date: string;
      wordsLearned: number;
    }[];
  }
  ```
- [ ] グループ目標設定
  - [ ] 週間/月間目標
  - [ ] 達成度トラッキング
- [ ] グループチャレンジ
  - [ ] チャレンジ作成
  - [ ] 進捗表示
  - [ ] 結果発表

##### 3. ランキング機能 🏆
- [ ] グローバルランキング実装
  ```typescript
  interface RankingEntry {
    userId: string;
    username: string;
    avatar: string;
    score: number;
    rank: number;
    progress: {
      wordsLearned: number;
      quizzesTaken: number;
      accuracy: number;
    };
  }
  ```
- [ ] グループランキング
  - [ ] メンバー間ランキング
  - [ ] グループ間ランキング
- [ ] 期間別ランキング
  - [ ] 週間ランキング
  - [ ] 月間ランキング
  - [ ] シーズンランキング

##### 4. コミュニケーション機能 💬
- [ ] グループチャット
  ```typescript
  interface ChatMessage {
    id: string;
    groupId: string;
    userId: string;
    content: string;
    timestamp: Date;
    attachments?: {
      type: 'image' | 'file';
      url: string;
    }[];
  }
  ```
- [ ] お知らせ機能
  - [ ] グループ内アナウンス
  - [ ] イベント通知
- [ ] メンバー間DM機能

##### 5. UI/UX実装 🎨
- [ ] グループページデザイン
  - [ ] グループ一覧
  - [ ] グループ詳細
  - [ ] メンバー一覧
- [ ] ランキングページ
  - [ ] ランキング表示
  - [ ] フィルター機能
  - [ ] アニメーション効果
- [ ] チャット UI
  - [ ] メッセージ表示
  - [ ] 入力フォーム
  - [ ] リアルタイム更新

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

### フェーズ 2: ユーザー体験の向上 🚀

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


2. PDFレポート機能のシンプル化
   - [x] 必要最小限の情報を含むレポート生成
   - [x] 学習進捗のわかりやすい表示
   - [x] 間違えた単語の明確な表示
   - [x] 学習アドバイスの提供

3. UI/UX の改善
   - [x] 管理画面のUI改善
     - [x] shadcnコンポーネントの導入
     - [x] テーブルによるデータ表示の改善
     - [x] ダイアログコンポーネントの実装
     - [x] トースト通知による操作フィードバック
   - [x] モバイルレスポンシブ対応の強化
     - [x] ヘッダーのモバイル対応改善（PC版と同じ内容に調整）
     - [x] その他のコンポーネントのレスポンシブ対応
         - [x] フラッシュカードのモバイル対応
         - [x] 単語リストのモバイル対応
         - [x] クイズカードのモバイル対応
         - [x] ダッシュボードコンポーネントのモバイル対応
   - [x] アニメーション効果の追加
     - [x] フラッシュカードの回転アニメーション改善
     - [x] メニュートランジションの最適化
   - [x] アクセシビリティの向上
     - [x] WAI-ARIA対応
       - [x] 適切なロールと属性の設定
       - [x] ステータスや状態の通知
       - [x] フォームコントロールのラベル付け
     - [x] キーボード操作
       - [x] フォーカス管理の改善
       - [x] キーボードナビゲーション
       - [x] フォーカスインジケータの視覚的改善
     - [x] スクリーンリーダー対応
       - [x] 状態変更の通知
       - [x] 適切な代替テキスト
       - [x] 操作方法の明確な説明
     - [x] その他の改善
       - [x] カラーコントラストの確認
       - [x] アニメーション制御
       - [x] エラー状態の明確な通知

   4. adminの設定
   - [x] ユーザー権限の管理機能
   - [x] 単語の追加
   - [x] 単語の編集
   - [x] 単語の削除
   

### フェーズ 3: ソーシャル機能（開発中） 🚧

1. グループ機能
   - [ ] 学習グループの作成・参加
   - [ ] グループ内チャット
   - [ ] 共同学習セッション

2. ランキング
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
