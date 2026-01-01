import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  MessageSquare, 
  Download, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  Key, 
  CreditCard,
  AlertTriangle,
  Plus,
  RefreshCw,
  Settings,
  Globe,
  FolderOpen,
  Handshake
} from 'lucide-react';
import EditableText from '@/components/EditableText';
import { differenceInDays } from 'date-fns';

interface ExpiringItem {
  id: string;
  type: 'license' | 'subscription';
  name: string;
  daysLeft: number;
  identifier: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalDownloads: 0,
    unreadMessages: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
    totalLicenses: 0,
  });
  const [expiringItems, setExpiringItems] = useState<ExpiringItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadExpiringItems();
  }, []);

  const loadStats = async () => {
    try {
      const [filesData, downloadsData, messagesData, usersData, subscriptionsData, licensesData] = await Promise.all([
        supabase.from('files').select('id', { count: 'exact', head: true }),
        supabase.from('files').select('download_count'),
        supabase.from('chat_messages').select('id', { count: 'exact', head: true }).eq('is_read', false).eq('is_admin', false),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('license_subscriptions').select('id', { count: 'exact', head: true }),
      ]);

      const totalDownloads = downloadsData.data?.reduce((sum, file) => sum + (file.download_count || 0), 0) || 0;

      setStats({
        totalFiles: filesData.count || 0,
        totalDownloads,
        unreadMessages: messagesData.count || 0,
        totalUsers: usersData.count || 0,
        activeSubscriptions: subscriptionsData.count || 0,
        totalLicenses: licensesData.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExpiringItems = async () => {
    try {
      const today = new Date();
      const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Get expiring subscriptions
      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select('id, product_key, end_date, profiles:user_id(full_name, email)')
        .lte('end_date', sevenDaysFromNow.toISOString())
        .gte('end_date', today.toISOString())
        .neq('status', 'expired')
        .limit(5);

      // Get expiring licenses
      const { data: licenses } = await supabase
        .from('license_subscriptions')
        .select('id, account_id, expire_date, user_name')
        .lte('expire_date', sevenDaysFromNow.toISOString())
        .gte('expire_date', today.toISOString())
        .limit(5);

      const items: ExpiringItem[] = [];

      subscriptions?.forEach(sub => {
        const profile = sub.profiles as any;
        items.push({
          id: sub.id,
          type: 'subscription',
          name: profile?.full_name || profile?.email || 'Unknown',
          daysLeft: differenceInDays(new Date(sub.end_date), today),
          identifier: sub.product_key,
        });
      });

      licenses?.forEach(lic => {
        items.push({
          id: lic.id,
          type: 'license',
          name: lic.user_name || 'Unlinked',
          daysLeft: differenceInDays(new Date(lic.expire_date!), today),
          identifier: lic.account_id,
        });
      });

      // Sort by days left
      items.sort((a, b) => a.daysLeft - b.daysLeft);
      setExpiringItems(items.slice(0, 5));
    } catch (error) {
      console.error('Error loading expiring items:', error);
    }
  };

  const statCards = [
    { title: 'Active Subscriptions', value: stats.activeSubscriptions, icon: CreditCard, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { title: 'Total Licenses', value: stats.totalLicenses, icon: Key, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { title: 'Unread Messages', value: stats.unreadMessages, icon: MessageSquare, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  ];

  const quickLinks = [
    { title: 'Subscriptions & Licenses', icon: CreditCard, path: '/admin/subscriptions', color: 'text-green-500' },
    { title: 'File Management', icon: FolderOpen, path: '/admin/files', color: 'text-amber-500' },
    { title: 'Partners', icon: Handshake, path: '/admin/partners', color: 'text-pink-500' },
    { title: 'Translations', icon: Globe, path: '/admin/translations', color: 'text-cyan-500' },
    { title: 'User Investments', icon: TrendingUp, path: '/admin/user-investments', color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <EditableText
          tKey="admin.dashboard.title"
          fallback="Admin Dashboard"
          as="h1"
          className="text-4xl font-bold mb-2"
        />
        <EditableText
          tKey="admin.dashboard.subtitle"
          fallback="Manage your EA trading system"
          as="p"
          className="text-muted-foreground"
        />
      </div>

      {/* Business Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '-' : stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attention Required */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <EditableText tKey="admin.dashboard.attention" fallback="Attention Required" as="span" />
            </CardTitle>
            <CardDescription>
              <EditableText tKey="admin.dashboard.expiring_soon" fallback="Items expiring within 7 days" as="span" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expiringItems.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <EditableText tKey="admin.dashboard.no_expiring" fallback="No items expiring soon" as="p" />
              </div>
            ) : (
              <div className="space-y-3">
                {expiringItems.map((item) => (
                  <div 
                    key={`${item.type}-${item.id}`}
                    className="flex items-center justify-between p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {item.type === 'license' ? (
                        <Key className="h-4 w-4 text-blue-500" />
                      ) : (
                        <CreditCard className="h-4 w-4 text-green-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.identifier}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                      {item.daysLeft}d
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              <EditableText tKey="admin.dashboard.quick_actions" fallback="Quick Actions" as="span" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {quickLinks.map((link) => (
                <Button
                  key={link.path}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2 hover:bg-muted/50"
                  onClick={() => navigate(link.path)}
                >
                  <link.icon className={`h-5 w-5 ${link.color}`} />
                  <span className="text-sm">{link.title}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trade Tracker Card */}
      <Card 
        className="border-2 border-green-500/20 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent hover:border-green-500/50 transition-all cursor-pointer group"
        onClick={() => navigate('/admin/trade-tracker')}
      >
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                <EditableText tKey="admin.dashboard.trade_tracker" fallback="Trade Tracker" as="span" />
              </CardTitle>
              <CardDescription className="text-base mt-1">
                <EditableText 
                  tKey="admin.dashboard.trade_tracker_desc" 
                  fallback="Track trading performance and generate reports" 
                  as="span"
                />
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button className="gap-2 bg-green-600 hover:bg-green-700">
            <EditableText tKey="admin.dashboard.open_tracker" fallback="Open Trade Tracker" as="span" />
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.totalFiles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.totalDownloads}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
