import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Wallet, TrendingUp } from 'lucide-react';
import SettingsDropdown from '@/components/SettingsDropdown';

const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/dashboard/accounts', icon: Wallet, label: 'MT5 Accounts' },
    { to: '/dashboard/earnings', icon: TrendingUp, label: 'Earnings' },
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Dashboard Header */}
      <header className="border-b bg-card sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              My Investments
            </Link>
            <nav className="hidden md:flex gap-2">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to}>
                  <Button
                    variant={location.pathname === item.to ? 'default' : 'ghost'}
                    size="sm"
                    className={location.pathname === item.to ? 'bg-gradient-hero' : ''}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
          <SettingsDropdown />
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;