import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare, Download, Users, TrendingUp, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalDownloads: 0,
    unreadMessages: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [filesData, downloadsData, messagesData, usersData] = await Promise.all([
      supabase.from('files').select('id', { count: 'exact', head: true }),
      supabase.from('files').select('download_count'),
      supabase.from('chat_messages').select('id', { count: 'exact', head: true }).eq('is_read', false).eq('is_admin', false),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ]);

    const totalDownloads = downloadsData.data?.reduce((sum, file) => sum + (file.download_count || 0), 0) || 0;

    setStats({
      totalFiles: filesData.count || 0,
      totalDownloads,
      unreadMessages: messagesData.count || 0,
      totalUsers: usersData.count || 0,
    });
  };

  const statCards = [
    { title: 'Total Files', value: stats.totalFiles, icon: FileText, color: 'text-blue-500' },
    { title: 'Total Downloads', value: stats.totalDownloads, icon: Download, color: 'text-green-500' },
    { title: 'Unread Messages', value: stats.unreadMessages, icon: MessageSquare, color: 'text-orange-500' },
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your EA trading system content</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
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
              <CardTitle className="text-2xl">Trade Tracker</CardTitle>
              <CardDescription className="text-base mt-1">
                Track your trading performance, manage accounts, and generate shareable reports
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button className="gap-2 bg-green-600 hover:bg-green-700">
            Open Trade Tracker
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;