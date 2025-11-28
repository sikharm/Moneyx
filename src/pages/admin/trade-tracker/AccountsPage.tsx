import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wallet, MoreVertical, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AccountDialog from '@/components/trade-tracker/AccountDialog';
import TradesList from '@/components/trade-tracker/TradesList';
import TradeEntryDialog from '@/components/trade-tracker/TradeEntryDialog';
import { useToast } from '@/hooks/use-toast';

interface Account {
  id: string;
  nickname: string;
  initial_balance: number;
  currency: string;
  created_at: string;
}

interface AccountWithBalance extends Account {
  current_balance: number;
  total_profit_loss: number;
}

const AccountsPage = () => {
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<AccountWithBalance | null>(null);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    
    const { data: accountsData, error: accountsError } = await supabase
      .from('trading_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (accountsError) {
      console.error('Error loading accounts:', accountsError);
      setLoading(false);
      return;
    }

    const { data: tradesData } = await supabase
      .from('trades')
      .select('account_id, amount');

    const accountsWithBalances = (accountsData || []).map(account => {
      const accountTrades = (tradesData || []).filter(t => t.account_id === account.id);
      const totalPL = accountTrades.reduce((sum, t) => sum + Number(t.amount), 0);
      
      return {
        ...account,
        initial_balance: Number(account.initial_balance),
        current_balance: Number(account.initial_balance) + totalPL,
        total_profit_loss: totalPL,
      };
    });

    setAccounts(accountsWithBalances);
    
    // Auto-select first account if none selected
    if (!selectedAccount && accountsWithBalances.length > 0) {
      setSelectedAccount(accountsWithBalances[0]);
    } else if (selectedAccount) {
      // Update selected account data
      const updated = accountsWithBalances.find(a => a.id === selectedAccount.id);
      if (updated) setSelectedAccount(updated);
    }
    
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;

    const { error } = await supabase
      .from('trading_accounts')
      .delete()
      .eq('id', accountToDelete.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete account', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Account deleted successfully' });
      if (selectedAccount?.id === accountToDelete.id) {
        setSelectedAccount(null);
      }
      loadAccounts();
    }
    
    setDeleteDialogOpen(false);
    setAccountToDelete(null);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'Cents' ? 'USD' : currency,
      minimumFractionDigits: 2,
    }).format(currency === 'Cents' ? amount / 100 : amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trading Accounts</h1>
          <p className="text-muted-foreground mt-1">Manage your trading accounts and record trades</p>
        </div>
        <Button onClick={() => { setEditingAccount(null); setAccountDialogOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounts List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold">Your Accounts</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-6 bg-muted rounded w-1/2 mb-2" />
                    <div className="h-8 bg-muted rounded w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No accounts yet</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setAccountDialogOpen(true)}
                >
                  Create your first account
                </Button>
              </CardContent>
            </Card>
          ) : (
            accounts.map(account => (
              <Card 
                key={account.id}
                className={`cursor-pointer transition-all hover:border-primary/50 ${
                  selectedAccount?.id === account.id ? 'border-primary ring-1 ring-primary' : ''
                }`}
                onClick={() => setSelectedAccount(account)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{account.nickname}</span>
                      </div>
                      <div className="text-2xl font-bold mt-1">
                        {formatCurrency(account.current_balance, account.currency)}
                      </div>
                      <div className={`text-sm flex items-center gap-1 mt-1 ${
                        account.total_profit_loss >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {account.total_profit_loss >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {account.total_profit_loss >= 0 ? '+' : ''}
                        {formatCurrency(account.total_profit_loss, account.currency)}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setEditingAccount(account);
                          setAccountDialogOpen(true);
                        }}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAccountToDelete(account);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Trades Panel */}
        <div className="lg:col-span-2">
          {selectedAccount ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Trades - {selectedAccount.nickname}</h2>
                <Button onClick={() => setTradeDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Trade
                </Button>
              </div>
              <TradesList 
                accountId={selectedAccount.id} 
                currency={selectedAccount.currency}
                onTradeChange={loadAccounts}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Wallet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select an Account</h3>
                <p className="text-muted-foreground">
                  Choose an account from the list to view and manage trades
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AccountDialog
        open={accountDialogOpen}
        onOpenChange={setAccountDialogOpen}
        onSuccess={loadAccounts}
        account={editingAccount}
      />

      {selectedAccount && (
        <TradeEntryDialog
          open={tradeDialogOpen}
          onOpenChange={setTradeDialogOpen}
          accountId={selectedAccount.id}
          currency={selectedAccount.currency}
          onSuccess={loadAccounts}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{accountToDelete?.nickname}"? This will also delete all trades associated with this account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccountsPage;
