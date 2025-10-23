import {
  type User,
  type InsertUser,
  type Transaction,
  type InsertTransaction,
  type TransactionWithUser,
  type BalanceSummary,
  type PairwiseBalance,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getAllTransactions(): Promise<TransactionWithUser[]>;
  clearTransactions(): Promise<void>;
  
  // Balance calculation
  getBalanceSummary(): Promise<BalanceSummary>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private transactions: Map<string, Transaction>;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    
    // Initialize with two default users for backward compatibility
    const user1: User = {
      id: randomUUID(),
      name: "User 1",
      createdAt: new Date(),
    };
    const user2: User = {
      id: randomUUID(),
      name: "User 2",
      createdAt: new Date(),
    };
    
    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
  }

  // User operations
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort((a, b) => 
      a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async deleteUser(id: string): Promise<void> {
    this.users.delete(id);
    // Also delete any transactions by this user
    const transactionsToDelete: string[] = [];
    for (const [txId, tx] of this.transactions.entries()) {
      if (tx.paidById === id) {
        transactionsToDelete.push(txId);
      }
    }
    transactionsToDelete.forEach(txId => this.transactions.delete(txId));
  }

  // Transaction operations
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      amount: insertTransaction.amount.toString(),
      id,
      date: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getAllTransactions(): Promise<TransactionWithUser[]> {
    const txs = Array.from(this.transactions.values());
    const users = await this.getAllUsers();
    const userMap = new Map(Array.from(users.map(u => [u.id, u] as [string, User])));
    
    const txsWithUser: TransactionWithUser[] = txs.map(tx => ({
      ...tx,
      paidByName: userMap.get(tx.paidById)?.name || "Unknown User",
    }));
    
    // Sort by date descending (most recent first)
    return txsWithUser.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async clearTransactions(): Promise<void> {
    this.transactions.clear();
  }

  // Balance calculation
  async getBalanceSummary(): Promise<BalanceSummary> {
    const users = await this.getAllUsers();
    const transactions = await this.getAllTransactions();
    
    // Calculate pairwise balances
    // For each transaction, the payer is owed (amount / numUsers) by each other user
    const numUsers = users.length;
    
    if (numUsers === 0) {
      return {
        users: [],
        balances: [],
        totalTransactions: 0,
      };
    }
    
    // Create a map to track balances: key is "fromId-toId", value is amount owed
    const balanceMap = new Map<string, number>();
    
    for (const tx of transactions) {
      const amount = parseFloat(tx.amount);
      const splitAmount = amount / numUsers; // Each person's share
      
      // The payer is owed splitAmount by each other user
      for (const user of users) {
        if (user.id !== tx.paidById) {
          const key = `${user.id}-${tx.paidById}`;
          const current = balanceMap.get(key) || 0;
          balanceMap.set(key, current + splitAmount);
        }
      }
    }
    
    // Convert balance map to pairwise balances, netting them out
    const pairwiseBalances: PairwiseBalance[] = [];
    const processed = new Set<string>();
    
    for (const user1 of users) {
      for (const user2 of users) {
        if (user1.id >= user2.id) continue; // Only process each pair once
        
        const key1 = `${user1.id}-${user2.id}`;
        const key2 = `${user2.id}-${user1.id}`;
        
        if (processed.has(key1) || processed.has(key2)) continue;
        processed.add(key1);
        processed.add(key2);
        
        const user1OwesUser2 = balanceMap.get(key1) || 0;
        const user2OwesUser1 = balanceMap.get(key2) || 0;
        
        const netBalance = user1OwesUser2 - user2OwesUser1;
        
        if (Math.abs(netBalance) >= 0.01) { // Only show non-zero balances
          if (netBalance > 0) {
            pairwiseBalances.push({
              fromUserId: user1.id,
              fromUserName: user1.name,
              toUserId: user2.id,
              toUserName: user2.name,
              amount: parseFloat(netBalance.toFixed(2)),
            });
          } else {
            pairwiseBalances.push({
              fromUserId: user2.id,
              fromUserName: user2.name,
              toUserId: user1.id,
              toUserName: user1.name,
              amount: parseFloat(Math.abs(netBalance).toFixed(2)),
            });
          }
        }
      }
    }
    
    return {
      users,
      balances: pairwiseBalances,
      totalTransactions: transactions.length,
    };
  }
}

export const storage = new MemStorage();
