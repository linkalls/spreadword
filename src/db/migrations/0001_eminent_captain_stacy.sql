-- DROP INDEX "authenticator_credentialID_unique";--> statement-breakpoint
-- DROP INDEX "user_email_unique";--> statement-breakpoint
ALTER TABLE `user_words` ALTER COLUMN "last_mistake_date" TO "last_mistake_date" text;--> statement-breakpoint
-- CREATE UNIQUE INDEX `authenticator_credentialID_unique` ON `authenticator` (`credentialID`);--> statement-breakpoint
-- CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);