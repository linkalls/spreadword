CREATE TABLE `word_list_items` (
	`list_id` integer NOT NULL,
	`word_id` integer NOT NULL,
	`added_at` integer NOT NULL,
	`notes` text,
	PRIMARY KEY(`list_id`, `word_id`),
	FOREIGN KEY (`list_id`) REFERENCES `word_lists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`word_id`) REFERENCES `word`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `word_lists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_public` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

ALTER TABLE `learning_history` ALTER COLUMN "result" TO "result" integer DEFAULT 0;--> statement-breakpoint
