import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, TrendingUp, LogIn, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const { t } = useLanguage();

  const navLinks = [
    { to: "/", label: t('nav.home') },
    { to: "/about", label: t('nav.about') },
    { to: "/auto-mode", label: t('nav.auto_mode') },
    { to: "/hybrid-mode", label: t('nav.hybrid_mode') },
    { to: "/performance", label: t('nav.performance') },
    { to: "/download", label: t('nav.download') },
    { to: "/facebook-updates", label: t('nav.updates') },
    { to: "/contact", label: t('nav.contact') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-gradient-hero p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="bg-gradient-hero bg-clip-text text-transparent">EA Trading</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive(link.to) ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
              
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="ghost" size="sm">
                        <Shield className="h-4 w-4 mr-2" />
                        {t('nav.admin')}
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.sign_out')}
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button size="sm" className="bg-gradient-hero hover:opacity-90">
                    <LogIn className="h-4 w-4 mr-2" />
                    {t('nav.sign_in')}
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-border">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block py-2 px-4 rounded-lg transition-colors",
                  isActive(link.to)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-4 pt-2 space-y-2 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Shield className="h-4 w-4 mr-2" />
                        {t('nav.admin_panel')}
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.sign_out')}
                  </Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-gradient-hero hover:opacity-90">
                    <LogIn className="h-4 w-4 mr-2" />
                    {t('nav.sign_in')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
