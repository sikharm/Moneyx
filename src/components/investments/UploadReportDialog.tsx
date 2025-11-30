import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { parseMT5Report, ParsedReportData, formatCurrency } from '@/utils/mt5ReportParser';

interface MT5Account {
  id: string;
  nickname: string;
  rebate_rate_per_lot: number;
  is_cent_account: boolean;
}

interface UploadReportDialogProps {
  account: MT5Account | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const UploadReportDialog = ({ account, onOpenChange, onSuccess }: UploadReportDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedReportData | null>(null);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setParseError(null);
    setParsedData(null);

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      setParseError('Please upload an HTML file from MT5 report export');
      return;
    }

    try {
      const text = await file.text();
      const data = parseMT5Report(text);
      
      if (data.balance === 0 && data.totalTrades === 0) {
        setParseError('Could not parse report data. Make sure this is a valid MT5 trade history report.');
        return;
      }
      
      setParsedData(data);
    } catch (error) {
      console.error('Parse error:', error);
      setParseError('Failed to parse the report file');
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleSubmit = async () => {
    if (!account || !parsedData) return;
    
    setLoading(true);
    try {
      // Apply cent account conversion (divide by 100 for monetary values)
      const divisor = account.is_cent_account ? 100 : 1;
      
      const balance = parsedData.balance / divisor;
      const equity = parsedData.equity / divisor;
      const grossProfit = parsedData.grossProfit / divisor;
      const grossLoss = parsedData.grossLoss / divisor;
      const netProfit = parsedData.netProfit / divisor;
      
      // Calculate rebate (lots stay the same)
      const rebate = parsedData.totalLots * account.rebate_rate_per_lot;

      // Insert the report with converted values
      const { error: insertError } = await supabase
        .from('investment_reports')
        .upsert({
          account_id: account.id,
          report_date: reportDate,
          report_period_start: parsedData.reportPeriodStart,
          report_period_end: parsedData.reportPeriodEnd,
          balance,
          equity,
          gross_profit: grossProfit,
          gross_loss: grossLoss,
          net_profit: netProfit,
          total_lots: parsedData.totalLots,
          total_trades: parsedData.totalTrades,
          profit_factor: parsedData.profitFactor,
          raw_summary: parsedData.rawSummary,
        }, {
          onConflict: 'account_id,report_date',
        });

      if (insertError) throw insertError;

      // Update account summary
      const { error: updateError } = await supabase
        .from('user_mt5_accounts')
        .update({
          last_report_date: reportDate,
          last_balance: balance,
          total_lots_traded: parsedData.totalLots,
          status: 'active',
        })
        .eq('id', account.id);

      if (updateError) throw updateError;

      toast.success(`Report uploaded! Rebate earned: ${formatCurrency(rebate)}`);
      onOpenChange(false);
      onSuccess();
      
      // Reset state
      setParsedData(null);
      setParseError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to save report');
    } finally {
      setLoading(false);
    }
  };

  // Preview values with cent conversion applied
  const divisor = account?.is_cent_account ? 100 : 1;
  const previewBalance = parsedData ? parsedData.balance / divisor : 0;
  const previewEquity = parsedData ? parsedData.equity / divisor : 0;
  const previewNetProfit = parsedData ? parsedData.netProfit / divisor : 0;
  
  const calculatedRebate = parsedData && account 
    ? parsedData.totalLots * account.rebate_rate_per_lot
    : 0;

  return (
    <Dialog open={!!account} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Trade Report</DialogTitle>
          <DialogDescription>
            Upload your MT5 trade history report for "{account?.nickname}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report_date">Report Date</Label>
            <Input
              id="report_date"
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>MT5 Report File (HTML)</Label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${isDragging 
                  ? 'border-primary bg-primary/10' 
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                }
              `}
            >
              <Input
                type="file"
                accept=".html,.htm"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              <Upload className={`h-8 w-8 mx-auto mb-2 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="text-sm font-medium">
                {isDragging ? 'Drop file here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                HTML report file from MT5
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Export from MT5: Account History → Right Click → Save as Detailed Report
            </p>
          </div>

          {parseError && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              {parseError}
            </div>
          )}

          {parsedData && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Parsed Report Data {account?.is_cent_account && <Badge variant="outline" className="text-xs">Cent → USD</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Balance</p>
                    <p className="font-semibold">{formatCurrency(previewBalance)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Equity</p>
                    <p className="font-semibold">{formatCurrency(previewEquity)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Net Profit</p>
                    <p className={`font-semibold ${previewNetProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(previewNetProfit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Lots</p>
                    <p className="font-semibold">{parsedData.totalLots.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Trades</p>
                    <p className="font-semibold">{parsedData.totalTrades}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rebate Earned</p>
                    <p className="font-semibold text-green-500">{formatCurrency(calculatedRebate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="bg-gradient-hero" 
              disabled={loading || !parsedData}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? 'Saving...' : 'Save Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadReportDialog;
