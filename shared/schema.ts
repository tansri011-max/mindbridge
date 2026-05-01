import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users / Students
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  university: text("university").notNull(),
  year: text("year").notNull(),
  createdAt: text("created_at").notNull(),
});

// Mood Check-in entries
export const checkins = sqliteTable("checkins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  mood: integer("mood").notNull(), // 1-10
  energy: integer("energy").notNull(), // 1-10
  stress: integer("stress").notNull(), // 1-10
  sleep: real("sleep").notNull(), // hours
  note: text("note"),
  triageLevel: text("triage_level").notNull(), // GREEN, YELLOW, RED
  aiInsight: text("ai_insight"),
  createdAt: text("created_at").notNull(),
});

// Support resources
export const resources = sqliteTable("resources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // peer, counselor, emergency, self-help
  url: text("url"),
  phone: text("phone"),
  level: text("level").notNull(), // GREEN, YELLOW, RED, ALL
});

// Peer support chat messages
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  senderName: text("sender_name").notNull(),
  content: text("content").notNull(),
  isBot: integer("is_bot", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertCheckinSchema = createInsertSchema(checkins).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCheckin = z.infer<typeof insertCheckinSchema>;
export type Checkin = typeof checkins.$inferSelect;
export type Resource = typeof resources.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
