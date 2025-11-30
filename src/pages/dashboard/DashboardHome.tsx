import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, DollarSign, Plus, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AccountSummary {
  total_accounts: number;
  combined_balance: number;
  total_profit_loss: number;
  total_rebate: number;
  total_lots: number;
}

const DashboardHome = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AccountSummary>({
    total_accounts: 0,
    combined_balance: 0,
    total_profit_loss: 0,
    total_rebate: 0,
    total_lots: 0,
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadSummary();
  }, [user]);

  const loadSummary = async () => {
    if (!user) return;
    
    try {
      // Get accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('user_mt5_accounts')
        .select('*')
        .eq('user_id', user.id);

      if (accountsError) throw accountsError;

      if (!accounts || accounts.length === 0) {
        setLoading(false);
        return;
      }

      // Get latest earnings for each account
      const accountIds = accounts.map(a => a.id);
      const { data: earnings, error: earningsError } = await supabase
        .from('user_account_earnings')
        .select('*')
        .in('account_id', accountIds)
        .order('synced_at', { ascending: false });

      if (earningsError) throw earningsError;

      // Calculate summary (use latest earning per account)
      const latestEarnings = new Map();
      earnings?.forEach(e => {
        if (!latestEarnings.has(e.account_id)) {
          latestEarnings.set(e.account_id, e);
        }
      });

      let combined_balance = 0;
      let total_profit_loss = 0;
      let total_rebate = 0;
      let total_lots = 0;

      latestEarnings.forEach(e => {
        combined_balance += Number(e.balance) || 0;
        total_profit_loss += Number(e.profit_loss) || 0;
        total_rebate += Number(e.rebate) || 0;
        total_lots += Number(e.lots_traded) || 0;
      });

      // If no earnings yet, use initial investments
      if (latestEarnings.size === 0) {
        accounts.forEach(a => {
          combined_balance += Number(a.initial_investment) || 0;
        });
      }

      setSummary({
        total_accounts: accounts.length,
        combined_balance,
        total_profit_loss,
        total_rebate,
        total_lots,
      });
    } catch (error) {
      console.error('Error loading summary:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const syncAllAccounts = async () => {
    if (!user) return;
    setSyncing(true);

    try {
      const { data: accounts } = await supabase
        .from('user_mt5_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'connected');

      if (!accounts || accounts.length === 0) {
        toast.info('No connected accounts to sync');
        return;
      }

      for (const account of accounts) {
        await supabase.functions.invoke('sync-mt5-data', {
          body: { account_id: account.id, period_type: 'weekly' },
        });
      }

      toast.success('All accounts synced');
      await loadSummary();
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync accounts');
    } finally {
      setSyncing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const netTotal = summary.total_profit_loss + summary.total_rebate;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investment Dashboard</h1>
          <p className="text-muted-foreground">Track your MT5 accounts and earnings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncAllAccounts} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sync All
          </Button>
          <Link to="/dashboard/accounts">
            <Button className="bg-gradient-hero">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_accounts}</div>
                <p className="text-xs text-muted-foreground">MT5 connected accounts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Combined Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.combined_balance)}</div>
                <p className="text-xs text-muted-foreground">All accounts in USD</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total P/L + Rebate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netTotal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(netTotal)}
                </div>
                <p className="text-xs text-muted-foreground">
                  P/L: {formatCurrency(summary.total_profit_loss)} | Rebate: {formatCurrency(summary.total_rebate)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Lots</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_lots.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Traded this period</p>
              </CardContent>
            </Card>
          </div>

          {summary.total_accounts === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">No accounts yet</CardTitle>
                <CardDescription className="text-center mb-4">
                  Connect your first MT5 account to start tracking your investments
                </CardDescription>
                <Link to="/dashboard/accounts">
                  <Button className="bg-gradient-hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Add MT5 Account
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardHome;