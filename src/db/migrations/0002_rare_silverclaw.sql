DROP INDEX "authenticator_credentialID_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
ALTER TABLE `user_words` ALTER COLUMN "complete" TO "complete" integer DEFAULT 0;--> statement-breakpoint
CREATE UNIQUE INDEX `authenticator_credentialID_unique` ON `authenticator` (`credentialID`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
ALTER TABLE `user_words` ALTER COLUMN "last_mistake_date" TO "last_mistake_date" text DEFAULT '';--> statement-breakpoint
ALTER TABLE `user_words` ADD `bookmarked` integer DEFAULT 0;