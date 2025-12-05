import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AdminEditProvider } from "./contexts/AdminEditContext";
import { ThemeProvider } from "./components/ThemeProvider";
import Navigation from "@/components/Navigation";
import AdminEditToggle from "@/components/AdminEditToggle";
import ScrollToTop from "@/components/ScrollToTop";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import AutoMode from "./pages/AutoMode";
import HybridMode from "./pages/HybridMode";
import Performance from "./pages/Performance";
import Download from "./pages/Download";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import FileManagement from "./pages/admin/FileManagement";
import Translations from "./pages/admin/Translations";
import UserInvestments from "./pages/admin/UserInvestments";
import TradeTrackerLayout from "./pages/admin/trade-tracker/TradeTrackerLayout";
import TradeTrackerDashboard from "./pages/admin/trade-tracker/TradeTrackerDashboard";
import AccountsPage from "./pages/admin/trade-tracker/AccountsPage";
import SummaryPage from "./pages/admin/trade-tracker/SummaryPage";
import ExportPage from "./pages/admin/trade-tracker/ExportPage";
import SettingsPage from "./pages/admin/trade-tracker/SettingsPage";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import UserAccountsPage from "./pages/dashboard/AccountsPage";
import EarningsPage from "./pages/dashboard/EarningsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <LanguageProvider>
              <AdminEditProvider>
                <ScrollToTop />
                <Navigation />
                <AdminEditToggle />
              <div className="flex flex-col min-h-screen">
                <PageTransition>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/auto-mode" element={<AutoMode />} />
                    <Route path="/hybrid-mode" element={<HybridMode />} />
                    <Route path="/performance" element={<Performance />} />
                    <Route path="/download" element={<Download />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/profile" element={<Profile />} />
                    
                    {/* User Dashboard Routes */}
                    <Route path="/dashboard" element={<DashboardLayout />}>
                      <Route index element={<DashboardHome />} />
                      <Route path="accounts" element={<UserAccountsPage />} />
                      <Route path="earnings" element={<EarningsPage />} />
                    </Route>
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="files" element={<FileManagement />} />
                      <Route path="translations" element={<Translations />} />
                      <Route path="user-investments" element={<UserInvestments />} />
                    </Route>

                    {/* Trade Tracker Routes */}
                    <Route path="/admin/trade-tracker" element={<TradeTrackerLayout />}>
                      <Route index element={<TradeTrackerDashboard />} />
                      <Route path="accounts" element={<AccountsPage />} />
                      <Route path="summary" element={<SummaryPage />} />
                      <Route path="export" element={<ExportPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </Route>
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </PageTransition>
                <Footer />
              </div>
              </AdminEditProvider>
            </LanguageProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;