import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

// Simple password system - in production, use proper authentication
const ADMIN_PASSWORD = "admin123"; // Default password

function validatePassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

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
      // Validate password first
      const password = req.body.password;
      if (!password || !validatePassword(password)) {
        return res.status(401).json({
          error: "Invalid password",
          message: "Password is required to add new users"
        });
      }
      
      // Handle both nested and flat structures
      let userToValidate;
      
      // Check if it's nested structure: { user: { name: "..." }, password: "..." }
      if (req.body.user && typeof req.body.user === 'object') {
        userToValidate = req.body.user;
      } 
      // Check if it's flat structure: { name: "...", password: "..." }
      else if (req.body.name) {
        userToValidate = { name: req.body.name };
      } 
      // Invalid structure
      else {
        return res.status(400).json({
          error: "Invalid request structure",
          message: "Request must contain either 'user' object with 'name' or 'name' field directly"
        });
      }
      
      const validatedData = insertUserSchema.parse(userToValidate);
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

  // Delete all history (clear transactions and reset balances)
  app.post("/api/delete-history", async (req, res) => {
    try {
      const { password } = req.body;
      
      // Validate password
      if (!password || !validatePassword(password)) {
        return res.status(401).json({
          error: "Invalid password",
          message: "Password is required to delete all history"
        });
      }
      
      await storage.clearTransactions();
      const summary = await storage.getBalanceSummary();
      
      res.json({
        success: true,
        message: "All history deleted",
        summary,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to delete history",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
