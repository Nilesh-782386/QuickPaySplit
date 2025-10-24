import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { insertUserSchema, type InsertUser, type User } from "@shared/schema";
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
import { Loader2, UserPlus, Trash2, Users as UsersIcon } from "lucide-react";
import { PasswordDialog } from "@/components/password-dialog";

interface UserManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserManagementDialog({ open, onOpenChange }: UserManagementDialogProps) {
  const { toast } = useToast();
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [pendingUserData, setPendingUserData] = useState<InsertUser | null>(null);

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: open,
  });

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      name: "",
    },
  });

  const addUserMutation = useMutation({
    mutationFn: async (data: { user: InsertUser; password: string }) => {
      return await apiRequest("POST", "/api/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/balance"] });
      form.reset();
      setIsAddingUser(false);
      setPasswordDialogOpen(false);
      setPendingUserData(null);
      toast({
        title: "👤 User Added!",
        description: "New member has been added to the group.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add user. Please try again.",
      });
      setPasswordDialogOpen(false);
      setPendingUserData(null);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("DELETE", `/api/users/${userId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "User removed",
        description: "Member has been removed from the group.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove user. Please try again.",
      });
    },
  });

  const onSubmit = (data: InsertUser) => {
    // Store the user data and show password dialog
    setPendingUserData(data);
    setPasswordDialogOpen(true);
  };

  const handlePasswordConfirm = (password: string) => {
    if (pendingUserData) {
      addUserMutation.mutate({ user: pendingUserData, password });
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (users && users.length <= 2) {
      toast({
        variant: "destructive",
        title: "Cannot remove user",
        description: "You need at least 2 members in the group.",
      });
      return;
    }
    deleteUserMutation.mutate(userId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-users">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-primary" />
            👥 Manage Group Members
          </DialogTitle>
          <DialogDescription>
            ➕ Add or remove people from your expense group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Current Users */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">👤 Current Members ({users?.length || 0})</h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {users?.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                  data-testid={`user-${user.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-foreground">{user.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={deleteUserMutation.isPending || (users.length <= 2)}
                    data-testid={`button-delete-${user.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Add User Form */}
          {!isAddingUser ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsAddingUser(true)}
              data-testid="button-show-add-user"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          ) : (
            <div className="border border-border rounded-lg p-4 space-y-4">
              <h4 className="text-sm font-medium text-foreground">Add New Member</h4>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., John Doe"
                            maxLength={50}
                            data-testid="input-user-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setIsAddingUser(false);
                        form.reset();
                      }}
                      data-testid="button-cancel-add-user"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={addUserMutation.isPending}
                      data-testid="button-submit-add-user"
                    >
                      {addUserMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Member"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Password Dialog */}
      <PasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        onPasswordConfirm={handlePasswordConfirm}
        title="Confirm Team Member"
        description={`🔒 Enter password to confirm adding "${pendingUserData?.name}" to the group.`}
        isLoading={addUserMutation.isPending}
      />
    </Dialog>
  );
}
