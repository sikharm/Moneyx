import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EarningsData {
  id: string;
  account_id: string;
  account_nickname: string;
  period_type: string;
  period_start: string;
  period_end: string;
  balance: number;
  equity: number;
  profit_loss: number;
  lots_traded: number;
  rebate: number;
  synced_at: string;
}

const EarningsPage = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<EarningsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodType, setPeriodType] = useState<string>('weekly');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadEarnings();
  }, [user, periodType]);

  const loadEarnings = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Get accounts first
      const { data: accounts, error: accountsError } = await supabase
        .from('user_mt5_accounts')
        .select('id, nickname')
        .eq('user_id', user.id);

      if (accountsError) throw accountsError;
      if (!accounts || accounts.length === 0) {
        setEarnings([]);
        setLoading(false);
        return;
      }

      // Get earnings
      const accountIds = accounts.map(a => a.id);
      const { data: earningsData, error: earningsError } = await supabase
        .from('user_account_earnings')
        .select('*')
        .in('account_id', accountIds)
        .eq('period_type', periodType)
        .order('synced_at', { ascending: false });

      if (earningsError) throw earningsError;

      // Map account names to earnings
      const accountMap = new Map(accounts.map(a => [a.id, a.nickname]));
      const mappedEarnings = earningsData?.map(e => ({
        ...e,
        account_nickname: accountMap.get(e.account_id) || 'Unknown',
      })) || [];

      setEarnings(mappedEarnings);
    } catch (error) {
      console.error('Error loading earnings:', error);
      toast.error('Failed to load earnings data');
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
          body: { account_id: account.id, period_type: periodType },
        });
      }

      toast.success('All accounts synced');
      await loadEarnings();
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate totals
  const totals = earnings.reduce(
    (acc, e) => ({
      balance: acc.balance + Number(e.balance),
      profit_loss: acc.profit_loss + Number(e.profit_loss),
      lots_traded: acc.lots_traded + Number(e.lots_traded),
      rebate: acc.rebate + Number(e.rebate),
    }),
    { balance: 0, profit_loss: 0, lots_traded: 0, rebate: 0 }
  );

  const netTotal = totals.profit_loss + totals.rebate;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Earnings</h1>
          <p className="text-muted-foreground">View your P/L and rebates</p>
        </div>
        <div className="flex gap-2">
          <Select value={periodType} onValueChange={setPeriodType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={syncAllAccounts} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sync All
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.balance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profit/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(totals.profit_loss)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rebate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(totals.rebate)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netTotal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(netTotal)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings by Account</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : earnings.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              No earnings data yet. Sync your accounts to see data.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">P/L</TableHead>
                  <TableHead className="text-right">Lots</TableHead>
                  <TableHead className="text-right">Rebate</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.map((e) => {
                  const total = Number(e.profit_loss) + Number(e.rebate);
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.account_nickname}</TableCell>
                      <TableCell>
                        {formatDate(e.period_start)} - {formatDate(e.period_end)}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(e.balance)}</TableCell>
                      <TableCell className={`text-right ${e.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(e.profit_loss)}
                      </TableCell>
                      <TableCell className="text-right">{Number(e.lots_traded).toFixed(2)}</TableCell>
                      <TableCell className="text-right text-green-500">{formatCurrency(e.rebate)}</TableCell>
                      <TableCell className={`text-right font-semibold ${total >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(total)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EarningsPage;