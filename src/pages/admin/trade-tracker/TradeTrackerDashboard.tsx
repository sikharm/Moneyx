import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import AccountsList from '@/components/trade-tracker/AccountsList';
import AccountDialog from '@/components/trade-tracker/AccountDialog';

interface AccountWithBalance {
  id: string;
  nickname: string;
  initial_balance: number;
  currency: string;
  current_balance: number;
  total_profit_loss: number;
}

const TradeTrackerDashboard = () => {
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadAccountsWithBalances();
  }, []);

  const loadAccountsWithBalances = async () => {
    setLoading(true);
    
    // Get all accounts
    const { data: accountsData, error: accountsError } = await supabase
      .from('trading_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (accountsError) {
      console.error('Error loading accounts:', accountsError);
      setLoading(false);
      return;
    }

    // Get all trades grouped by account
    const { data: tradesData, error: tradesError } = await supabase
      .from('trades')
      .select('account_id, amount');

    if (tradesError) {
      console.error('Error loading trades:', tradesError);
      setLoading(false);
      return;
    }

    // Calculate balances
    const accountsWithBalances = (accountsData || []).map(account => {
      const accountTrades = (tradesData || []).filter(t => t.account_id === account.id);
      const totalPL = accountTrades.reduce((sum, t) => sum + Number(t.amount), 0);
      
      return {
        id: account.id,
        nickname: account.nickname,
        initial_balance: Number(account.initial_balance),
        currency: account.currency,
        current_balance: Number(account.initial_balance) + totalPL,
        total_profit_loss: totalPL,
      };
    });

    setAccounts(accountsWithBalances);
    setLoading(false);
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.current_balance, 0);
  const totalProfitLoss = accounts.reduce((sum, a) => sum + a.total_profit_loss, 0);
  const profitableAccounts = accounts.filter(a => a.total_profit_loss > 0).length;

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'Cents' ? 'USD' : currency,
      minimumFractionDigits: 2,
    }).format(currency === 'Cents' ? amount / 100 : amount);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trade Tracker Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your trading performance</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Accounts
            </CardTitle>
            <Wallet className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{accounts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {profitableAccounts} profitable
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Combined Balance
            </CardTitle>
            <Wallet className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Profit/Loss
            </CardTitle>
            {totalProfitLoss >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(totalProfitLoss)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All-time performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List */}
      <AccountsList 
        accounts={accounts} 
        loading={loading} 
        onRefresh={loadAccountsWithBalances}
      />

      <AccountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadAccountsWithBalances}
      />
    </div>
  );
};

export default TradeTrackerDashboard;
