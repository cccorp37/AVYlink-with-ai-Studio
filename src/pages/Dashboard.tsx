import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { firestoreDB as supabase } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { NotificationBanner } from "@/components/NotificationBanner";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Tables } from "@/lib/types";
import { useLanguage } from "@/hooks/useLanguage";

// Sub-pages
import DashboardOverview from "./dashboard/DashboardOverview";
import DashboardPage from "./dashboard/DashboardPage";
import DashboardLinks from "./dashboard/DashboardLinks";
import DashboardAppearance from "./dashboard/DashboardAppearance";
import DashboardAnalytics from "./dashboard/DashboardAnalytics";
import DashboardSettings from "./dashboard/DashboardSettings";
import DashboardTemplates from "./dashboard/DashboardTemplates";
import DashboardIntegrations from "./dashboard/DashboardIntegrations";
import DashboardSupport from "./dashboard/DashboardSupport";
import DashboardTeam from "./dashboard/DashboardTeam";
import DashboardAPI from "./dashboard/DashboardAPI";
import DashboardHeatmap from "./dashboard/DashboardHeatmap";
import DashboardWallet from "./dashboard/DashboardWallet";
import DashboardStore from "./dashboard/DashboardStore";
import DashboardSubscription from "./dashboard/DashboardSubscription";
import DashboardHelp from "./dashboard/DashboardHelp";


// Admin sub-pages
import AdminOverview from "./admin/AdminOverview";
import AdminUsers from "./admin/AdminUsers";
import AdminAnalytics from "./admin/AdminAnalytics";
import AdminNotifications from "./admin/AdminNotifications";
import AdminMaintenance from "./admin/AdminMaintenance";
import AdminTickets from "./admin/AdminTickets";
import AdminSourceCode from "./admin/AdminSourceCode";
import { useAdmin } from "@/hooks/useAdmin";

type Profile = Tables<"profiles">;

const getPageTitles = (t: (k: string) => string): Record<string, string> => ({
  "/dashboard": t("overview"),
  "/dashboard/page": t("my_page"),
  "/dashboard/liens": t("links"),
  "/dashboard/apparence": t("appearance"),
  "/dashboard/analytics": t("analytics"),
  "/dashboard/parametres": t("settings"),
  "/dashboard/modeles": t("templates"),
  "/dashboard/integrations": t("integrations"),
  "/dashboard/support": t("support"),
  "/dashboard/aide": t("help"),
  "/dashboard/equipe": t("team"),
  "/dashboard/api": t("api"),
  "/dashboard/heatmap": t("heatmap"),
  "/dashboard/portefeuille": t("wallet"),
  "/dashboard/boutique": t("shop"),
  "/dashboard/abonnement": t("subscription"),
  "/dashboard/admin": "Administration",
  "/dashboard/admin/users": "Utilisateurs",
  "/dashboard/admin/analytics": "Analytics Admin",
  "/dashboard/admin/notifications": "Notifications",
  "/dashboard/admin/maintenance": "Maintenance",
  "/dashboard/admin/tickets": "Tickets Support",
  "/dashboard/admin/source-code": "Code Source",
});

const ease = [0.22, 1, 0.36, 1] as const;
const pageVariants = {
  initial: { opacity: 0, x: 20, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease },
  },
  exit: {
    opacity: 0,
    x: -20,
    filter: "blur(4px)",
    transition: { duration: 0.2, ease },
  },
};

