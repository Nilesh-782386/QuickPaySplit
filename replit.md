# QuickPay - Expense Splitting App

## Overview
QuickPay is a beautiful, modern expense splitting application designed for two users to track shared expenses and balances in real-time. Built with React, TypeScript, Express, and Tailwind CSS.

## Purpose
Allow two users (e.g., roommates, friends, partners) to:
- Track who paid for what
- See real-time balance calculations
- View complete transaction history
- Settle balances with one click

## Current State
**Phase:** Schema & Frontend Complete ✓
- All data models defined
- Beautiful, responsive UI components built
- Ready for backend implementation

## Project Architecture

### Frontend (React + TypeScript)
- **Pages:**
  - `home.tsx` - Main dashboard with balance, forms, and transactions
  
- **Components:**
  - `balance-card.tsx` - Hero card showing who owes whom with color-coded states
  - `add-expense-form.tsx` - Form to add new expenses with validation
  - `transaction-list.tsx` - Beautiful list of all transactions with timestamps
  - `settings-dialog.tsx` - Dialog to customize user names
  - `settle-dialog.tsx` - Confirmation dialog for settling balances

### Backend (Express + In-Memory Storage)
- **API Routes:**
  - `GET /api/balance` - Get current balance and user info
  - `POST /api/expense` - Add new expense
  - `GET /api/transactions` - Get transaction history
  - `POST /api/settle` - Clear all balances and transactions
  - `GET /api/users` - Get user configuration
  - `PUT /api/users` - Update user names

### Data Schema
- **Transaction:** id, paidBy, amount, description, date
- **UserConfig:** id, user1Name, user2Name
- **Balance:** Computed - shows net balance between users

## Design System
- **Primary Color:** Blue (#3B82F6) - trustworthy, professional
- **Success/Positive:** Green - user2 owes user1
- **Error/Negative:** Red - user1 owes user2
- **Neutral:** Gray - all settled
- **Typography:** System fonts with monospace for numbers
- **Spacing:** Consistent 4-6-8-12-16 scale
- **Components:** Shadcn UI with custom financial styling

## User Flow
1. User opens app → sees current balance
2. User adds expense → selects who paid, amount, description
3. Balance updates automatically
4. User views transaction history → all expenses listed chronologically
5. User can customize names in settings
6. User settles up → all cleared with confirmation

## Recent Changes
- 2025-10-23: Created complete schema and all frontend components
- Design system configured with financial UI patterns
- All components built with loading states and error handling

## Next Steps
- Implement backend API routes and in-memory storage
- Connect frontend to backend with React Query
- Add final polish and testing
