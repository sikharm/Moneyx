import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown, Target, Trophy, BarChart3, Calendar } from 'lucide-react';
import { startOfWeek } from 'date-fns';

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
  thisWeekBalance: number;      // initial + this week P/L
  thisWeekNetProfit: number;    // This week's P/L
  allTimeNetProfit: number;     // All-time P/L
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

    // Get this week's start (Monday)
    const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const thisWeekStartStr = thisWeekStart.toISOString().split('T')[0];

    // Get all trades for these accounts (for all-time calculation)
    const { data: allTrades, error: allTradesError } = await supabase
      .from('trades')
      .select('*')
      .in('account_id', accountIds);

    // Get this week's trades (always Monday to now)
    const { data: thisWeekTrades, error: thisWeekError } = await supabase
      .from('trades')
      .select('*')
      .in('account_id', accountIds)
      .gte('trade_date', thisWeekStartStr);

    if (allTradesError || thisWeekError) {
      console.error('Error loading trades:', allTradesError || thisWeekError);
      setLoading(false);
      return;
    }

    const accountSummaries: AccountSummary[] = targetAccounts.map(account => {
      const accountAllTrades = (allTrades || []).filter(t => t.account_id === account.id);
      const accountThisWeekTrades = (thisWeekTrades || []).filter(t => t.account_id === account.id);

      const allTimePL = accountAllTrades.reduce((sum, t) => sum + Number(t.amount), 0);
      const thisWeekPL = accountThisWeekTrades.reduce((sum, t) => sum + Number(t.amount), 0);
      
      // Win rate based on this week's trades
      const winningTrades = accountThisWeekTrades.filter(t => Number(t.amount) > 0).length;
      const losingTrades = accountThisWeekTrades.filter(t => Number(t.amount) < 0).length;
      const totalTrades = winningTrades + losingTrades;
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

      return {
        accountId: account.id,
        nickname: account.nickname,
        currency: account.currency,
        initialBalance: account.initial_balance,
        thisWeekBalance: account.initial_balance + thisWeekPL,
        thisWeekNetProfit: thisWeekPL,
        allTimeNetProfit: allTimePL,
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

  // Combined totals
  const combinedThisWeekBalance = summaries.reduce((sum, s) => sum + s.thisWeekBalance, 0);
  const combinedThisWeekPL = summaries.reduce((sum, s) => sum + s.thisWeekNetProfit, 0);
  const combinedAllTimePL = summaries.reduce((sum, s) => sum + s.allTimeNetProfit, 0);
  const combinedWins = summaries.reduce((sum, s) => sum + s.winningTrades, 0);
  const combinedLosses = summaries.reduce((sum, s) => sum + s.losingTrades, 0);
  const combinedWinRate = (combinedWins + combinedLosses) > 0 
    ? (combinedWins / (combinedWins + combinedLosses)) * 100 
    : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  This Week Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(combinedThisWeekBalance)}</div>
                <p className="text-xs text-muted-foreground">Initial + This Week P/L</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  {combinedThisWeekPL >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  This Week Net Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${combinedThisWeekPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {combinedThisWeekPL >= 0 ? '+' : ''}{formatCurrency(combinedThisWeekPL)}
                </div>
                <p className="text-xs text-muted-foreground">{combinedWins}W / {combinedLosses}L ({combinedWinRate.toFixed(1)}%)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  All Time Net Profit
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      This Week Balance
                    </p>
                    <p className="text-xl font-bold">{formatCurrency(summary.thisWeekBalance, summary.currency)}</p>
                    <p className="text-xs text-muted-foreground">
                      Initial: {formatCurrency(summary.initialBalance, summary.currency)}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      {summary.thisWeekNetProfit >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      This Week Net Profit
                    </p>
                    <p className={`text-xl font-bold ${summary.thisWeekNetProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {summary.thisWeekNetProfit >= 0 ? '+' : ''}{formatCurrency(summary.thisWeekNetProfit, summary.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {summary.winningTrades}W / {summary.losingTrades}L ({summary.winRate.toFixed(1)}%)
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      All Time Net Profit
                    </p>
                    <p className={`text-xl font-bold ${summary.allTimeNetProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {summary.allTimeNetProfit >= 0 ? '+' : ''}{formatCurrency(summary.allTimeNetProfit, summary.currency)}
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
