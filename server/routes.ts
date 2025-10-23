import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertUserConfigSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current balance
  app.get("/api/balance", async (_req, res) => {
    try {
      const balance = await storage.getBalance();
      res.json(balance);
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to get balance",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Add new expense
  app.post("/api/expense", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      const balance = await storage.getBalance();
      
      res.json({
        success: true,
        transaction,
        balance: balance.netBalance,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation error",
          details: error.errors,
        });
      } else {
        res.status(500).json({
          error: "Failed to add expense",
          message: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
  });

  // Get all transactions
  app.get("/api/transactions", async (_req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({
        error: "Failed to get transactions",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Settle all balances (clear transactions)
  app.post("/api/settle", async (_req, res) => {
    try {
      await storage.clearTransactions();
      const balance = await storage.getBalance();
      
      res.json({
        success: true,
        message: "All balances settled",
        balance: balance.netBalance,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to settle balances",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get user configuration
  app.get("/api/users", async (_req, res) => {
    try {
      const config = await storage.getUserConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({
        error: "Failed to get user configuration",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update user configuration
  app.put("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserConfigSchema.parse(req.body);
      const config = await storage.updateUserConfig(validatedData);
      
      res.json({
        success: true,
        config,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation error",
          details: error.errors,
        });
      } else {
        res.status(500).json({
          error: "Failed to update user configuration",
          message: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
