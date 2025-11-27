import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings2, ChevronDown, Sun, Moon, Monitor, LogIn, LogOut, Shield, Home, Check } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

interface SettingsDropdownProps {
  showViewSite?: boolean;
  onNavigate?: () => void;
}

const SettingsDropdown = ({ showViewSite = false, onNavigate }: SettingsDropdownProps) => {
  const { theme, setTheme } = useTheme();
  const { currentLanguage, languages, setLanguage, t } = useLanguage();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = () => {
    onNavigate?.();
    navigate("/auth");
  };

  const handleAdminClick = () => {
    onNavigate?.();
    navigate("/admin");
  };

  const handleViewSite = () => {
    onNavigate?.();
    navigate("/");
  };

  const themeOptions: { value: "light" | "dark" | "system"; label: string; icon: typeof Sun }[] = [
    { value: "light", label: t('settings.light') === 'settings.light' ? "Light" : t('settings.light'), icon: Sun },
    { value: "dark", label: t('settings.dark') === 'settings.dark' ? "Dark" : t('settings.dark'), icon: Moon },
    { value: "system", label: t('settings.system') === 'settings.system' ? "System" : t('settings.system'), icon: Monitor },
  ];

  const currentLang = languages.find(l => l.code === currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <Settings2 className="h-4 w-4" />
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border border-border z-50">
        {/* Theme Sub-menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <Sun className="h-4 w-4 mr-2" />
            <span>{t('settings.theme') === 'settings.theme' ? "Theme" : t('settings.theme')}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-popover border border-border">
            {themeOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setTheme(option.value)}
                className="cursor-pointer"
              >
                <option.icon className="h-4 w-4 mr-2" />
                <span>{option.label}</span>
                {theme === option.value && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Language Sub-menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <span className="mr-2 text-sm">🌐</span>
            <span>{t('settings.language') === 'settings.language' ? "Language" : t('settings.language')}</span>
            <span className="ml-auto text-xs text-muted-foreground">{currentLang?.native_name}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-popover border border-border">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className="cursor-pointer"
              >
                <span>{lang.native_name}</span>
                <span className="ml-2 text-xs text-muted-foreground">({lang.name})</span>
                {currentLanguage === lang.code && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Auth Section */}
        {user ? (
          <>
            {isAdmin && !showViewSite && (
              <DropdownMenuItem onClick={handleAdminClick} className="cursor-pointer">
                <Shield className="h-4 w-4 mr-2" />
                <span>{t('nav.admin') === 'nav.admin' ? "Admin Panel" : t('nav.admin')}</span>
              </DropdownMenuItem>
            )}
            {showViewSite && (
              <DropdownMenuItem onClick={handleViewSite} className="cursor-pointer">
                <Home className="h-4 w-4 mr-2" />
                <span>{t('nav.view_site') === 'nav.view_site' ? "View Site" : t('nav.view_site')}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={signOut} className="cursor-pointer">
              <LogOut className="h-4 w-4 mr-2" />
              <span>{t('nav.sign_out') === 'nav.sign_out' ? "Sign Out" : t('nav.sign_out')}</span>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={handleSignIn} className="cursor-pointer">
            <LogIn className="h-4 w-4 mr-2" />
            <span>{t('nav.sign_in') === 'nav.sign_in' ? "Sign In" : t('nav.sign_in')}</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsDropdown;
