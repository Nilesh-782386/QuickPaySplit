import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import type { Balance } from "@shared/schema";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
  balance?: Balance;
  isLoading: boolean;
}

export function BalanceCard({ balance, isLoading }: BalanceCardProps) {
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

  if (!balance) {
    return null;
  }

  const isPositive = balance.netBalance > 0;
  const isZero = balance.netBalance === 0;
  const absBalance = Math.abs(balance.netBalance);

  // Determine color scheme
  const colorClass = isZero
    ? "bg-muted/50 border-border"
    : isPositive
    ? "bg-chart-2/10 border-chart-2/20"
    : "bg-chart-3/10 border-chart-3/20";

  const iconColorClass = isZero
    ? "text-muted-foreground"
    : isPositive
    ? "text-chart-2"
    : "text-chart-3";

  const textColorClass = isZero
    ? "text-muted-foreground"
    : isPositive
    ? "text-chart-2"
    : "text-chart-3";

  const Icon = isZero ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className={cn("shadow-lg border-2 transition-colors duration-300", colorClass)} data-testid="card-balance">
      <CardContent className="p-8">
        <div className="text-center space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            <div className={cn("h-16 w-16 rounded-full flex items-center justify-center", 
              isZero ? "bg-muted" : isPositive ? "bg-chart-2/20" : "bg-chart-3/20"
            )}>
              <Icon className={cn("h-8 w-8", iconColorClass)} />
            </div>
          </div>

          {/* Balance Status */}
          {isZero ? (
            <>
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">All Settled!</h2>
                <p className="text-muted-foreground text-sm">
                  No outstanding balance between {balance.user1Name} and {balance.user2Name}
                </p>
              </div>
              <div className="pt-2">
                <span className="text-5xl font-mono font-bold text-muted-foreground">₹0</span>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-foreground">
                  <span className="text-xl font-semibold">
                    {isPositive ? balance.user2Name : balance.user1Name}
                  </span>
                  <ArrowRight className={cn("h-5 w-5", iconColorClass)} />
                  <span className="text-xl font-semibold">
                    {isPositive ? balance.user1Name : balance.user2Name}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">owes</p>
              </div>
              <div>
                <span className={cn("text-5xl font-mono font-bold", textColorClass)} data-testid="text-balance-amount">
                  ₹{absBalance.toFixed(2)}
                </span>
              </div>
            </>
          )}

          {/* Transaction Count */}
          {balance.totalTransactions > 0 && (
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                {balance.totalTransactions} {balance.totalTransactions === 1 ? "transaction" : "transactions"} recorded
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
