import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, Trash2, Edit2, Loader2, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import AddMT5AccountDialog from '@/components/investments/AddMT5AccountDialog';
import EditRebateDialog from '@/components/investments/EditRebateDialog';

interface MT5Account {
  id: string;
  nickname: string;
  mt5_login: string;
  mt5_server: string;
  initial_investment: number;
  rebate_rate_per_lot: number;
  is_cent_account: boolean;
  status: string;
  metaapi_account_id: string;
  created_at: string;
}

const AccountsPage = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<MT5Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<MT5Account | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [redeployingId, setRedeployingId] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
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

  const checkStatus = async (account: MT5Account) => {
    setCheckingId(account.id);
    try {
      const { data, error } = await supabase.functions.invoke('check-mt5-status', {
        body: { account_id: account.id },
      });

      if (error) throw error;
      
      toast.success(`Status: ${data.status}`);
      await loadAccounts();
    } catch (error) {
      console.error('Status check error:', error);
      toast.error('Failed to check status');
    } finally {
      setCheckingId(null);
    }
  };

  const syncAccount = async (account: MT5Account) => {
    setSyncingId(account.id);
    try {
      const { data, error } = await supabase.functions.invoke('sync-mt5-data', {
        body: { account_id: account.id, period_type: 'weekly' },
      });

      if (error) throw error;
      
      if (data.error === 'Account still deploying') {
        toast.info('Account is still deploying. Please wait a few minutes.');
      } else {
        toast.success('Account synced successfully');
      }
      await loadAccounts();
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync account');
    } finally {
      setSyncingId(null);
    }
  };

  const deleteAccount = async (account: MT5Account) => {
    if (!confirm(`Are you sure you want to delete "${account.nickname}"?`)) return;

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

  const redeployAccount = async (account: MT5Account) => {
    setRedeployingId(account.id);
    try {
      const { data, error } = await supabase.functions.invoke('redeploy-mt5-account', {
        body: { account_id: account.id },
      });

      if (error) throw error;
      
      if (data?.requires_billing) {
        toast.error('MetaAPI quota exceeded. Please top up your MetaAPI account to deploy.');
        return;
      }
      
      toast.success('Redeploy initiated. Check status in 2-3 minutes.');
      await loadAccounts();
    } catch (error: any) {
      console.error('Redeploy error:', error);
      const message = error?.message || 'Failed to redeploy account';
      if (message.includes('quota') || message.includes('top up')) {
        toast.error('MetaAPI quota exceeded. Please top up your MetaAPI account.');
      } else {
        toast.error(message);
      }
    } finally {
      setRedeployingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      connected: { variant: 'default', label: 'Connected' },
      deployed: { variant: 'secondary', label: 'Deployed' },
      deploying: { variant: 'outline', label: 'Deploying...' },
      pending: { variant: 'outline', label: 'Pending' },
      needs_redeploy: { variant: 'destructive', label: 'Needs Redeploy' },
      error: { variant: 'destructive', label: 'Error' },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MT5 Accounts</h1>
          <p className="text-muted-foreground">Manage your connected MT5 accounts</p>
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
              Add your first MT5 account to start tracking
            </CardDescription>
            <Button className="bg-gradient-hero" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add MT5 Account
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
                    <CardDescription>
                      {account.mt5_login} @ {account.mt5_server}
                    </CardDescription>
                  </div>
                  {getStatusBadge(account.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Initial Investment</p>
                    <p className="font-semibold">${account.initial_investment.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rebate Rate</p>
                    <p className="font-semibold">${account.rebate_rate_per_lot}/lot</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Account Type</p>
                    <p className="font-semibold">{account.is_cent_account ? 'Cent Account' : 'Standard Account'}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                {(account.status === 'error' || account.status === 'needs_redeploy') ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled
                    >
                      Unavailable
                    </Button>
                  ) : account.status === 'deploying' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => checkStatus(account)}
                      disabled={checkingId === account.id}
                    >
                      {checkingId === account.id ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-1" />
                      )}
                      Check Status
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => syncAccount(account)}
                      disabled={syncingId === account.id || !['connected', 'deployed'].includes(account.status)}
                    >
                      {syncingId === account.id ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-1" />
                      )}
                      Sync
                    </Button>
                  )}
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
    </div>
  );
};

export default AccountsPage;