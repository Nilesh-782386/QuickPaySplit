import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, RefreshCcw, TrendingUp, Wallet } from "lucide-react";
import { AddExpenseForm } from "@/components/add-expense-form";
import { TransactionList } from "@/components/transaction-list";
import { BalanceCard } from "@/components/balance-card";
import { SettingsDialog } from "@/components/settings-dialog";
import { SettleDialog } from "@/components/settle-dialog";
import type { Balance, Transaction } from "@shared/schema";

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);

  const { data: balance, isLoading: balanceLoading } = useQuery<Balance>({
    queryKey: ["/api/balance"],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

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
              <p className="text-xs text-muted-foreground">Split expenses easily</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            data-testid="button-settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Balance Display */}
        <BalanceCard balance={balance} isLoading={balanceLoading} />

        {/* Add Expense Form */}
        <Card data-testid="card-add-expense">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Add Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AddExpenseForm userNames={{ user1: balance?.user1Name, user2: balance?.user2Name }} />
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
              {balance && balance.netBalance !== 0 && (
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
              userNames={{ user1: balance?.user1Name, user2: balance?.user2Name }}
            />
          </CardContent>
        </Card>
      </main>

      {/* Dialogs */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <SettleDialog open={settleOpen} onOpenChange={setSettleOpen} />
    </div>
  );
}
