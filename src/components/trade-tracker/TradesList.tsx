import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, Pencil, Trash2, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import TradeEditDialog from './TradeEditDialog';

interface Trade {
  id: string;
  account_id: string;
  amount: number;
  trade_date: string;
  notes: string | null;
  created_at: string;
}

interface TradesListProps {
  accountId: string;
  currency: string;
  onTradeChange: () => void;
}

const TradesList = ({ accountId, currency, onTradeChange }: TradesListProps) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTrades();
  }, [accountId]);

  const loadTrades = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('account_id', accountId)
      .order('trade_date', { ascending: false });

    if (!error && data) {
      setTrades(data.map(t => ({ ...t, amount: Number(t.amount) })));
    }
    setLoading(false);
  };

  const handleDeleteTrade = async () => {
    if (!tradeToDelete) return;

    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', tradeToDelete.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete trade', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Trade deleted successfully' });
      loadTrades();
      onTradeChange();
    }

    setDeleteDialogOpen(false);
    setTradeToDelete(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'Cents' ? 'USD' : currency,
      minimumFractionDigits: 2,
    }).format(currency === 'Cents' ? amount / 100 : amount);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-6 bg-muted rounded w-1/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Trades Yet</h3>
          <p className="text-muted-foreground text-center">
            Record your first trade to start tracking performance
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {trades.map(trade => (
          <Card key={trade.id} className="hover:border-muted-foreground/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    trade.amount >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    {trade.amount >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${
                      trade.amount >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {trade.amount >= 0 ? '+' : ''}{formatCurrency(trade.amount)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(trade.trade_date), 'MMM d, yyyy')}
                    </div>
                    {trade.notes && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {trade.notes}
                      </div>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingTrade(trade)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => {
                        setTradeToDelete(trade);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingTrade && (
        <TradeEditDialog
          open={!!editingTrade}
          onOpenChange={(open) => !open && setEditingTrade(null)}
          trade={editingTrade}
          currency={currency}
          onSuccess={() => {
            loadTrades();
            onTradeChange();
            setEditingTrade(null);
          }}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trade</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trade? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTrade} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TradesList;
