import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, TrendingUp, TrendingDown, Zap, Users, DollarSign } from "lucide-react";
import type { BalanceSummary } from "@shared/schema";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
  summary?: BalanceSummary;
  isLoading: boolean;
}

export function BalanceCard({ summary, isLoading }: BalanceCardProps) {
  if (isLoading) {
    return (
      <Card className="shadow-lg" data-testid="card-balance-loading">
        <CardContent className="p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-12 w-32 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  const hasBalances = summary.balances.length > 0;

  return (
    <Card className={cn(
      "shadow-lg border-2 transition-colors duration-300",
      hasBalances ? "bg-card border-card-border" : "bg-muted/50 border-border"
    )} data-testid="card-balance">
      <CardContent className="p-6">
        {!hasBalances ? (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg animate-pulse">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                🎉 All Settled!
              </h2>
              <p className="text-muted-foreground text-base">
                No outstanding balances
              </p>
            </div>
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950 px-6 py-3 rounded-full border border-green-200 dark:border-green-800">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-3xl font-mono font-bold text-green-600">₹0</span>
              </div>
            </div>
            {summary.totalTransactions > 0 && (
              <div className="pt-6 border-t border-border/50 space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{summary.totalTransactions} transactions</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Outstanding Balances
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {summary.balances.length} debts to settle
              </p>
            </div>
            
            <div className="space-y-4">
              {summary.balances.map((balance, index) => (
                <div
                  key={`${balance.fromUserId}-${balance.toUserId}`}
                  className={cn(
                    "group flex items-center justify-between p-5 rounded-xl border-l-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
                    index % 2 === 0 
                      ? "border-l-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900" 
                      : "border-l-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"
                  )}
                  data-testid={`balance-${balance.fromUserId}-${balance.toUserId}`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-md transition-transform duration-300 group-hover:scale-110",
                      index % 2 === 0 
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white" 
                        : "bg-gradient-to-br from-purple-500 to-purple-600 text-white"
                    )}>
                      {balance.fromUserName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground truncate text-base">
                          {balance.fromUserName}
                        </span>
                        <span className="text-xs text-muted-foreground">owes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="h-1 w-8 bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/30 rounded-full"></div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground truncate text-base">
                          {balance.toUserName}
                        </span>
                        <span className="text-xs text-muted-foreground">receives</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">
                        ₹{balance.amount.toFixed(2)}
                      </div>
                    </div>
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      index % 2 === 0 
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400" 
                        : "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
                    )}>
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {summary.totalTransactions > 0 && (
              <div className="pt-4 border-t border-border/50 text-center">
                <p className="text-xs text-muted-foreground">
                  {summary.totalTransactions} transactions
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
