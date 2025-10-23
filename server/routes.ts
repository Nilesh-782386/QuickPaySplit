import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all users
  app.get("/api/users", async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({
        error: "Failed to get users",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create new user
  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      
      res.json({
        success: true,
        user,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation error",
          details: error.errors,
        });
      } else {
        res.status(500).json({
          error: "Failed to create user",
          message: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
  });

  // Delete user
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      
      res.json({
        success: true,
        message: "User deleted",
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to delete user",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get balance summary
  app.get("/api/balance", async (_req, res) => {
    try {
      const summary = await storage.getBalanceSummary();
      res.json(summary);
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
      const summary = await storage.getBalanceSummary();
      
      res.json({
        success: true,
        transaction,
        summary,
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
      const summary = await storage.getBalanceSummary();
      
      res.json({
        success: true,
        message: "All balances settled",
        summary,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to settle balances",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
