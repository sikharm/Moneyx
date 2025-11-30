import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as htmlToImage from 'html-to-image';
import InfographicCanvas from './InfographicCanvas';
import type { ExportLanguage } from '@/pages/admin/trade-tracker/ExportPage';

interface Account {
  id: string;
  nickname: string;
  initial_balance: number;
  currency: string;
}

interface AccountData {
  nickname: string;
  currency: string;
  initialBalance: number;
  thisWeekBalance: number;
  thisWeekNetProfit: number;
  thisWeekPercent: number;
  allTimeNetProfit: number;
  allTimePercent: number;
}

interface InfographicGeneratorProps {
  accounts: Account[];
  dateRange: { start: Date; end: Date };
  periodLabel: string;
  showCombinedTotal: boolean;
  language: ExportLanguage;
}

const InfographicGenerator = ({ 
  accounts, 
  dateRange, 
  periodLabel, 
  showCombinedTotal,
  language,
}: InfographicGeneratorProps) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [accountsData, setAccountsData] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadAccountData();
  }, [accounts, dateRange]);

  const loadAccountData = async () => {
    if (accounts.length === 0) {
      setAccountsData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const accountIds = accounts.map(a => a.id);

    // Get all trades for these accounts (for all-time calculation)
    const { data: allTrades } = await supabase
      .from('trades')
      .select('*')
      .in('account_id', accountIds);

    // Get period trades only (this week)
    const { data: periodTrades } = await supabase
      .from('trades')
      .select('*')
      .in('account_id', accountIds)
      .gte('trade_date', dateRange.start.toISOString().split('T')[0])
      .lte('trade_date', dateRange.end.toISOString().split('T')[0]);

    const data: AccountData[] = accounts.map(account => {
      const accountAllTrades = (allTrades || []).filter(t => t.account_id === account.id);
      const accountPeriodTrades = (periodTrades || []).filter(t => t.account_id === account.id);
      
      const allTimePL = accountAllTrades.reduce((sum, t) => sum + Number(t.amount), 0);
      const thisWeekPL = accountPeriodTrades.reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        nickname: account.nickname,
        currency: account.currency,
        initialBalance: account.initial_balance,
        thisWeekBalance: account.initial_balance + thisWeekPL,
        thisWeekNetProfit: thisWeekPL,
        thisWeekPercent: account.initial_balance > 0 ? (thisWeekPL / account.initial_balance) * 100 : 0,
        allTimeNetProfit: allTimePL,
        allTimePercent: account.initial_balance > 0 ? (allTimePL / account.initial_balance) * 100 : 0,
      };
    });

    setAccountsData(data);
    setLoading(false);
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;

    setExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(canvasRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#1a1a2e',
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `trade-tracker-${periodLabel.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: 'Success',
        description: 'Infographic exported successfully',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Error',
        description: 'Failed to export infographic',
        variant: 'destructive',
      });
    }
    setExporting(false);
  };

  const combinedInitialBalance = accountsData.reduce((sum, a) => sum + a.initialBalance, 0);
  const combinedThisWeekPL = accountsData.reduce((sum, a) => sum + a.thisWeekNetProfit, 0);
  const combinedAllTimePL = accountsData.reduce((sum, a) => sum + a.allTimeNetProfit, 0);

  const combinedTotal = showCombinedTotal ? {
    thisWeekBalance: accountsData.reduce((sum, a) => sum + a.thisWeekBalance, 0),
    thisWeekNetProfit: combinedThisWeekPL,
    thisWeekPercent: combinedInitialBalance > 0 ? (combinedThisWeekPL / combinedInitialBalance) * 100 : 0,
    allTimeNetProfit: combinedAllTimePL,
    allTimePercent: combinedInitialBalance > 0 ? (combinedAllTimePL / combinedInitialBalance) * 100 : 0,
  } : null;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Share2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Select Accounts</h3>
          <p className="text-muted-foreground text-center">
            Select at least one account to generate an infographic
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg">
            <InfographicCanvas
              ref={canvasRef}
              accountsData={accountsData}
              periodLabel={periodLabel}
              combinedTotal={combinedTotal}
              language={language}
            />
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleExport} 
        disabled={exporting} 
        className="w-full gap-2"
        size="lg"
      >
        {exporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Download PNG
          </>
        )}
      </Button>
    </div>
  );
};

export default InfographicGenerator;
