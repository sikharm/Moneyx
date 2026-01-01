import { useState, useEffect } from "react";
import { Search, User, Link as LinkIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
}

interface LinkUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  licenseId: string;
  currentUserId?: string | null;
  onSuccess: () => void;
}

export function LinkUserDialog({ 
  open, 
  onOpenChange, 
  licenseId, 
  currentUserId,
  onSuccess 
}: LinkUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(currentUserId || null);

  useEffect(() => {
    if (open) {
      setSelectedUserId(currentUserId || null);
      setSearchTerm("");
      loadUsers();
    }
  }, [open, currentUserId]);

  const loadUsers = async (search?: string) => {
    try {
      setSearching(true);
      let query = supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('email', { ascending: true })
        .limit(50);

      if (search && search.trim()) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    loadUsers(value);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('license_subscriptions')
        .update({ user_id: selectedUserId })
        .eq('id', licenseId);

      if (error) throw error;

      toast.success(selectedUserId ? "License linked to user" : "License unlinked from user");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to update link: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Link License to User
          </DialogTitle>
          <DialogDescription>
            Select a registered user to link this license to, or unlink if already linked.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[250px] rounded-md border p-2">
            {searching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <User className="h-8 w-8 mb-2" />
                <p className="text-sm">No registered users found</p>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Unlink option */}
                <button
                  type="button"
                  onClick={() => setSelectedUserId(null)}
                  className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors ${
                    selectedUserId === null 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Not Linked</p>
                    <p className="text-xs opacity-70">Remove user link</p>
                  </div>
                </button>

                {/* User list */}
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUserId(user.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors ${
                      selectedUserId === user.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                      <p className="text-xs opacity-70 truncate">
                        {user.full_name || 'No name'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
