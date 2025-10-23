import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { insertUserConfigSchema, type InsertUserConfig, type UserConfig } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, Users } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { toast } = useToast();

  const { data: userConfig } = useQuery<UserConfig>({
    queryKey: ["/api/users"],
    enabled: open,
  });

  const form = useForm<InsertUserConfig>({
    resolver: zodResolver(insertUserConfigSchema),
    values: {
      user1Name: userConfig?.user1Name || "User 1",
      user2Name: userConfig?.user2Name || "User 2",
    },
  });

  const updateUsersMutation = useMutation({
    mutationFn: async (data: InsertUserConfig) => {
      return await apiRequest("PUT", "/api/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/balance"] });
      toast({
        title: "Settings updated",
        description: "User names have been updated successfully.",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update settings. Please try again.",
      });
    },
  });

  const onSubmit = (data: InsertUserConfig) => {
    updateUsersMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-settings">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            User Settings
          </DialogTitle>
          <DialogDescription>
            Customize the names of the two users splitting expenses.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="user1Name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First User Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Nilesh"
                      maxLength={50}
                      data-testid="input-user1-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="user2Name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Second User Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Yash"
                      maxLength={50}
                      data-testid="input-user2-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-settings"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={updateUsersMutation.isPending}
                data-testid="button-save-settings"
              >
                {updateUsersMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
