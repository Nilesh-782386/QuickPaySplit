import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { TransactionWithUser } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Receipt, TrendingUp, Users, DollarSign, Clock, ArrowRight } from "lucide-react";

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
      <div className="text-center py-16" data-testid="transactions-empty">
        <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center mb-6 shadow-lg">
          <Receipt className="h-10 w-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-3">No transactions yet</h3>
        <p className="text-base text-muted-foreground max-w-md mx-auto">
          Start by adding an expense above.
        </p>
      </div>
    );
  }

  const colors = ["primary", "chart-2", "chart-3", "chart-1", "chart-4"];

  // Function to get emoji for transaction description
  const getTransactionEmoji = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('food') || desc.includes('dining')) return '🍽️';
    if (desc.includes('travel')) return '🚗';
    if (desc.includes('mess') || desc.includes('hostel')) return '🏠';
    if (desc.includes('entertainment') || desc.includes('movie')) return '🎬';
    if (desc.includes('shopping')) return '🛒';
    if (desc.includes('coffee') || desc.includes('drinks')) return '☕';
    if (desc.includes('gaming')) return '🎮';
    return '💡';
  };

  return (
    <div className="space-y-3" data-testid="transactions-list">
      {transactions.map((transaction, index) => {
        const amount = parseFloat(transaction.amount);
        const colorClass = colors[index % colors.length];

        return (
          <div
            key={transaction.id}
            className={cn(
              "group flex items-center gap-5 p-5 rounded-xl border-l-4 bg-gradient-to-r from-card to-card/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300",
              `border-l-${colorClass}`
            )}
            data-testid={`transaction-${transaction.id}`}
          >
            {/* Enhanced Icon */}
            <div className={cn(
              "h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 relative shadow-md transition-transform duration-300 group-hover:scale-110",
              `bg-gradient-to-br from-${colorClass}/20 to-${colorClass}/10 text-${colorClass}`
            )}>
              <span className="text-xl">{getTransactionEmoji(transaction.description)}</span>
              <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-background border-2 border-current flex items-center justify-center text-xs font-bold shadow-sm">
                {transaction.paidByName.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Enhanced Content */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-base" data-testid={`text-payer-${transaction.id}`}>
                    {transaction.paidByName}
                  </span>
                  <span className="text-xs text-green-600 font-medium">paid</span>
                </div>
                
                {transaction.splitMode === "full" && transaction.owedByName && (
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                      → {transaction.owedByName}
                    </Badge>
                  </div>
                )}
                {transaction.splitMode === "divide" && (
                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    <Users className="h-3 w-3 mr-1" />
                    Split
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate" data-testid={`text-description-${transaction.id}`}>
                  {transaction.description}
                </p>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs" data-testid={`text-date-${transaction.id}`}>
                    {format(new Date(transaction.date), "MMM d, h:mm a")}
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Amount */}
            <div className="text-right flex-shrink-0">
              <div className="flex flex-col items-end gap-1">
                <Badge
                  variant="secondary"
                  className="font-mono text-lg px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                  data-testid={`badge-amount-${transaction.id}`}
                >
                  ₹{amount.toFixed(2)}
                </Badge>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
