import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MT5Account {
  id: string;
  nickname: string;
  rebate_rate_per_lot: number;
}

interface EditRebateDialogProps {
  account: MT5Account | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditRebateDialog = ({ account, onOpenChange, onSuccess }: EditRebateDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [rebateRate, setRebateRate] = useState('');

  useEffect(() => {
    if (account) {
      setRebateRate(account.rebate_rate_per_lot.toString());
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_mt5_accounts')
        .update({ rebate_rate_per_lot: parseFloat(rebateRate) || 0 })
        .eq('id', account.id);

      if (error) throw error;

      toast.success('Rebate rate updated');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error updating rebate:', error);
      toast.error(error.message || 'Failed to update rebate rate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!account} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Rebate Rate</DialogTitle>
          <DialogDescription>
            Update the rebate rate for {account?.nickname}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rebate_rate">Rebate Rate ($ per lot)</Label>
            <Input
              id="rebate_rate"
              type="number"
              step="0.01"
              placeholder="3.00"
              value={rebateRate}
              onChange={(e) => setRebateRate(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              This rate will be used to auto-calculate your rebate based on lots traded
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-hero" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRebateDialog;