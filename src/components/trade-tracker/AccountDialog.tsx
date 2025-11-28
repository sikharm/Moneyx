import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Account {
  id: string;
  nickname: string;
  initial_balance: number;
  currency: string;
}

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  account?: Account | null;
}

const currencies = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'Cents', label: 'Cents - USD Cents' },
];

const AccountDialog = ({ open, onOpenChange, onSuccess, account }: AccountDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [currency, setCurrency] = useState('USD');

  const isEditing = !!account;

  useEffect(() => {
    if (open) {
      if (account) {
        setNickname(account.nickname);
        setInitialBalance(account.initial_balance.toString());
        setCurrency(account.currency);
      } else {
        setNickname('');
        setInitialBalance('');
        setCurrency('USD');
      }
    }
  }, [open, account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!nickname.trim()) {
      toast({ title: 'Error', description: 'Please enter an account nickname', variant: 'destructive' });
      return;
    }

    const balance = parseFloat(initialBalance) || 0;

    setLoading(true);

    if (isEditing && account) {
      const { error } = await supabase
        .from('trading_accounts')
        .update({
          nickname: nickname.trim(),
          initial_balance: balance,
          currency,
        })
        .eq('id', account.id);

      if (error) {
        toast({ title: 'Error', description: 'Failed to update account', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Account updated successfully' });
        onSuccess();
        onOpenChange(false);
      }
    } else {
      const { error } = await supabase
        .from('trading_accounts')
        .insert({
          user_id: user.id,
          nickname: nickname.trim(),
          initial_balance: balance,
          currency,
        });

      if (error) {
        toast({ title: 'Error', description: 'Failed to create account', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Account created successfully' });
        onSuccess();
        onOpenChange(false);
      }
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Account' : 'Create New Account'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">Account Nickname</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g., Main Trading Account"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial-balance">Initial Balance</Label>
            <Input
              id="initial-balance"
              type="number"
              step="0.01"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(c => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update Account' : 'Create Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDialog;
