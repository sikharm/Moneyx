import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap, Users, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import SettingsDropdown from "./SettingsDropdown";
import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTradingModesOpen, setIsTradingModesOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const navLinks = [
    { to: "/", label: t('nav.home') },
    { to: "/about", label: t('nav.about') },
    { to: "/performance", label: t('nav.performance') },
    { to: "/download", label: t('nav.download') },
    { to: "/contact", label: t('nav.contact') },
  ];

  const getTranslation = (key: string, fallback: string) => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const tradingModes = [
    { 
      to: "/auto-mode", 
      label: t('nav.auto_mode'), 
      description: getTranslation('nav.auto_mode_desc', "Fully automated 24/7 trading"),
      icon: Zap 
    },
    { 
      to: "/hybrid-mode", 
      label: t('nav.hybrid_mode'), 
      description: getTranslation('nav.hybrid_mode_desc', "AI signals + manual control"),
      icon: Users 
    },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isTradingModeActive = tradingModes.some(mode => isActive(mode.to));

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 font-bold text-xl">
            <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-primary/50 bg-card">
              <img src={logo} alt="MoneyX Logo" className="h-full w-full object-cover" />
            </div>
            <span className="bg-gradient-hero bg-clip-text text-transparent">MoneyX</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-5 ml-8">
            {navLinks.slice(0, 2).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                  isActive(link.to) ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Trading Modes Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary focus:outline-none whitespace-nowrap",
                    isTradingModeActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {t('nav.trading_modes') === 'nav.trading_modes' ? "Trading Modes" : t('nav.trading_modes')}
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64 bg-popover border border-border z-50">
                {tradingModes.map((mode) => (
                  <DropdownMenuItem key={mode.to} asChild>
                    <Link
                      to={mode.to}
                      className={cn(
                        "flex items-start gap-3 p-3 cursor-pointer",
                        isActive(mode.to) && "bg-accent"
                      )}
                    >
                      <mode.icon className="h-5 w-5 mt-0.5 text-primary" />
                      <div className="flex flex-col">
                        <span className="font-medium">{mode.label}</span>
                        <span className="text-xs text-muted-foreground">{mode.description}</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {navLinks.slice(2).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                  isActive(link.to) ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            
            <SettingsDropdown />
          </div>

          {/* Mobile/Tablet Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile/Tablet Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 space-y-3 border-t border-border">
            {navLinks.slice(0, 2).map((link) => (
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

            {/* Trading Modes Collapsible */}
            <Collapsible open={isTradingModesOpen} onOpenChange={setIsTradingModesOpen}>
              <CollapsibleTrigger
                className={cn(
                  "flex items-center justify-between w-full py-2 px-4 rounded-lg transition-colors",
                  isTradingModeActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <span>{t('nav.trading_modes') === 'nav.trading_modes' ? "Trading Modes" : t('nav.trading_modes')}</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  isTradingModesOpen && "rotate-180"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 mt-2 space-y-2">
                {tradingModes.map((mode) => (
                  <Link
                    key={mode.to}
                    to={mode.to}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-start gap-3 py-2 px-4 rounded-lg transition-colors",
                      isActive(mode.to)
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <mode.icon className="h-5 w-5 mt-0.5 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium">{mode.label}</span>
                      <span className="text-xs text-muted-foreground">{mode.description}</span>
                    </div>
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {navLinks.slice(2).map((link) => (
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

            <div className="px-4 pt-2">
              <SettingsDropdown onNavigate={() => setIsOpen(false)} />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
