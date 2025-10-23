import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users/Members table - supports any number of users in a group
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Transactions table - now references user IDs
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paidById: varchar("paid_by_id", { length: 36 }).notNull(), // References users.id
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull().default(sql`now()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  date: true,
}).extend({
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required").max(100),
  paidById: z.string().min(1, "Please select who paid"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// Transaction with user info
export type TransactionWithUser = Transaction & {
  paidByName: string;
};

// Balance between two users
export type PairwiseBalance = {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number; // Positive amount means fromUser owes toUser
};

// Overall balance summary
export type BalanceSummary = {
  users: User[];
  balances: PairwiseBalance[];
  totalTransactions: number;
};
