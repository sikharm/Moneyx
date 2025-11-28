import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Globe } from 'lucide-react';
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
        <h1 className="text-2xl font-bold">Export Infographic</h1>
        <p className="text-muted-foreground text-sm mt-1">Generate shareable performance reports</p>
      </div>

      {/* Settings Row - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Account Selection */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedAccountIds.length === accounts.length && accounts.length > 0}
                onCheckedChange={selectAllAccounts}
              />
              <label htmlFor="select-all" className="text-xs cursor-pointer">
                All ({accounts.length})
              </label>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1.5 border-t pt-2">
              {accounts.map(account => (
                <div key={account.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={account.id}
                    checked={selectedAccountIds.includes(account.id)}
                    onCheckedChange={() => toggleAccount(account.id)}
                  />
                  <label htmlFor={account.id} className="text-xs cursor-pointer truncate">
                    {account.nickname}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Period Selection */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Time Period</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodType)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Today</SelectItem>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="yearly">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            {period === 'custom' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-left text-xs h-8",
                      !customDateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {customDateRange.from ? (
                      customDateRange.to ? (
                        <span className="truncate">
                          {format(customDateRange.from, "MMM d")} - {format(customDateRange.to, "MMM d")}
                        </span>
                      ) : (
                        format(customDateRange.from, "MMM d, y")
                      )
                    ) : (
                      "Pick dates"
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
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={language} onValueChange={(v) => setLanguage(v as ExportLanguage)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇺🇸 English</SelectItem>
                <SelectItem value="lo">🇱🇦 ລາວ</SelectItem>
                <SelectItem value="th">🇹🇭 ไทย</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-combined"
                checked={showCombinedTotal}
                onCheckedChange={(checked) => setShowCombinedTotal(!!checked)}
              />
              <label htmlFor="show-combined" className="text-xs cursor-pointer">
                Show combined total
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Panel - Full Width with Scroll */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Preview & Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-fit">
              <InfographicGenerator
                accounts={selectedAccounts}
                dateRange={getDateRange()}
                periodLabel={getPeriodLabel()}
                showCombinedTotal={showCombinedTotal && selectedAccounts.length > 1}
                language={language}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportPage;
