import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable("users", {
  email: text("email").notNull(),
  id: integer("id").notNull().primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});
