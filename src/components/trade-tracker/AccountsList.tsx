import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface AccountWithBalance {
  id: string;
  nickname: string;
  initial_balance: number;
  currency: string;
  current_balance: number;
  total_profit_loss: number;
}

interface AccountsListProps {
  accounts: AccountWithBalance[];
  loading: boolean;
  onRefresh: () => void;
}

const AccountsList = ({ accounts, loading, onRefresh }: AccountsListProps) => {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'Cents' ? 'USD' : currency,
      minimumFractionDigits: 2,
    }).format(currency === 'Cents' ? amount / 100 : amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Trading Accounts</h3>
          <p className="text-muted-foreground text-center">
            Create your first trading account to start tracking performance
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Accounts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(account => (
          <Card key={account.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">{account.nickname}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(account.current_balance, account.currency)}
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-muted-foreground">
                  Initial: {formatCurrency(account.initial_balance, account.currency)}
                </span>
                <span className={`flex items-center gap-1 ${
                  account.total_profit_loss >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {account.total_profit_loss >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {account.total_profit_loss >= 0 ? '+' : ''}
                  {formatCurrency(account.total_profit_loss, account.currency)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AccountsList;
