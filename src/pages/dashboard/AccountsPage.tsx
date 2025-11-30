import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit2, Upload, Calendar, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import AddMT5AccountDialog from '@/components/investments/AddMT5AccountDialog';
import EditRebateDialog from '@/components/investments/EditRebateDialog';
import UploadReportDialog from '@/components/investments/UploadReportDialog';
import AccountSummaryDialog from '@/components/investments/AccountSummaryDialog';
import { formatCurrency } from '@/utils/mt5ReportParser';

interface MT5Account {
  id: string;
  nickname: string;
  initial_investment: number;
  rebate_rate_per_lot: number;
  is_cent_account: boolean;
  status: string;
  created_at: string;
  last_report_date: string | null;
  last_balance: number | null;
  total_lots_traded: number | null;
}

const AccountsPage = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<MT5Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<MT5Account | null>(null);
  const [uploadingAccount, setUploadingAccount] = useState<MT5Account | null>(null);
  const [summaryAccount, setSummaryAccount] = useState<MT5Account | null>(null);

  useEffect(() => {
    loadAccounts();
  }, [user]);

  // Real-time subscription for account updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-mt5-accounts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_mt5_accounts',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Account update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setAccounts(prev => [payload.new as MT5Account, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setAccounts(prev => 
              prev.map(acc => acc.id === payload.new.id ? payload.new as MT5Account : acc)
            );
          } else if (payload.eventType === 'DELETE') {
            setAccounts(prev => prev.filter(acc => acc.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadAccounts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_mt5_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (account: MT5Account) => {
    if (!confirm(`Are you sure you want to delete "${account.nickname}"? All associated reports will be deleted.`)) return;

    try {
      const { error } = await supabase
        .from('user_mt5_accounts')
        .delete()
        .eq('id', account.id);

      if (error) throw error;
      
      toast.success('Account deleted');
      await loadAccounts();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete account');
    }
  };

  const getStatusBadge = (status: string, lastReportDate: string | null) => {
    if (lastReportDate) {
      return <Badge variant="default">Active</Badge>;
    }
    if (status === 'pending') {
      return <Badge variant="outline">Awaiting Report</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investment Accounts</h1>
          <p className="text-muted-foreground">Manage your trading accounts</p>
        </div>
        <Button className="bg-gradient-hero" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-32"></div>
                <div className="h-4 bg-muted rounded w-24 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <CardTitle className="mb-2">No accounts yet</CardTitle>
            <CardDescription className="text-center mb-4">
              Add your first account to start tracking your investments
            </CardDescription>
            <Button className="bg-gradient-hero" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map(account => (
            <Card key={account.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{account.nickname}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Last report: {formatDate(account.last_report_date)}
                    </CardDescription>
                  </div>
                  {getStatusBadge(account.status, account.last_report_date)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Initial Investment</p>
                    <p className="font-semibold">{formatCurrency(account.initial_investment)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Balance</p>
                    <p className="font-semibold">
                      {account.last_balance ? formatCurrency(account.last_balance) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rebate Rate</p>
                    <p className="font-semibold">${account.rebate_rate_per_lot}/lot</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Lots</p>
                    <p className="font-semibold">
                      {account.total_lots_traded?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Account Type</p>
                    <p className="font-semibold">{account.is_cent_account ? 'Cent Account' : 'Standard Account'}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSummaryAccount(account)}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setUploadingAccount(account)}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Upload Report
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingAccount(account)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteAccount(account)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddMT5AccountDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={loadAccounts}
      />

      <EditRebateDialog
        account={editingAccount}
        onOpenChange={(open) => !open && setEditingAccount(null)}
        onSuccess={loadAccounts}
      />

      <UploadReportDialog
        account={uploadingAccount}
        onOpenChange={(open) => !open && setUploadingAccount(null)}
        onSuccess={loadAccounts}
      />

      <AccountSummaryDialog
        account={summaryAccount}
        onOpenChange={(open) => !open && setSummaryAccount(null)}
      />
    </div>
  );
};

export default AccountsPage;
