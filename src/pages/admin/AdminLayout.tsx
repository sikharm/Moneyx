import { useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FileText, Languages, Users, Handshake, CreditCard, Menu, X } from 'lucide-react';
import SettingsDropdown from '@/components/SettingsDropdown';
import AdminNotificationBell from '@/components/admin/AdminNotificationBell';
import AdminBreadcrumb from '@/components/admin/AdminBreadcrumb';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/files', icon: FileText, label: 'File Management' },
    { to: '/admin/translations', icon: Languages, label: 'Translations' },
    { to: '/admin/user-investments', icon: Users, label: 'User Investments' },
    { to: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
    { to: '/admin/partners', icon: Handshake, label: 'Partners' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="p-4 border-b">
                  <Link 
                    to="/admin" 
                    className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    MoneyX Admin
                  </Link>
                </div>
                <nav className="flex flex-col p-2">
                  {navItems.map((item) => (
                    <Link 
                      key={item.to} 
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant={location.pathname === item.to ? 'default' : 'ghost'}
                        className={`w-full justify-start ${location.pathname === item.to ? 'bg-gradient-hero' : ''}`}
                      >
                        <item.icon className="h-4 w-4 mr-3" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <Link to="/admin" className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              MoneyX Admin
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
          <div className="flex items-center gap-2">
            <AdminNotificationBell />
            <SettingsDropdown showViewSite={true} />
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="container mx-auto px-4 py-8">
        <AdminBreadcrumb />
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
