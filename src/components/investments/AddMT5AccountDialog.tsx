import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddMT5AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddMT5AccountDialog = ({ open, onOpenChange, onSuccess }: AddMT5AccountDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    mt5_login: '',
    mt5_password: '',
    mt5_server: '',
    initial_investment: '',
    rebate_rate_per_lot: '',
    is_cent_account: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('connect-mt5-account', {
        body: {
          nickname: formData.nickname,
          mt5_login: formData.mt5_login,
          mt5_password: formData.mt5_password,
          mt5_server: formData.mt5_server,
          initial_investment: parseFloat(formData.initial_investment) || 0,
          rebate_rate_per_lot: parseFloat(formData.rebate_rate_per_lot) || 0,
          is_cent_account: formData.is_cent_account,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success('Account added! It may take 2-3 minutes to connect.');
      setFormData({
        nickname: '',
        mt5_login: '',
        mt5_password: '',
        mt5_server: '',
        initial_investment: '',
        rebate_rate_per_lot: '',
        is_cent_account: false,
      });
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error adding account:', error);
      toast.error(error.message || 'Failed to add account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add MT5 Account</DialogTitle>
          <DialogDescription>
            Connect your MT5 account using investor password (read-only access)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              placeholder="e.g., EA Gold Scalper"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mt5_login">MT5 Login</Label>
              <Input
                id="mt5_login"
                placeholder="12345678"
                value={formData.mt5_login}
                onChange={(e) => setFormData({ ...formData, mt5_login: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mt5_server">Server</Label>
              <Input
                id="mt5_server"
                placeholder="XMGlobal-MT5"
                value={formData.mt5_server}
                onChange={(e) => setFormData({ ...formData, mt5_server: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mt5_password">Investor Password</Label>
            <Input
              id="mt5_password"
              type="password"
              placeholder="Read-only password"
              value={formData.mt5_password}
              onChange={(e) => setFormData({ ...formData, mt5_password: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              Use your investor (read-only) password, not your master password
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initial_investment">Initial Investment (USD)</Label>
              <Input
                id="initial_investment"
                type="number"
                step="0.01"
                placeholder="1000"
                value={formData.initial_investment}
                onChange={(e) => setFormData({ ...formData, initial_investment: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rebate_rate_per_lot">Rebate Rate ($/lot)</Label>
              <Input
                id="rebate_rate_per_lot"
                type="number"
                step="0.01"
                placeholder="3.00"
                value={formData.rebate_rate_per_lot}
                onChange={(e) => setFormData({ ...formData, rebate_rate_per_lot: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_cent_account"
              checked={formData.is_cent_account}
              onCheckedChange={(checked) => setFormData({ ...formData, is_cent_account: checked as boolean })}
            />
            <Label htmlFor="is_cent_account" className="text-sm font-normal">
              This is a cent account (values will be converted to USD)
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-hero" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? 'Connecting...' : 'Add Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMT5AccountDialog;