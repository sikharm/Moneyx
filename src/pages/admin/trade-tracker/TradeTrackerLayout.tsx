import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Wallet, 
  BarChart3, 
  Share2, 
  Settings, 
  ArrowLeft,
  TrendingUp,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const TradeTrackerLayout = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    navigate('/auth');
    return null;
  }

  const navItems = [
    { path: '/admin/trade-tracker', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/admin/trade-tracker/accounts', icon: Wallet, label: 'Accounts', end: false },
    { path: '/admin/trade-tracker/summary', icon: BarChart3, label: 'Summary', end: false },
    { path: '/admin/trade-tracker/export', icon: Share2, label: 'Export', end: false },
    { path: '/admin/trade-tracker/settings', icon: Settings, label: 'Settings', end: false },
  ];

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="p-4 space-y-2">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )
          }
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex items-center gap-2 p-4 border-b">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold">Trade Tracker</span>
                </div>
                <NavLinks onNavigate={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Admin</span>
            </Button>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-1.5 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold hidden sm:inline">Trade Tracker</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar - narrower */}
        <aside className="hidden lg:block w-52 min-h-[calc(100vh-3.5rem)] border-r bg-card/50 shrink-0">
          <NavLinks />
        </aside>

        {/* Main Content - more space */}
        <main className="flex-1 p-4 lg:p-6 min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TradeTrackerLayout;
