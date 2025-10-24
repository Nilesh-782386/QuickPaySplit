import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, RefreshCcw, TrendingUp, Wallet, BarChart3 } from "lucide-react";
import { AddExpenseForm } from "@/components/add-expense-form";
import { TransactionList } from "@/components/transaction-list";
import { BalanceCard } from "@/components/balance-card";
import { UserManagementDialog } from "@/components/user-management-dialog";
import { SettleDialog } from "@/components/settle-dialog";
import { DeleteHistoryDialog } from "@/components/delete-history-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import type { BalanceSummary, TransactionWithUser, User } from "@shared/schema";

// Helper functions for real data calculation
function getRealCategoryBreakdown(transactions: TransactionWithUser[]) {
  if (transactions.length === 0) return [];
  
  const categoryMap = new Map<string, number>();
  
  transactions.forEach(tx => {
    const category = tx.description;
    const amount = parseFloat(tx.amount);
    categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
  });
  
  const total = Array.from(categoryMap.values()).reduce((sum, amount) => sum + amount, 0);
  
  return Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category,
    amount,
    percentage: total > 0 ? (amount / total) * 100 : 0,
    emoji: getCategoryEmoji(category)
  })).sort((a, b) => b.amount - a.amount);
}

function getRealMonthlyTrend(transactions: TransactionWithUser[]) {
  if (transactions.length === 0) return [];
  
  const monthlyMap = new Map<string, number>();
  
  transactions.forEach(tx => {
    const date = new Date(tx.date);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
    const amount = parseFloat(tx.amount);
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + amount);
  });
  
  return Array.from(monthlyMap.entries()).map(([month, amount]) => ({
    month,
    amount
  })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
}

function getRealTopSpender(transactions: TransactionWithUser[], users: User[]) {
  if (transactions.length === 0 || users.length === 0) {
    return { name: "No data", amount: 0 };
  }
  
  const userSpending = new Map<string, number>();
  
  transactions.forEach(tx => {
    const amount = parseFloat(tx.amount);
    userSpending.set(tx.paidById, (userSpending.get(tx.paidById) || 0) + amount);
  });
  
  let topSpender = { name: "No data", amount: 0 };
  
  userSpending.forEach((amount, userId) => {
    const user = users.find(u => u.id === userId);
    if (user && amount > topSpender.amount) {
      topSpender = { name: user.name, amount };
    }
  });
  
  return topSpender;
}

function getCategoryEmoji(category: string): string {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('food') || lowerCategory.includes('dining')) return '🍽️';
  if (lowerCategory.includes('transport') || lowerCategory.includes('travel')) return '🚗';
  if (lowerCategory.includes('movie') || lowerCategory.includes('entertainment')) return '🎬';
  if (lowerCategory.includes('mess')) return '🏠';
  return '📦';
}

export default function Home() {
  const [usersDialogOpen, setUsersDialogOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [deleteHistoryOpen, setDeleteHistoryOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const { data: balanceSummary, isLoading: balanceLoading } = useQuery<BalanceSummary>({
    queryKey: ["/api/balance"],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<TransactionWithUser[]>({
    queryKey: ["/api/transactions"],
  });

  const hasBalances = balanceSummary && balanceSummary.balances.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-card-border">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">QuickPay</h1>
              <p className="text-xs text-muted-foreground">Split expenses with your group</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAnalytics(!showAnalytics)}
              title={showAnalytics ? "Hide Analytics" : "Show Analytics"}
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setUsersDialogOpen(true)}
              data-testid="button-users"
            >
              <Users className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Analytics Dashboard */}
        {showAnalytics && (
          <div className="mb-8">
            <AnalyticsDashboard 
              data={{
                totalExpenses: transactions?.reduce((sum, tx) => sum + parseFloat(tx.amount), 0) || 0,
                totalUsers: balanceSummary?.users.length || 0,
                averageExpense: transactions?.length ? (transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0) / transactions.length) : 0,
                largestExpense: transactions?.reduce((max, tx) => Math.max(max, parseFloat(tx.amount)), 0) || 0,
                categoryBreakdown: getRealCategoryBreakdown(transactions || []),
                monthlyTrend: getRealMonthlyTrend(transactions || []),
                topSpender: getRealTopSpender(transactions || [], balanceSummary?.users || []),
                recentActivity: transactions?.slice(0, 4).map(tx => ({
                  type: "expense",
                  description: tx.description,
                  amount: parseFloat(tx.amount),
                  date: tx.date.toString()
                })) || []
              }}
            />
          </div>
        )}
        {/* Balance Display */}
        <BalanceCard summary={balanceSummary} isLoading={balanceLoading} />

        {/* Add Expense Form */}
        <Card data-testid="card-add-expense">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              💸 Add Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AddExpenseForm users={balanceSummary?.users} />
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card data-testid="card-transactions">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <RefreshCcw className="h-5 w-5 text-primary" />
                📋 Recent Transactions
              </span>
              <div className="flex gap-2">
                {balanceSummary && balanceSummary.totalTransactions > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteHistoryOpen(true)}
                    data-testid="button-delete-history"
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    🗑️ Delete All
                  </Button>
                )}
                {hasBalances && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setSettleOpen(true)}
                    data-testid="button-settle"
                  >
                    💰 Settle Up
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionList
              transactions={transactions}
              isLoading={transactionsLoading}
            />
          </CardContent>
        </Card>
      </main>

      {/* Dialogs */}
      <UserManagementDialog open={usersDialogOpen} onOpenChange={setUsersDialogOpen} />
      <SettleDialog open={settleOpen} onOpenChange={setSettleOpen} />
      <DeleteHistoryDialog 
        open={deleteHistoryOpen} 
        onOpenChange={setDeleteHistoryOpen} 
        summary={balanceSummary}
      />
    </div>
  );
}
