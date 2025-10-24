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
import { Plus, Loader2, Car, Utensils, Film, Plane, Home, ShoppingCart, Coffee, Gamepad2, MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";

interface AddExpenseFormProps {
  users?: User[];
}

// Predefined expense categories with icons and emojis
const expenseCategories = [
  { id: "food", label: "Food & Dining", icon: Utensils, emoji: "🍽️", color: "bg-orange-100 text-orange-600" },
  { id: "travel", label: "Travel", icon: Car, emoji: "🚗", color: "bg-blue-100 text-blue-600" },
  { id: "mess", label: "Mess/Hostel", icon: Home, emoji: "🏠", color: "bg-green-100 text-green-600" },
  { id: "movie", label: "Entertainment", icon: Film, emoji: "🎬", color: "bg-purple-100 text-purple-600" },
  { id: "shopping", label: "Shopping", icon: ShoppingCart, emoji: "🛒", color: "bg-pink-100 text-pink-600" },
  { id: "coffee", label: "Coffee & Drinks", icon: Coffee, emoji: "☕", color: "bg-amber-100 text-amber-600" },
  { id: "gaming", label: "Gaming", icon: Gamepad2, emoji: "🎮", color: "bg-indigo-100 text-indigo-600" },
  { id: "other", label: "Other", icon: MoreHorizontal, emoji: "💡", color: "bg-gray-100 text-gray-600" },
];

export function AddExpenseForm({ users }: AddExpenseFormProps) {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("food");
  const [splitMode, setSplitMode] = useState<"divide" | "full">("divide");

  const form = useForm<InsertTransaction>({
    resolver: zodResolver(insertTransactionSchema),
    defaultValues: {
      paidById: users?.[0]?.id || "",
      amount: 0,
      description: "Food & Dining", // Default category
      splitMode: "divide",
      owedById: undefined,
    },
    mode: "onChange", // Enable real-time validation
  });

  // Set the first user as default when users are loaded
  useEffect(() => {
    if (users && users.length > 0) {
      const currentValue = form.getValues("paidById");
      if (!currentValue) {
        form.setValue("paidById", users[0].id);
      }
    }
  }, [users, form]);

  const addExpenseMutation = useMutation({
    mutationFn: async (data: InsertTransaction) => {
      return await apiRequest("POST", "/api/expense", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      form.reset({
        paidById: users?.[0]?.id || "",
        amount: 0,
        description: "",
        splitMode: "divide",
        owedById: undefined,
      });
      setSelectedCategory("food");
      setSplitMode("divide");
      const selectedCategoryData = expenseCategories.find(cat => cat.id === selectedCategory);
      toast({
        title: "💰 Expense Added!",
        description: `${selectedCategoryData?.emoji} ${selectedCategoryData?.label} expense recorded successfully!`,
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
    const selectedCategoryData = expenseCategories.find(cat => cat.id === selectedCategory);
    const description = selectedCategoryData?.label || "Other";
    
    addExpenseMutation.mutate({
      ...data,
      description,
      splitMode,
      owedById: splitMode === "full" ? data.owedById : undefined,
    });
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
              <Select onValueChange={field.onChange} value={field.value}>
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

        <FormItem>
          <FormLabel>Split Mode</FormLabel>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSplitMode("divide")}
              className={`
                flex items-center gap-2 p-3 rounded-lg border-2 transition-all duration-300 transform
                ${splitMode === "divide"
                  ? 'border-primary bg-primary/10 text-primary shadow-lg scale-105'
                  : 'border-border bg-card hover:bg-muted/50 hover:scale-102'
                }
              `}
              data-testid="split-mode-divide"
            >
              <div className="text-lg">🔀</div>
              <div className="text-left">
                <div className="font-medium">Divide</div>
                <div className="text-xs text-muted-foreground">Split equally among all</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSplitMode("full")}
              className={`
                flex items-center gap-2 p-3 rounded-lg border-2 transition-all duration-300 transform
                ${splitMode === "full"
                  ? 'border-primary bg-primary/10 text-primary shadow-lg scale-105'
                  : 'border-border bg-card hover:bg-muted/50 hover:scale-102'
                }
              `}
              data-testid="split-mode-full"
            >
              <div className="text-lg">💸</div>
              <div className="text-left">
                <div className="font-medium">Full</div>
                <div className="text-xs text-muted-foreground">One person owes full amount</div>
              </div>
            </button>
          </div>
        </FormItem>

        {splitMode === "full" && (
          <FormField
            control={form.control}
            name="owedById"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Who owes the money?</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-owedby">
                      <SelectValue placeholder="Select who owes the money" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users.filter(user => user.id !== form.getValues("paidById")).map((user) => (
                      <SelectItem key={user.id} value={user.id} data-testid={`option-owed-${user.id}`}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormItem>
          <FormLabel>Category</FormLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {expenseCategories.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-300 transform
                    ${isSelected 
                      ? `border-primary ${category.color} shadow-lg scale-105` 
                      : 'border-border bg-card hover:bg-muted/50 hover:scale-102'
                    }
                  `}
                  data-testid={`category-${category.id}`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-lg">{category.emoji}</span>
                    <IconComponent className={`h-4 w-4 ${isSelected ? category.color.split(' ')[1] : 'text-muted-foreground'}`} />
                  </div>
                  <span className={`text-xs font-medium text-center ${isSelected ? category.color.split(' ')[1] : 'text-muted-foreground'}`}>
                    {category.label}
                  </span>
                </button>
              );
            })}
          </div>
        </FormItem>

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
