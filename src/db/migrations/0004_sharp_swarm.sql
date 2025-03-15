ALTER TABLE `word_lists` ADD `share_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `word_lists_share_id_unique` ON `word_lists` (`share_id`);