function AnimatedPage({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex-1 overflow-y-auto pb-20 md:pb-6"
    >
      {children}
    </motion.div>
  );
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const profile =
    profiles.find((p) => p.id === activeProfileId) || profiles[0] || null;
  const { t } = useLanguage();
  const currentTitle = getPageTitles(t)[location.pathname] || "Dashboard";

  useEffect(() => {
    if (!loading && !user) {
      supabase.auth.getSession().then(({ data: { session: freshSession } }) => {
        if (!freshSession?.user) {
          navigate("/", { replace: true });
        }
      });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    const loadProfiles = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      const list = data || [];
      setProfiles(list);
      // Restore last active or pick first
      const stored = localStorage.getItem("avylink_active_profile");
      const found = list.find((p) => p.id === stored);
      setActiveProfileId(found?.id || list[0]?.id || null);
      setProfileLoading(false);
    };
    loadProfiles();
  }, [user]);

  const switchProfile = (p: Profile) => {
    setActiveProfileId(p.id);
    localStorage.setItem("avylink_active_profile", p.id);
  };

  const handleProfileCreated = (newProfile: Profile) => {
    setProfiles((prev) => [...prev, newProfile]);
    switchProfile(newProfile);
  };

  const handleProfileDeleted = (profileId: string) => {
    setProfiles((prev) => {
      const next = prev.filter((p) => p.id !== profileId);
      if (activeProfileId === profileId && next.length > 0) {
        switchProfile(next[0]);
      }
      return next;
    });
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    const { data } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profile.id)
      .select()
      .single();
    if (data) {
      setProfiles((prev) => prev.map((p) => (p.id === data.id ? data : p)));
    }
  };

  if (loading || profileLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--gradient-hero)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">
            Chargement...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex w-full"
      style={{ background: "hsl(210, 20%, 98%)" }}
    >
      <DashboardSidebar
        profile={profile}
        profiles={profiles}
        onSwitchProfile={switchProfile}
        onProfileCreated={handleProfileCreated}
        onProfileDeleted={handleProfileDeleted}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <DashboardTopbar profile={profile} title={currentTitle} />
        <NotificationBanner />

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <AnimatedPage>
                  <DashboardOverview profile={profile} />
                </AnimatedPage>
              }
            />
            <Route
              path="/page"
              element={
                <AnimatedPage>
                  <DashboardPage profile={profile} onUpdate={updateProfile} />
                </AnimatedPage>
              }
            />
            <Route
              path="/liens"
              element={
                <AnimatedPage>
                  <DashboardLinks profile={profile} />
                </AnimatedPage>
              }
            />
            <Route
              path="/apparence"
              element={
                <AnimatedPage>
                  <DashboardAppearance
                    profile={profile}
                    onUpdate={updateProfile}
                  />
                </AnimatedPage>
              }
            />
            <Route
              path="/analytics"
              element={
                <AnimatedPage>
                  <DashboardAnalytics profile={profile} />
                </AnimatedPage>
              }
            />
            <Route
              path="/parametres"
              element={
                <AnimatedPage>
                  <DashboardSettings
                    profile={profile}
                    onUpdate={updateProfile}
                  />
                </AnimatedPage>
              }
            />
            <Route
              path="/modeles"
              element={
                <AnimatedPage>
                  <DashboardTemplates
                    profile={profile}
                    onUpdate={updateProfile}
                  />
                </AnimatedPage>
              }
            />
            <Route
              path="/integrations"
              element={
                <AnimatedPage>
                  <DashboardIntegrations
                    profile={profile}
                    onUpdate={updateProfile}
                  />
                </AnimatedPage>
              }
            />
            <Route
              path="/support"
              element={
                <AnimatedPage>
                  <DashboardSupport />
                </AnimatedPage>
              }
            />
            <Route
              path="/aide"
              element={
                <AnimatedPage>
                  <DashboardHelp />
                </AnimatedPage>
              }
            />
            <Route
              path="/equipe"
              element={
                <AnimatedPage>
                  <DashboardTeam profile={profile} />
                </AnimatedPage>
              }
            />
            <Route
              path="/api"
              element={
                <AnimatedPage>
                  <DashboardAPI />
                </AnimatedPage>
              }
            />
            <Route
              path="/heatmap"
              element={
                <AnimatedPage>
                  <DashboardHeatmap profile={profile} />
                </AnimatedPage>
              }
            />
            <Route
              path="/portefeuille"
              element={
                <AnimatedPage>
                  <DashboardWallet />
                </AnimatedPage>
              }
            />
            <Route
              path="/boutique"
              element={
                <AnimatedPage>
                  <DashboardStore profile={profile} />
                </AnimatedPage>
              }
            />
            <Route
              path="/abonnement"
              element={
                <AnimatedPage>
                  <DashboardSubscription profile={profile} />
                </AnimatedPage>
              }
            />

            {/* Admin routes */}
            {isAdmin && (
              <>
                <Route
                  path="/admin"
                  element={
                    <AnimatedPage>
                      <AdminOverview />
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AnimatedPage>
                      <AdminUsers />
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <AnimatedPage>
                      <AdminAnalytics />
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/admin/notifications"
                  element={
                    <AnimatedPage>
                      <AdminNotifications />
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/admin/maintenance"
                  element={
                    <AnimatedPage>
                      <AdminMaintenance />
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/admin/tickets"
                  element={
                    <AnimatedPage>
                      <AdminTickets />
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/admin/source-code"
                  element={
                    <AnimatedPage>
                      <AdminSourceCode />
                    </AnimatedPage>
                  }
                />
              </>
            )}
          </Routes>
        </AnimatePresence>

        <MobileBottomNav
          profiles={profiles}
          activeProfile={profile}
          onSwitchProfile={switchProfile}
          onProfileCreated={handleProfileCreated}
        />
      </div>
    </div>
  );
};

export default Dashboard;
