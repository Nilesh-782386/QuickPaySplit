import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, RefreshCcw, TrendingUp, Wallet } from "lucide-react";
import { AddExpenseForm } from "@/components/add-expense-form";
import { TransactionList } from "@/components/transaction-list";
import { BalanceCard } from "@/components/balance-card";
import { UserManagementDialog } from "@/components/user-management-dialog";
import { SettleDialog } from "@/components/settle-dialog";
import type { BalanceSummary, TransactionWithUser } from "@shared/schema";

export default function Home() {
  const [usersDialogOpen, setUsersDialogOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);

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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setUsersDialogOpen(true)}
            data-testid="button-users"
          >
            <Users className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Balance Display */}
        <BalanceCard summary={balanceSummary} isLoading={balanceLoading} />

        {/* Add Expense Form */}
        <Card data-testid="card-add-expense">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Add Expense
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
                Recent Transactions
              </span>
              {hasBalances && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setSettleOpen(true)}
                  data-testid="button-settle"
                >
                  Settle Up
                </Button>
              )}
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
    </div>
  );
}
