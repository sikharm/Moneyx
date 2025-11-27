import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./components/ThemeProvider";
import Navigation from "@/components/Navigation";
import ChatWidget from "@/components/ChatWidget";
import Home from "./pages/Home";
import About from "./pages/About";
import AutoMode from "./pages/AutoMode";
import HybridMode from "./pages/HybridMode";
import Performance from "./pages/Performance";
import Download from "./pages/Download";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import FileManagement from "./pages/admin/FileManagement";
import Translations from "./pages/admin/Translations";
import ChatSupport from "./pages/admin/ChatSupport";
import ContactMessages from "./pages/admin/ContactMessages";
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
              <Navigation />
              <ChatWidget />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/auto-mode" element={<AutoMode />} />
                <Route path="/hybrid-mode" element={<HybridMode />} />
                <Route path="/performance" element={<Performance />} />
                <Route path="/download" element={<Download />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="files" element={<FileManagement />} />
                  <Route path="translations" element={<Translations />} />
                  <Route path="chat" element={<ChatSupport />} />
                  <Route path="messages" element={<ContactMessages />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </LanguageProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;