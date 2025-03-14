CREATE TABLE `learning_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`wordId` integer NOT NULL,
	`activity_type` text NOT NULL,
	`result` integer,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`wordId`) REFERENCES `word`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quiz_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`wordId` integer NOT NULL,
	`selected_choice` text NOT NULL,
	`is_correct` integer NOT NULL,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`wordId`) REFERENCES `word`(`id`) ON UPDATE no action ON DELETE cascade
);
