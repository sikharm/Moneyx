import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Trade {
  id: string;
  account_id: string;
  amount: number;
  trade_date: string;
  notes: string | null;
}

interface TradeEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trade: Trade;
  currency: string;
  onSuccess: () => void;
}

const TradeEditDialog = ({ open, onOpenChange, trade, currency, onSuccess }: TradeEditDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tradeType, setTradeType] = useState<'profit' | 'loss'>('profit');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open && trade) {
      setTradeType(trade.amount >= 0 ? 'profit' : 'loss');
      setAmount(Math.abs(trade.amount).toString());
      setDate(parseISO(trade.trade_date));
      setNotes(trade.notes || '');
    }
  }, [open, trade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ title: 'Error', description: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }

    const finalAmount = tradeType === 'loss' ? -numAmount : numAmount;

    setLoading(true);

    const { error } = await supabase
      .from('trades')
      .update({
        amount: finalAmount,
        trade_date: format(date, 'yyyy-MM-dd'),
        notes: notes.trim() || null,
      })
      .eq('id', trade.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update trade', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Trade updated successfully' });
      onSuccess();
    }

    setLoading(false);
  };

  const formatCurrencySymbol = () => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'CHF',
      Cents: '¢',
    };
    return symbols[currency] || '$';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Trade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Trade Type Toggle */}
          <div className="space-y-2">
            <Label>Trade Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={tradeType === 'profit' ? 'default' : 'outline'}
                className={cn(
                  'gap-2',
                  tradeType === 'profit' && 'bg-green-600 hover:bg-green-700'
                )}
                onClick={() => setTradeType('profit')}
              >
                <TrendingUp className="h-4 w-4" />
                Profit
              </Button>
              <Button
                type="button"
                variant={tradeType === 'loss' ? 'default' : 'outline'}
                className={cn(
                  'gap-2',
                  tradeType === 'loss' && 'bg-red-600 hover:bg-red-700'
                )}
                onClick={() => setTradeType('loss')}
              >
                <TrendingDown className="h-4 w-4" />
                Loss
              </Button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="edit-amount">Amount ({formatCurrencySymbol()})</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Trade Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes (Optional)</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this trade..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className={tradeType === 'profit' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TradeEditDialog;
