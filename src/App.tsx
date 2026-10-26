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
import { OfflineIndicator } from "@/components/OfflineIndicator";

const queryClient = new QueryClient();

function isPublicPortfolioPath(pathname: string): boolean {
  if (
    pathname.startsWith("/u/") ||
    pathname.startsWith("/@") ||
    pathname.startsWith("/p/") ||
    pathname.startsWith("/portfolio/")
  ) {
    return true;
  }
  const clean = pathname.replace(/^\/+|\/+$/g, "");
  if (
    clean &&
    !clean.includes("/") &&
    !["dashboard", "admin", "install", "installer"].includes(
      clean.toLowerCase(),
    )
  ) {
    return true;
  }
  return false;
}

const App = () => {
  const [splashDone, setSplashDone] = useState(() => {
    if (typeof window !== "undefined") {
      if (isPublicPortfolioPath(window.location.pathname)) {
        return true;
      }
      return sessionStorage.getItem("splashShown") === "true";
    }
    return true;
  });

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
              <OfflineIndicator />
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
                    <Route path="/p/:username" element={<PublicProfile />} />
                    <Route
                      path="/portfolio/:username"
                      element={<PublicProfile />}
                    />
                    <Route path="/install" element={<InstallApp />} />
                    <Route path="/installer" element={<InstallApp />} />
                    <Route path="/:username" element={<PublicProfile />} />
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
