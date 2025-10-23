import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2 } from "lucide-react";
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
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">All Settled!</h2>
              <p className="text-muted-foreground text-sm">
                No outstanding balances in the group
              </p>
            </div>
            <div className="pt-2">
              <span className="text-5xl font-mono font-bold text-muted-foreground">₹0</span>
            </div>
            {summary.totalTransactions > 0 && (
              <div className="pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  {summary.totalTransactions} {summary.totalTransactions === 1 ? "transaction" : "transactions"} recorded
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center pb-2">
              <h2 className="text-2xl font-bold text-foreground">Outstanding Balances</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {summary.balances.length} {summary.balances.length === 1 ? "debt" : "debts"} to settle
              </p>
            </div>
            
            <div className="space-y-3">
              {summary.balances.map((balance, index) => (
                <div
                  key={`${balance.fromUserId}-${balance.toUserId}`}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border-l-4",
                    index % 2 === 0 ? "border-l-chart-2 bg-chart-2/5" : "border-l-chart-3 bg-chart-3/5"
                  )}
                  data-testid={`balance-${balance.fromUserId}-${balance.toUserId}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                      index % 2 === 0 ? "bg-chart-2/20 text-chart-2" : "bg-chart-3/20 text-chart-3"
                    )}>
                      {balance.fromUserName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-semibold text-foreground truncate">
                        {balance.fromUserName}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-semibold text-foreground truncate">
                        {balance.toUserName}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="font-mono text-base px-3 py-1 flex-shrink-0"
                    data-testid={`amount-${balance.fromUserId}-${balance.toUserId}`}
                  >
                    ₹{balance.amount.toFixed(2)}
                  </Badge>
                </div>
              ))}
            </div>

            {summary.totalTransactions > 0 && (
              <div className="pt-4 border-t border-border/50 text-center">
                <p className="text-xs text-muted-foreground">
                  Based on {summary.totalTransactions} {summary.totalTransactions === 1 ? "transaction" : "transactions"}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
