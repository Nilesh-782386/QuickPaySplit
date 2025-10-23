import {
  type Transaction,
  type InsertTransaction,
  type UserConfig,
  type InsertUserConfig,
  type Balance,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getAllTransactions(): Promise<Transaction[]>;
  clearTransactions(): Promise<void>;
  
  // User config operations
  getUserConfig(): Promise<UserConfig>;
  updateUserConfig(config: InsertUserConfig): Promise<UserConfig>;
  
  // Balance calculation
  getBalance(): Promise<Balance>;
}

export class MemStorage implements IStorage {
  private transactions: Map<string, Transaction>;
  private userConfig: UserConfig;

  constructor() {
    this.transactions = new Map();
    this.userConfig = {
      id: randomUUID(),
      user1Name: "User 1",
      user2Name: "User 2",
    };
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      date: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    const txs = Array.from(this.transactions.values());
    // Sort by date descending (most recent first)
    return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async clearTransactions(): Promise<void> {
    this.transactions.clear();
  }

  async getUserConfig(): Promise<UserConfig> {
    return this.userConfig;
  }

  async updateUserConfig(config: InsertUserConfig): Promise<UserConfig> {
    this.userConfig = {
      ...this.userConfig,
      ...config,
    };
    return this.userConfig;
  }

  async getBalance(): Promise<Balance> {
    const transactions = await this.getAllTransactions();
    
    // Calculate net balance with 50/50 split
    // Positive = user2 owes user1
    // Negative = user1 owes user2
    let netBalance = 0;
    
    for (const transaction of transactions) {
      const amount = parseFloat(transaction.amount);
      const splitAmount = amount / 2; // Each person's share is half
      
      if (transaction.paidBy === "user1") {
        // User1 paid, so User2 owes User1 half the amount
        netBalance += splitAmount;
      } else {
        // User2 paid, so User1 owes User2 half the amount
        netBalance -= splitAmount;
      }
    }

    return {
      user1Name: this.userConfig.user1Name,
      user2Name: this.userConfig.user2Name,
      netBalance: parseFloat(netBalance.toFixed(2)),
      totalTransactions: transactions.length,
    };
  }
}

export const storage = new MemStorage();
