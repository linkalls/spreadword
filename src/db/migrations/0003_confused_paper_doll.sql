CREATE TABLE `user_words` (
	`userId` text NOT NULL,
	`wordId` integer NOT NULL,
	`complete` integer DEFAULT false,
	PRIMARY KEY(`userId`, `wordId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`wordId`) REFERENCES `word`(`id`) ON UPDATE no action ON DELETE cascade
);
