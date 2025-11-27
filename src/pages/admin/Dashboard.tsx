import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, MessageSquare, Download, Users } from 'lucide-react';

const Dashboard = () => {
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

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/admin/files" className="p-4 border rounded-lg hover:border-primary transition-colors">
            <FileText className="h-8 w-8 mb-2 text-primary" />
            <h3 className="font-semibold mb-1">Manage Files</h3>
            <p className="text-sm text-muted-foreground">Upload and organize EA files, documents, and media</p>
          </a>
          <a href="/admin/translations" className="p-4 border rounded-lg hover:border-primary transition-colors">
            <FileText className="h-8 w-8 mb-2 text-primary" />
            <h3 className="font-semibold mb-1">Edit Translations</h3>
            <p className="text-sm text-muted-foreground">Manage multi-language content for your site</p>
          </a>
          <a href="/admin/chat" className="p-4 border rounded-lg hover:border-primary transition-colors">
            <MessageSquare className="h-8 w-8 mb-2 text-primary" />
            <h3 className="font-semibold mb-1">Support Chat</h3>
            <p className="text-sm text-muted-foreground">Respond to user messages and support requests</p>
          </a>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;