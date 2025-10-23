import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, AlertTriangle } from "lucide-react";
import type { BalanceSummary } from "@shared/schema";

interface SettleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettleDialog({ open, onOpenChange }: SettleDialogProps) {
  const { toast } = useToast();

  const { data: summary } = useQuery<BalanceSummary>({
    queryKey: ["/api/balance"],
  });

  const settleMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/settle", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "All settled!",
        description: "All balances have been cleared and transactions removed.",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to settle balances. Please try again.",
      });
    },
  });

  const handleSettle = () => {
    settleMutation.mutate();
  };

  const hasBalances = summary && summary.balances.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid="dialog-settle">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Settle All Balances
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 pt-2">
            <p>
              This will clear all outstanding balances and remove all transaction history.
            </p>
            {hasBalances && (
              <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                <p className="text-sm text-foreground font-medium">
                  {summary.balances.length} {summary.balances.length === 1 ? "balance" : "balances"} will be cleared
                </p>
                {summary.balances.slice(0, 3).map((balance) => (
                  <div key={`${balance.fromUserId}-${balance.toUserId}`} className="text-xs text-muted-foreground">
                    {balance.fromUserName} → {balance.toUserName}: ₹{balance.amount.toFixed(2)}
                  </div>
                ))}
                {summary.balances.length > 3 && (
                  <p className="text-xs text-muted-foreground italic">
                    ...and {summary.balances.length - 3} more
                  </p>
                )}
              </div>
            )}
            {summary && summary.totalTransactions > 0 && (
              <p className="text-xs text-muted-foreground">
                {summary.totalTransactions} {summary.totalTransactions === 1 ? "transaction" : "transactions"} will be removed
              </p>
            )}
            <p className="text-sm font-semibold">This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-settle">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSettle}
            disabled={settleMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="button-confirm-settle"
          >
            {settleMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Settling...
              </>
            ) : (
              "Settle Up"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
