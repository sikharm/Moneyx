import { useState } from 'react';
import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FileText, Languages, Users, Handshake, CreditCard, Menu, LogOut, Sun, Moon, Monitor, Check, Home, User, Wallet } from 'lucide-react';
import AdminNotificationBell from '@/components/admin/AdminNotificationBell';
import AdminBreadcrumb from '@/components/admin/AdminBreadcrumb';
import { Sheet, SheetContent, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { currentLanguage, languages, setLanguage, t } = useLanguage();
  const [themeOpen, setThemeOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

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

  const themeOptions: { value: "light" | "dark" | "system"; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const currentLang = languages.find(l => l.code === currentLanguage);

  const handleViewSite = () => {
    setMobileMenuOpen(false);
    navigate("/");
  };

  const handleProfileClick = () => {
    setMobileMenuOpen(false);
    navigate("/profile");
  };

  const handleInvestmentsClick = () => {
    setMobileMenuOpen(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Unified Menu Toggle */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col">
                <div className="p-4 border-b">
                  <Link 
                    to="/admin" 
                    className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    MoneyX Admin
                  </Link>
                </div>
                
                {/* Navigation Links */}
                <nav className="flex flex-col p-2 flex-1 overflow-auto">
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

                  {/* Separator */}
                  <div className="my-3 border-t border-border" />

                  {/* Theme Settings */}
                  <Collapsible open={themeOpen} onOpenChange={setThemeOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between">
                        <span className="flex items-center">
                          <Sun className="h-4 w-4 mr-3" />
                          Theme
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${themeOpen ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4">
                      {themeOptions.map((option) => (
                        <Button
                          key={option.value}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setTheme(option.value)}
                        >
                          <option.icon className="h-4 w-4 mr-3" />
                          {option.label}
                          {theme === option.value && <Check className="h-4 w-4 ml-auto" />}
                        </Button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Language Settings */}
                  <Collapsible open={languageOpen} onOpenChange={setLanguageOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between">
                        <span className="flex items-center">
                          <span className="mr-3 text-sm">🌐</span>
                          Language
                          <span className="ml-2 text-xs text-muted-foreground">({currentLang?.native_name})</span>
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${languageOpen ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4">
                      {languages.map((lang) => (
                        <Button
                          key={lang.code}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setLanguage(lang.code)}
                        >
                          {lang.native_name}
                          <span className="ml-2 text-xs text-muted-foreground">({lang.name})</span>
                          {currentLanguage === lang.code && <Check className="h-4 w-4 ml-auto" />}
                        </Button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Separator */}
                  <div className="my-3 border-t border-border" />

                  {/* Quick Links */}
                  <Button variant="ghost" className="w-full justify-start" onClick={handleViewSite}>
                    <Home className="h-4 w-4 mr-3" />
                    View Site
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={handleProfileClick}>
                    <User className="h-4 w-4 mr-3" />
                    My Profile
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={handleInvestmentsClick}>
                    <Wallet className="h-4 w-4 mr-3" />
                    My Investments
                  </Button>
                </nav>

                <SheetFooter className="p-4 border-t mt-auto">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <Link to="/admin" className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              MoneyX Admin
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <AdminNotificationBell />
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
