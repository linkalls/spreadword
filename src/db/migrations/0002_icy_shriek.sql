CREATE TABLE `word` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`word` text NOT NULL,
	`meanings` text NOT NULL,
	`part_of_speech` text,
	`choices` text,
	`ex` text,
	`complete` integer DEFAULT false
);
