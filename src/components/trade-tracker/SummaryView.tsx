import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown, Target, Trophy, BarChart3 } from 'lucide-react';

interface Account {
  id: string;
  nickname: string;
  initial_balance: number;
  currency: string;
}

interface SummaryViewProps {
  accounts: Account[];
  selectedAccountId: string;
  dateRange: { start: Date; end: Date };
  periodLabel: string;
}

interface AccountSummary {
  accountId: string;
  nickname: string;
  currency: string;
  initialBalance: number;
  currentBalance: number;
  periodProfitLoss: number;
  allTimeProfitLoss: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
}

const SummaryView = ({ accounts, selectedAccountId, dateRange, periodLabel }: SummaryViewProps) => {
  const [summaries, setSummaries] = useState<AccountSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummaries();
  }, [accounts, selectedAccountId, dateRange]);

  const loadSummaries = async () => {
    setLoading(true);

    const targetAccounts = selectedAccountId === 'all' 
      ? accounts 
      : accounts.filter(a => a.id === selectedAccountId);

    if (targetAccounts.length === 0) {
      setSummaries([]);
      setLoading(false);
      return;
    }

    const accountIds = targetAccounts.map(a => a.id);

    // Get all trades for these accounts
    const { data: allTrades, error: allTradesError } = await supabase
      .from('trades')
      .select('*')
      .in('account_id', accountIds);

    // Get trades within date range
    const { data: periodTrades, error: periodTradesError } = await supabase
      .from('trades')
      .select('*')
      .in('account_id', accountIds)
      .gte('trade_date', dateRange.start.toISOString().split('T')[0])
      .lte('trade_date', dateRange.end.toISOString().split('T')[0]);

    if (allTradesError || periodTradesError) {
      console.error('Error loading trades:', allTradesError || periodTradesError);
      setLoading(false);
      return;
    }

    const accountSummaries: AccountSummary[] = targetAccounts.map(account => {
      const accountAllTrades = (allTrades || []).filter(t => t.account_id === account.id);
      const accountPeriodTrades = (periodTrades || []).filter(t => t.account_id === account.id);

      const allTimePL = accountAllTrades.reduce((sum, t) => sum + Number(t.amount), 0);
      const periodPL = accountPeriodTrades.reduce((sum, t) => sum + Number(t.amount), 0);
      
      const winningTrades = accountPeriodTrades.filter(t => Number(t.amount) > 0).length;
      const losingTrades = accountPeriodTrades.filter(t => Number(t.amount) < 0).length;
      const totalTrades = winningTrades + losingTrades;
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

      return {
        accountId: account.id,
        nickname: account.nickname,
        currency: account.currency,
        initialBalance: account.initial_balance,
        currentBalance: account.initial_balance + allTimePL,
        periodProfitLoss: periodPL,
        allTimeProfitLoss: allTimePL,
        winningTrades,
        losingTrades,
        winRate,
      };
    });

    setSummaries(accountSummaries);
    setLoading(false);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'Cents' ? 'USD' : currency,
      minimumFractionDigits: 2,
    }).format(currency === 'Cents' ? amount / 100 : amount);
  };

  // Combined totals (convert all to USD for simplicity)
  const combinedPeriodPL = summaries.reduce((sum, s) => sum + s.periodProfitLoss, 0);
  const combinedAllTimePL = summaries.reduce((sum, s) => sum + s.allTimeProfitLoss, 0);
  const combinedCurrentBalance = summaries.reduce((sum, s) => sum + s.currentBalance, 0);
  const combinedWins = summaries.reduce((sum, s) => sum + s.winningTrades, 0);
  const combinedLosses = summaries.reduce((sum, s) => sum + s.losingTrades, 0);
  const combinedWinRate = (combinedWins + combinedLosses) > 0 
    ? (combinedWins / (combinedWins + combinedLosses)) * 100 
    : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/2 mb-4" />
              <div className="h-8 bg-muted rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Data Available</h3>
          <p className="text-muted-foreground text-center">
            Create an account and record trades to see your performance summary
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Combined Summary (when viewing all accounts) */}
      {selectedAccountId === 'all' && summaries.length > 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Combined Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Total Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(combinedCurrentBalance)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  {combinedPeriodPL >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {periodLabel} P/L
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${combinedPeriodPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {combinedPeriodPL >= 0 ? '+' : ''}{formatCurrency(combinedPeriodPL)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{combinedWinRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">{combinedWins}W / {combinedLosses}L</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  All-Time P/L
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${combinedAllTimePL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {combinedAllTimePL >= 0 ? '+' : ''}{formatCurrency(combinedAllTimePL)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Per-Account Summaries */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {selectedAccountId === 'all' ? 'Account Breakdown' : 'Account Summary'}
        </h2>
        <div className="space-y-6">
          {summaries.map(summary => (
            <Card key={summary.accountId}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  {summary.nickname}
                  <span className="text-sm font-normal text-muted-foreground">({summary.currency})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className="text-xl font-bold">{formatCurrency(summary.currentBalance, summary.currency)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{periodLabel} P/L</p>
                    <p className={`text-xl font-bold ${summary.periodProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {summary.periodProfitLoss >= 0 ? '+' : ''}{formatCurrency(summary.periodProfitLoss, summary.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className="text-xl font-bold">{summary.winRate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">{summary.winningTrades}W / {summary.losingTrades}L</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">All-Time P/L</p>
                    <p className={`text-xl font-bold ${summary.allTimeProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {summary.allTimeProfitLoss >= 0 ? '+' : ''}{formatCurrency(summary.allTimeProfitLoss, summary.currency)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SummaryView;
