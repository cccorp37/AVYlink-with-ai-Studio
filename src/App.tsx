import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import PublicProfile from "./pages/PublicProfile";
import NotFound from "./pages/NotFound";

import InstallApp from "./pages/InstallApp";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import SplashScreen from "@/components/SplashScreen";
import { MaintenanceGuard } from "@/components/MaintenanceGuard";

const queryClient = new QueryClient();

const App = () => {
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem("splashShown") === "true",
  );
  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem("splashShown", "true");
    setSplashDone(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
      >
        <TooltipProvider>
          <AuthProvider>
            <LanguageProvider>
              <Toaster />
              <Sonner />
              {!splashDone && (
                <SplashScreen onComplete={handleSplashComplete} />
              )}
              <MaintenanceGuard>
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/dashboard/*" element={<Dashboard />} />
                    <Route
                      path="/admin/*"
                      element={<Navigate to="/dashboard/admin" replace />}
                    />
                    <Route path="/u/:username" element={<PublicProfile />} />
                    <Route path="/install" element={<InstallApp />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </MaintenanceGuard>
            </LanguageProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
