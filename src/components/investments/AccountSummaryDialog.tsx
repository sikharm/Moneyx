import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown, DollarSign, Gift, FileText, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/mt5ReportParser';

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

interface Report {
  id: string;
  report_date: string;
  balance: number;
  equity: number;
  net_profit: number;
  total_lots: number;
  total_trades: number;
  gross_profit: number;
  gross_loss: number;
}

interface AccountSummaryDialogProps {
  account: MT5Account | null;
  onOpenChange: (open: boolean) => void;
}

const AccountSummaryDialog = ({ account, onOpenChange }: AccountSummaryDialogProps) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account) {
      loadReports();
    }
  }, [account]);

  const loadReports = async () => {
    if (!account) return;
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('investment_reports')
        .select('*')
        .eq('account_id', account.id)
        .order('report_date', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!account) return null;

  // Calculate performance metrics
  const totalLots = account.total_lots_traded || 0;
  const currentBalance = account.last_balance || account.initial_investment;
  const totalPL = currentBalance - account.initial_investment;
  const roiPercent = account.initial_investment > 0 
    ? ((totalPL / account.initial_investment) * 100) 
    : 0;
  const totalRebate = totalLots * account.rebate_rate_per_lot;
  const totalTrades = reports.reduce((sum, r) => sum + r.total_trades, 0);
  const totalGrossProfit = reports.reduce((sum, r) => sum + r.gross_profit, 0);
  const totalGrossLoss = reports.reduce((sum, r) => sum + r.gross_loss, 0);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={!!account} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {account.nickname}
            <Badge variant="outline" className="font-normal">
              {account.is_cent_account ? 'Cent Account' : 'Standard Account'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-100px)]">
          <div className="space-y-4 pr-4">
            {/* Performance Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Initial Investment</p>
                    <p className="text-lg font-bold">{formatCurrency(account.initial_investment)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current Balance</p>
                    <p className="text-lg font-bold">{formatCurrency(currentBalance)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total P/L</p>
                    <div className="flex items-center gap-1">
                      {totalPL >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <p className={`text-lg font-bold ${totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(totalPL)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ROI</p>
                    <p className={`text-lg font-bold ${roiPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {roiPercent >= 0 ? '+' : ''}{roiPercent.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Lots Traded</p>
                    <p className="text-lg font-bold">{totalLots.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Trades</p>
                    <p className="text-lg font-bold">{totalTrades}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Gross Profit</p>
                    <p className="text-lg font-bold text-green-500">{formatCurrency(totalGrossProfit)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Gross Loss</p>
                    <p className="text-lg font-bold text-red-500">{formatCurrency(totalGrossLoss)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rebate Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  Rebate Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Rebate Rate</p>
                    <p className="text-lg font-bold">${account.rebate_rate_per_lot}/lot</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Rebate Earned</p>
                    <p className="text-lg font-bold text-green-500">{formatCurrency(totalRebate)}</p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Calculation: {totalLots.toFixed(2)} lots × ${account.rebate_rate_per_lot}/lot = {formatCurrency(totalRebate)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Report History */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Report History ({reports.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : reports.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No reports uploaded yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{formatDate(report.report_date)}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Balance</p>
                            <p className="font-semibold">{formatCurrency(report.balance)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Net P/L</p>
                            <p className={`font-semibold ${report.net_profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {formatCurrency(report.net_profit)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Lots</p>
                            <p className="font-semibold">{report.total_lots.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Trades</p>
                            <p className="font-semibold">{report.total_trades}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AccountSummaryDialog;
