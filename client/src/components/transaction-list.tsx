import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { TransactionWithUser } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Receipt } from "lucide-react";

interface TransactionListProps {
  transactions?: TransactionWithUser[];
  isLoading: boolean;
}

export function TransactionList({ transactions, isLoading }: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3" data-testid="transactions-loading">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4 border border-border rounded-lg">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12" data-testid="transactions-empty">
        <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Receipt className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No transactions yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Start by adding an expense above. All transactions will appear here.
        </p>
      </div>
    );
  }

  const colors = ["primary", "chart-2", "chart-3", "chart-1", "chart-4"];

  return (
    <div className="space-y-3" data-testid="transactions-list">
      {transactions.map((transaction, index) => {
        const amount = parseFloat(transaction.amount);
        const colorClass = colors[index % colors.length];

        return (
          <div
            key={transaction.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg border-l-4 bg-card hover-elevate transition-all duration-200",
              `border-l-${colorClass}`
            )}
            data-testid={`transaction-${transaction.id}`}
          >
            {/* Icon */}
            <div className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
              `bg-${colorClass}/10 text-${colorClass}`
            )}>
              {transaction.paidByName.charAt(0).toUpperCase()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-foreground" data-testid={`text-payer-${transaction.id}`}>
                  {transaction.paidByName}
                </span>
                <span className="text-muted-foreground text-sm">paid</span>
              </div>
              <p className="text-sm text-muted-foreground truncate" data-testid={`text-description-${transaction.id}`}>
                {transaction.description}
              </p>
              <p className="text-xs text-muted-foreground mt-1" data-testid={`text-date-${transaction.id}`}>
                {format(new Date(transaction.date), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>

            {/* Amount */}
            <div className="text-right flex-shrink-0">
              <Badge
                variant="secondary"
                className="font-mono text-base px-3 py-1"
                data-testid={`badge-amount-${transaction.id}`}
              >
                ₹{amount.toFixed(2)}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
