import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Share2, Globe } from 'lucide-react';
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import InfographicGenerator from '@/components/trade-tracker/InfographicGenerator';

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all' | 'custom';
export type ExportLanguage = 'en' | 'lo' | 'th';

interface Account {
  id: string;
  nickname: string;
  initial_balance: number;
  currency: string;
}

const ExportPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [period, setPeriod] = useState<PeriodType>('monthly');
  const [showCombinedTotal, setShowCombinedTotal] = useState(true);
  const [language, setLanguage] = useState<ExportLanguage>('lo');
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const { data, error } = await supabase
      .from('trading_accounts')
      .select('id, nickname, initial_balance, currency')
      .order('nickname');

    if (!error && data) {
      const accountsData = data.map(a => ({ ...a, initial_balance: Number(a.initial_balance) }));
      setAccounts(accountsData);
      // Select all accounts by default
      setSelectedAccountIds(accountsData.map(a => a.id));
    }
    setLoading(false);
  };

  const toggleAccount = (accountId: string) => {
    setSelectedAccountIds(prev => 
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const selectAllAccounts = () => {
    if (selectedAccountIds.length === accounts.length) {
      setSelectedAccountIds([]);
    } else {
      setSelectedAccountIds(accounts.map(a => a.id));
    }
  };

  const getDateRange = (): { start: Date; end: Date } => {
    const now = new Date();
    const end = endOfDay(now);
    
    switch (period) {
      case 'daily':
        return { start: startOfDay(now), end };
      case 'weekly':
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end };
      case 'monthly':
        return { start: startOfMonth(now), end };
      case 'yearly':
        return { start: startOfYear(now), end };
      case 'custom':
        return {
          start: customDateRange.from || startOfMonth(now),
          end: customDateRange.to ? endOfDay(customDateRange.to) : end,
        };
      case 'all':
      default:
        return { start: new Date(2000, 0, 1), end };
    }
  };

  const getPeriodLabel = () => {
    if (period === 'custom' && customDateRange.from && customDateRange.to) {
      return `${format(customDateRange.from, 'MMM d')} - ${format(customDateRange.to, 'MMM d, yyyy')}`;
    }
    
    const labels: Record<PeriodType, string> = {
      daily: "Today's Results",
      weekly: "This Week's Results",
      monthly: "This Month's Results",
      yearly: "This Year's Results",
      all: "All-Time Results",
      custom: "Custom Period Results",
    };
    return labels[period];
  };

  const selectedAccounts = accounts.filter(a => selectedAccountIds.includes(a.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Export Infographic</h1>
        <p className="text-muted-foreground mt-1">Generate shareable performance reports for social media</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Account Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedAccountIds.length === accounts.length}
                  onCheckedChange={selectAllAccounts}
                />
                <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  Select All ({accounts.length} accounts)
                </label>
              </div>
              <div className="border-t pt-4 space-y-3">
                {accounts.map(account => (
                  <div key={account.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={account.id}
                      checked={selectedAccountIds.includes(account.id)}
                      onCheckedChange={() => toggleAccount(account.id)}
                    />
                    <label htmlFor={account.id} className="text-sm cursor-pointer">
                      {account.nickname} ({account.currency})
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Period Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Time Period</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={period} onValueChange={(v) => setPeriod(v as PeriodType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Today</SelectItem>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="yearly">This Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {period === 'custom' && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customDateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateRange.from ? (
                        customDateRange.to ? (
                          <>
                            {format(customDateRange.from, "LLL dd, y")} -{" "}
                            {format(customDateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(customDateRange.from, "LLL dd, y")
                        )
                      ) : (
                        "Pick a date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={customDateRange.from}
                      selected={{ from: customDateRange.from, to: customDateRange.to }}
                      onSelect={(range) => setCustomDateRange({ from: range?.from, to: range?.to })}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </CardContent>
          </Card>

          {/* Language Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Export Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={language} onValueChange={(v) => setLanguage(v as ExportLanguage)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                  <SelectItem value="lo">🇱🇦 ລາວ (Lao)</SelectItem>
                  <SelectItem value="th">🇹🇭 ไทย (Thai)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Display Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-combined"
                  checked={showCombinedTotal}
                  onCheckedChange={(checked) => setShowCombinedTotal(!!checked)}
                />
                <label htmlFor="show-combined" className="text-sm cursor-pointer">
                  Show combined total (when multiple accounts selected)
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div>
          <InfographicGenerator
            accounts={selectedAccounts}
            dateRange={getDateRange()}
            periodLabel={getPeriodLabel()}
            showCombinedTotal={showCombinedTotal && selectedAccounts.length > 1}
            language={language}
          />
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
