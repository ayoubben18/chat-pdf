import {
  pgTable,
  integer,
  serial,
  text,
  timestamp,
  varchar,
  pgEnum,
} from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const userSystemEnum = pgEnum("user_system", ["user", "system"]);

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  pdfName: text("pdf_name").notNull(),
  pdfUrl: text("pdf_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  usersId: varchar("users_id", { length: 256 }).notNull(),
  fileKey: text("file_key").notNull(),
});
export type DBChats = InferSelectModel<typeof chats>;

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  chatId: integer("chat_id")
    .references(() => chats.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  role: userSystemEnum("role").notNull(),
});

export type DBMessages = InferSelectModel<typeof messages>;

//makaynch stripe flmghrib
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 256 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
