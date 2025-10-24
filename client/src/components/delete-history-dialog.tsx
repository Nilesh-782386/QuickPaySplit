import { useMutation } from "@tanstack/react-query";
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
import { Loader2, Trash2 } from "lucide-react";
import { PasswordDialog } from "@/components/password-dialog";
import { useState } from "react";
import type { BalanceSummary } from "@shared/schema";

interface DeleteHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary?: BalanceSummary;
}

export function DeleteHistoryDialog({ open, onOpenChange, summary }: DeleteHistoryDialogProps) {
  const { toast } = useToast();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const deleteHistoryMutation = useMutation({
    mutationFn: async (password: string) => {
      return await apiRequest("POST", "/api/delete-history", { password });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "🗑️ All History Deleted!",
        description: "All transactions and balances have been permanently removed.",
      });
      onOpenChange(false);
      setPasswordDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete history. Please try again.",
      });
      setPasswordDialogOpen(false);
    },
  });

  const handleDeleteHistory = () => {
    // Close the first confirmation dialog and show password dialog
    onOpenChange(false);
    setPasswordDialogOpen(true);
  };

  const handlePasswordConfirm = (password: string) => {
    deleteHistoryMutation.mutate(password);
  };

  const handlePasswordDialogClose = (open: boolean) => {
    setPasswordDialogOpen(open);
    if (!open) {
      // If password dialog is closed without confirming, reopen the main dialog
      onOpenChange(true);
    }
  };

  const hasTransactions = summary && summary.totalTransactions > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid="dialog-delete-history">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            🗑️ Delete All History
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 pt-2">
            <p>
              ⚠️ This will permanently delete ALL transaction history and reset all balances to zero.
            </p>
            {hasTransactions && (
              <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                <p className="text-sm text-foreground font-medium">
                  {summary.totalTransactions} {summary.totalTransactions === 1 ? "transaction" : "transactions"} will be deleted
                </p>
                {summary.balances.length > 0 && (
                  <p className="text-sm text-foreground font-medium">
                    {summary.balances.length} {summary.balances.length === 1 ? "balance" : "balances"} will be cleared
                  </p>
                )}
              </div>
            )}
            <p className="text-sm font-semibold text-destructive">
              ⚠️ This action cannot be undone and will reset the entire app!
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteHistory}
            disabled={deleteHistoryMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="button-confirm-delete"
          >
            {deleteHistoryMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All History
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>

      {/* Password Dialog */}
      <PasswordDialog
        open={passwordDialogOpen}
        onOpenChange={handlePasswordDialogClose}
        onPasswordConfirm={handlePasswordConfirm}
        title="Confirm Delete All History"
        description="🔒 Enter password to confirm permanent deletion of all transaction history."
        isLoading={deleteHistoryMutation.isPending}
      />
    </AlertDialog>
  );
}
