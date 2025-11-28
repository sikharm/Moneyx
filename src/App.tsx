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
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="files" element={<FileManagement />} />
                  <Route path="translations" element={<Translations />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              </AdminEditProvider>
            </LanguageProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
