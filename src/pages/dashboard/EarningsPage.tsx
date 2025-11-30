import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/mt5ReportParser';

interface ReportData {
  id: string;
  account_id: string;
  account_nickname: string;
  report_date: string;
  balance: number;
  equity: number;
  net_profit: number;
  total_lots: number;
  rebate: number;
  rebate_rate: number;
}

const EarningsPage = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [user]);

  const loadReports = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Get accounts first
      const { data: accounts, error: accountsError } = await supabase
        .from('user_mt5_accounts')
        .select('id, nickname, rebate_rate_per_lot')
        .eq('user_id', user.id);

      if (accountsError) throw accountsError;
      if (!accounts || accounts.length === 0) {
        setReports([]);
        setLoading(false);
        return;
      }

      // Get reports
      const accountIds = accounts.map(a => a.id);
      const { data: reportsData, error: reportsError } = await supabase
        .from('investment_reports')
        .select('*')
        .in('account_id', accountIds)
        .order('report_date', { ascending: false });

      if (reportsError) throw reportsError;

      // Map account data to reports
      const accountMap = new Map(accounts.map(a => [a.id, a]));
      const mappedReports = reportsData?.map(r => {
        const account = accountMap.get(r.account_id);
        const rebate = Number(r.total_lots) * (account?.rebate_rate_per_lot || 0);
        return {
          id: r.id,
          account_id: r.account_id,
          account_nickname: account?.nickname || 'Unknown',
          report_date: r.report_date,
          balance: Number(r.balance),
          equity: Number(r.equity),
          net_profit: Number(r.net_profit),
          total_lots: Number(r.total_lots),
          rebate,
          rebate_rate: account?.rebate_rate_per_lot || 0,
        };
      }) || [];

      setReports(mappedReports);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate totals
  const totals = reports.reduce(
    (acc, r) => ({
      balance: acc.balance + r.balance,
      net_profit: acc.net_profit + r.net_profit,
      total_lots: acc.total_lots + r.total_lots,
      rebate: acc.rebate + r.rebate,
    }),
    { balance: 0, net_profit: 0, total_lots: 0, rebate: 0 }
  );

  const netTotal = totals.net_profit + totals.rebate;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Earnings</h1>
        <p className="text-muted-foreground">View your P/L and rebates from uploaded reports</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.net_profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(totals.net_profit)}
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

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              No reports yet. Upload a trade history report from your accounts page.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Report Date</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Net P/L</TableHead>
                  <TableHead className="text-right">Lots</TableHead>
                  <TableHead className="text-right">Rebate</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => {
                  const total = r.net_profit + r.rebate;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.account_nickname}</TableCell>
                      <TableCell>{formatDate(r.report_date)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(r.balance)}</TableCell>
                      <TableCell className={`text-right ${r.net_profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(r.net_profit)}
                      </TableCell>
                      <TableCell className="text-right">{r.total_lots.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-green-500">{formatCurrency(r.rebate)}</TableCell>
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
