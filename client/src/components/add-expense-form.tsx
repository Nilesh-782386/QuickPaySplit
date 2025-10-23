import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertTransactionSchema, type InsertTransaction, type User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Loader2 } from "lucide-react";

interface AddExpenseFormProps {
  users?: User[];
}

export function AddExpenseForm({ users }: AddExpenseFormProps) {
  const { toast } = useToast();

  const form = useForm<InsertTransaction>({
    resolver: zodResolver(insertTransactionSchema),
    defaultValues: {
      paidById: users?.[0]?.id || "",
      amount: 0,
      description: "",
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (data: InsertTransaction) => {
      return await apiRequest("POST", "/api/expense", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      form.reset({
        paidById: form.getValues("paidById"),
        amount: 0,
        description: "",
      });
      toast({
        title: "Expense added",
        description: "The transaction has been recorded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add expense. Please try again.",
      });
    },
  });

  const onSubmit = (data: InsertTransaction) => {
    addExpenseMutation.mutate(data);
  };

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Please add group members first to track expenses.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="paidById"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Who paid?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || users[0]?.id}>
                <FormControl>
                  <SelectTrigger data-testid="select-paidby">
                    <SelectValue placeholder="Select who paid" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id} data-testid={`option-${user.id}`}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (₹)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="font-mono text-lg"
                  data-testid="input-amount"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Lunch, Groceries, Movie tickets"
                  maxLength={100}
                  data-testid="input-description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={addExpenseMutation.isPending}
          data-testid="button-add-expense"
        >
          {addExpenseMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
