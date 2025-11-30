import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Users, DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserAccount {
  id: string;
  nickname: string;
  initial_investment: number;
  rebate_rate_per_lot: number;
  is_cent_account: boolean;
  status: string;
  balance: number;
  profit_loss: number;
  lots_traded: number;
  rebate: number;
}

interface UserSummary {
  user_id: string;
  email: string;
  full_name: string;
  accounts: UserAccount[];
  total_invested: number;
  total_balance: number;
  total_profit_loss: number;
  total_lots: number;
  total_rebate: number;
}

const UserInvestments = () => {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUserInvestments();
  }, []);

  const loadUserInvestments = async () => {
    try {
      // Get all accounts with user profiles
      const { data: accounts, error: accountsError } = await supabase
        .from('user_mt5_accounts')
        .select('*');

      if (accountsError) throw accountsError;

      // Get profiles for user emails
      const userIds = [...new Set(accounts?.map(a => a.user_id) || [])];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Get latest earnings for each account
      const accountIds = accounts?.map(a => a.id) || [];
      const { data: earnings, error: earningsError } = await supabase
        .from('user_account_earnings')
        .select('*')
        .in('account_id', accountIds)
        .order('synced_at', { ascending: false });

      if (earningsError) throw earningsError;

      // Map latest earnings per account
      const latestEarnings = new Map();
      earnings?.forEach(e => {
        if (!latestEarnings.has(e.account_id)) {
          latestEarnings.set(e.account_id, e);
        }
      });

      // Group by user
      const userMap = new Map<string, UserSummary>();
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      accounts?.forEach(account => {
        const profile = profileMap.get(account.user_id);
        const earning = latestEarnings.get(account.id);
        
        if (!userMap.has(account.user_id)) {
          userMap.set(account.user_id, {
            user_id: account.user_id,
            email: profile?.email || 'Unknown',
            full_name: profile?.full_name || '',
            accounts: [],
            total_invested: 0,
            total_balance: 0,
            total_profit_loss: 0,
            total_lots: 0,
            total_rebate: 0,
          });
        }

        const user = userMap.get(account.user_id)!;
        const accountData: UserAccount = {
          id: account.id,
          nickname: account.nickname,
          initial_investment: Number(account.initial_investment),
          rebate_rate_per_lot: Number(account.rebate_rate_per_lot),
          is_cent_account: account.is_cent_account,
          status: account.status,
          balance: earning ? Number(earning.balance) : Number(account.initial_investment),
          profit_loss: earning ? Number(earning.profit_loss) : 0,
          lots_traded: earning ? Number(earning.lots_traded) : 0,
          rebate: earning ? Number(earning.rebate) : 0,
        };

        user.accounts.push(accountData);
        user.total_invested += accountData.initial_investment;
        user.total_balance += accountData.balance;
        user.total_profit_loss += accountData.profit_loss;
        user.total_lots += accountData.lots_traded;
        user.total_rebate += accountData.rebate;
      });

      setUsers(Array.from(userMap.values()));
    } catch (error) {
      console.error('Error loading user investments:', error);
      toast.error('Failed to load user investments');
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Calculate totals
  const totals = users.reduce(
    (acc, u) => ({
      users: acc.users + 1,
      accounts: acc.accounts + u.accounts.length,
      invested: acc.invested + u.total_invested,
      balance: acc.balance + u.total_balance,
      profit_loss: acc.profit_loss + u.total_profit_loss,
      lots: acc.lots + u.total_lots,
      rebate: acc.rebate + u.total_rebate,
    }),
    { users: 0, accounts: 0, invested: 0, balance: 0, profit_loss: 0, lots: 0, rebate: 0 }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Investments</h1>
        <p className="text-muted-foreground">Overview of all user MT5 accounts and earnings</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.users}</div>
            <p className="text-xs text-muted-foreground">{totals.accounts} accounts total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.invested)}</div>
            <p className="text-xs text-muted-foreground">Initial investments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P/L</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(totals.profit_loss)}
            </div>
            <p className="text-xs text-muted-foreground">{totals.lots.toFixed(2)} lots traded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rebates</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(totals.rebate)}</div>
            <p className="text-xs text-muted-foreground">
              Net: {formatCurrency(totals.profit_loss + totals.rebate)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              No user investments yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-center">Accounts</TableHead>
                  <TableHead className="text-right">Invested</TableHead>
                  <TableHead className="text-right">P/L</TableHead>
                  <TableHead className="text-right">Lots</TableHead>
                  <TableHead className="text-right">Rebate</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const isExpanded = expandedUsers.has(user.user_id);
                  const net = user.total_profit_loss + user.total_rebate;
                  
                  return (
                    <>
                      <TableRow 
                        key={user.user_id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleUser(user.user_id)}
                      >
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.email}</p>
                            {user.full_name && (
                              <p className="text-sm text-muted-foreground">{user.full_name}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{user.accounts.length}</TableCell>
                        <TableCell className="text-right">{formatCurrency(user.total_invested)}</TableCell>
                        <TableCell className={`text-right ${user.total_profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(user.total_profit_loss)}
                        </TableCell>
                        <TableCell className="text-right">{user.total_lots.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-green-500">{formatCurrency(user.total_rebate)}</TableCell>
                        <TableCell className={`text-right font-semibold ${net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(net)}
                        </TableCell>
                      </TableRow>
                      {isExpanded && user.accounts.map((account) => {
                        const accountNet = account.profit_loss + account.rebate;
                        return (
                          <TableRow key={account.id} className="bg-muted/30">
                            <TableCell></TableCell>
                            <TableCell className="pl-8">
                              <div>
                                <p className="text-sm">{account.nickname}</p>
                                <p className="text-xs text-muted-foreground">
                                  {account.is_cent_account ? 'Cent' : 'Standard'} | ${account.rebate_rate_per_lot}/lot
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-sm">{account.status}</TableCell>
                            <TableCell className="text-right text-sm">{formatCurrency(account.initial_investment)}</TableCell>
                            <TableCell className={`text-right text-sm ${account.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {formatCurrency(account.profit_loss)}
                            </TableCell>
                            <TableCell className="text-right text-sm">{account.lots_traded.toFixed(2)}</TableCell>
                            <TableCell className="text-right text-sm text-green-500">{formatCurrency(account.rebate)}</TableCell>
                            <TableCell className={`text-right text-sm ${accountNet >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {formatCurrency(accountNet)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </>
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

export default UserInvestments;