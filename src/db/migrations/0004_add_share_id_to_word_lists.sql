-- ワードリストにシェア用のIDを追加するマイグレーション
ALTER TABLE "word_lists" ADD COLUMN "share_id" TEXT UNIQUE;

-- メタデータ
--> statement-breakpoint
CREATE INDEX "word_lists_share_id_idx" ON "word_lists" ("share_id");
