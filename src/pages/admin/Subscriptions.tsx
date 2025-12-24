import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  AlertTriangle, 
  XCircle, 
  Plus, 
  Search,
  Download,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import SubscriptionTable from '@/components/admin/SubscriptionTable';
import AddSubscriptionDialog from '@/components/admin/AddSubscriptionDialog';
import EditableText from '@/components/EditableText';

interface SubscriptionWithUser {
  id: string;
  user_id: string;
  product_key: string;
  plan_duration: string;
  start_date: string;
  end_date: string;
  status: string;
  amount_paid: number;
  notes: string | null;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

interface DashboardStats {
  total_active: number;
  expiring_soon: number;
  expired: number;
  new_this_month: number;
}

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithUser[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_active: 0,
    expiring_soon: 0,
    expired: 0,
    new_this_month: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionWithUser | null>(null);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      
      const { data: subs, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;

      if (!subs || subs.length === 0) {
        setSubscriptions([]);
        setLoading(false);
        return;
      }

      const userIds = [...new Set(subs.map(s => s.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const subsWithUsers: SubscriptionWithUser[] = subs.map(s => ({
        ...s,
        user_email: profileMap.get(s.user_id)?.email || 'Unknown',
        user_name: profileMap.get(s.user_id)?.full_name || 'Unknown',
      }));

      setSubscriptions(subsWithUsers);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const active = subsWithUsers.filter(s => s.status === 'active').length;
      const expiring = subsWithUsers.filter(s => s.status === 'expiring_soon').length;
      const expired = subsWithUsers.filter(s => s.status === 'expired').length;
      const newThisMonth = subsWithUsers.filter(s => 
        new Date(s.created_at) >= startOfMonth
      ).length;

      setStats({
        total_active: active,
        expiring_soon: expiring,
        expired: expired,
        new_this_month: newThisMonth,
      });
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['User', 'Email', 'Product', 'Start Date', 'End Date', 'Days Left', 'Status', 'Amount Paid', 'Notes'];
    const rows = filteredSubscriptions.map(s => {
      const daysLeft = differenceInDays(new Date(s.end_date), new Date());
      return [
        s.user_name,
        s.user_email,
        s.product_key,
        s.start_date,
        s.end_date,
        daysLeft.toString(),
        s.status,
        s.amount_paid?.toString() || '0',
        s.notes || '',
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscriptions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported to CSV');
  };

  const filteredSubscriptions = subscriptions.filter(s => {
    const matchesSearch = 
      s.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesProduct = productFilter === 'all' || s.product_key === productFilter;
    return matchesSearch && matchesStatus && matchesProduct;
  });

  const products = ['m1', 'm2', 'cm3', 'nm4', 'g1'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            <EditableText tKey="admin.subscriptions.title" fallback="Subscription Management" />
          </h1>
          <p className="text-muted-foreground">
            <EditableText tKey="admin.subscriptions.subtitle" fallback="Track and manage user subscriptions" />
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSubscriptions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            <EditableText tKey="admin.subscriptions.refresh" fallback="Refresh" />
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            <EditableText tKey="admin.subscriptions.export_csv" fallback="Export CSV" />
          </Button>
          <Button className="bg-gradient-hero" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            <EditableText tKey="admin.subscriptions.add" fallback="Add Subscription" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <EditableText tKey="admin.subscriptions.stats.active" fallback="Active Subscriptions" />
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.total_active}</div>
            <p className="text-xs text-muted-foreground">
              <EditableText tKey="admin.subscriptions.stats.active_desc" fallback="Currently active" />
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <EditableText tKey="admin.subscriptions.stats.expiring" fallback="Expiring Soon" />
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats.expiring_soon}</div>
            <p className="text-xs text-muted-foreground">
              <EditableText tKey="admin.subscriptions.stats.expiring_desc" fallback="Within 7 days" />
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <EditableText tKey="admin.subscriptions.stats.expired" fallback="Expired" />
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">
              <EditableText tKey="admin.subscriptions.stats.expired_desc" fallback="Need renewal" />
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <EditableText tKey="admin.subscriptions.stats.new_month" fallback="New This Month" />
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.new_this_month}</div>
            <p className="text-xs text-muted-foreground">
              <EditableText tKey="admin.subscriptions.stats.new_month_desc" fallback="New subscriptions" />
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <EditableText tKey="admin.subscriptions.filters" fallback="Filters" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {products.map(p => (
                  <SelectItem key={p} value={p}>{p.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <SubscriptionTable 
        subscriptions={filteredSubscriptions}
        loading={loading}
        onEdit={(sub) => {
          setEditingSubscription(sub);
          setShowAddDialog(true);
        }}
        onRefresh={loadSubscriptions}
      />

      {/* Add/Edit Dialog */}
      <AddSubscriptionDialog
        open={showAddDialog}
        onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) setEditingSubscription(null);
        }}
        subscription={editingSubscription}
        onSuccess={loadSubscriptions}
      />
    </div>
  );
};

export default Subscriptions;
