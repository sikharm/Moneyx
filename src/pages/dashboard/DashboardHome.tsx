import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, DollarSign, Plus, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/mt5ReportParser';
import AccountSummaryDialog from '@/components/investments/AccountSummaryDialog';

interface MT5Account {
  id: string;
  nickname: string;
  initial_investment: number;
  rebate_rate_per_lot: number;
  is_cent_account: boolean;
  status: string;
  last_balance: number | null;
  total_lots_traded: number | null;
}

interface AccountSummary {
  total_accounts: number;
  combined_balance: number;
  total_net_profit: number;
  total_rebate: number;
  total_lots: number;
}

const DashboardHome = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AccountSummary>({
    total_accounts: 0,
    combined_balance: 0,
    total_net_profit: 0,
    total_rebate: 0,
    total_lots: 0,
  });
  const [accounts, setAccounts] = useState<MT5Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryAccount, setSummaryAccount] = useState<MT5Account | null>(null);

  useEffect(() => {
    loadSummary();
  }, [user]);

  const loadSummary = async () => {
    if (!user) return;
    
    try {
      // Get accounts with full data
      const { data: accountsData, error: accountsError } = await supabase
        .from('user_mt5_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (accountsError) throw accountsError;

      if (!accountsData || accountsData.length === 0) {
        setAccounts([]);
        setLoading(false);
        return;
      }

      setAccounts(accountsData);

      // Get latest report for each account
      const accountIds = accountsData.map(a => a.id);
      const { data: reports, error: reportsError } = await supabase
        .from('investment_reports')
        .select('*')
        .in('account_id', accountIds)
        .order('report_date', { ascending: false });

      if (reportsError) throw reportsError;

      // Get latest report per account
      const latestReports = new Map();
      reports?.forEach(r => {
        if (!latestReports.has(r.account_id)) {
          latestReports.set(r.account_id, r);
        }
      });

      // Create rebate rate map
      const rebateMap = new Map(accountsData.map(a => [a.id, a.rebate_rate_per_lot]));

      let combined_balance = 0;
      let total_net_profit = 0;
      let total_rebate = 0;
      let total_lots = 0;

      latestReports.forEach((r, accountId) => {
        combined_balance += Number(r.balance) || 0;
        total_net_profit += Number(r.net_profit) || 0;
        total_lots += Number(r.total_lots) || 0;
        total_rebate += (Number(r.total_lots) || 0) * (rebateMap.get(accountId) || 0);
      });

      // If no reports yet, use initial investments
      if (latestReports.size === 0) {
        accountsData.forEach(a => {
          combined_balance += Number(a.initial_investment) || 0;
        });
      }

      setSummary({
        total_accounts: accountsData.length,
        combined_balance,
        total_net_profit,
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

  const netTotal = summary.total_net_profit + summary.total_rebate;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investment Dashboard</h1>
          <p className="text-muted-foreground">Track your accounts and earnings</p>
        </div>
        <Link to="/dashboard/accounts">
          <Button className="bg-gradient-hero">
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </Link>
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
                <p className="text-xs text-muted-foreground">Investment accounts</p>
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
                  P/L: {formatCurrency(summary.total_net_profit)} | Rebate: {formatCurrency(summary.total_rebate)}
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
                <p className="text-xs text-muted-foreground">From uploaded reports</p>
              </CardContent>
            </Card>
          </div>

          {summary.total_accounts === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">No accounts yet</CardTitle>
                <CardDescription className="text-center mb-4">
                  Add your first account to start tracking your investments
                </CardDescription>
                <Link to="/dashboard/accounts">
                  <Button className="bg-gradient-hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Account
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Accounts</CardTitle>
                <CardDescription>Click summary to view detailed performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {accounts.map((account) => {
                    const pl = (account.last_balance || account.initial_investment) - account.initial_investment;
                    const rebate = (account.total_lots_traded || 0) * account.rebate_rate_per_lot;
                    
                    return (
                      <div 
                        key={account.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{account.nickname}</span>
                            <Badge variant="outline" className="text-xs">
                              {account.is_cent_account ? 'Cent' : 'Standard'}
                            </Badge>
                          </div>
                          <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                            <span>Balance: {formatCurrency(account.last_balance || account.initial_investment)}</span>
                            <span className={pl >= 0 ? 'text-green-500' : 'text-red-500'}>
                              P/L: {formatCurrency(pl)}
                            </span>
                            <span className="text-green-500">Rebate: {formatCurrency(rebate)}</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSummaryAccount(account)}
                        >
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Summary
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <AccountSummaryDialog
        account={summaryAccount}
        onOpenChange={(open) => !open && setSummaryAccount(null)}
      />
    </div>
  );
};

export default DashboardHome;
