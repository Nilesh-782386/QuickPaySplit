import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Transactions table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paidBy: varchar("paid_by", { length: 50 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull().default(sql`now()`),
});

// User configuration table
export const userConfig = pgTable("user_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user1Name: varchar("user1_name", { length: 50 }).notNull().default("User 1"),
  user2Name: varchar("user2_name", { length: 50 }).notNull().default("User 2"),
});

// Insert schemas
export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  date: true,
}).extend({
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required").max(100),
  paidBy: z.enum(["user1", "user2"], {
    errorMap: () => ({ message: "Please select who paid" }),
  }),
});

export const insertUserConfigSchema = createInsertSchema(userConfig).omit({
  id: true,
}).extend({
  user1Name: z.string().min(1, "Name is required").max(50),
  user2Name: z.string().min(1, "Name is required").max(50),
});

// Types
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type UserConfig = typeof userConfig.$inferSelect;
export type InsertUserConfig = z.infer<typeof insertUserConfigSchema>;

// Balance type
export type Balance = {
  user1Name: string;
  user2Name: string;
  netBalance: number; // Positive = user2 owes user1, Negative = user1 owes user2
  totalTransactions: number;
};
