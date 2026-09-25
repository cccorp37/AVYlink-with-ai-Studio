import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Link2,
  Palette,
  BarChart3,
  Settings,
  LogOut,
  Eye,
  ChevronLeft,
  ChevronRight,
  Shield,
  LayoutTemplate,
  Plug,
  Sparkles,
  MessageSquare,
  Users,
  Zap,
  Activity,
  FileCode,
  Wallet,
  ShoppingBag,
  Crown,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { signOut } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Tables } from "@/lib/types";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { PageSwitcher } from "./PageSwitcher";
import { useLanguage } from "@/hooks/useLanguage";

type Profile = Tables<"profiles"> & { is_verified?: boolean | null };

const navItemsRaw = [
  { to: "/dashboard", key: "overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/page", key: "my_page", icon: User },
  { to: "/dashboard/liens", key: "links", icon: Link2 },
  { to: "/dashboard/boutique", key: "shop", icon: ShoppingBag },
  { to: "/dashboard/modeles", key: "templates", icon: LayoutTemplate },
  { to: "/dashboard/apparence", key: "appearance", icon: Palette },
  { to: "/dashboard/integrations", key: "integrations", icon: Plug },
  { to: "/dashboard/analytics", key: "analytics", icon: BarChart3 },
  { to: "/dashboard/heatmap", key: "heatmap", icon: Activity },
  { to: "/dashboard/portefeuille", key: "wallet", icon: Wallet },
  { to: "/dashboard/abonnement", key: "subscription", icon: Crown },
  { to: "/dashboard/equipe", key: "team", icon: Users },
  { to: "/dashboard/api", key: "api", icon: Zap },
  { to: "/dashboard/support", key: "support", icon: MessageSquare },
  { to: "/dashboard/aide", key: "help", icon: BookOpen },
  { to: "/dashboard/parametres", key: "settings", icon: Settings },
];

interface Props {
  profile: Profile | null;
  profiles: Profile[];
  onSwitchProfile: (p: Profile) => void;
  onProfileCreated: (p: Profile) => void;
  onProfileDeleted: (id: string) => void;
}

export function DashboardSidebar({
  profile,
  profiles,
  onSwitchProfile,
  onProfileCreated,
  onProfileDeleted,
}: Props) {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useLanguage();
  const navItems = navItemsRaw.map((n) => ({ ...n, label: t(n.key) }));

  const profileUrl = profile?.username
    ? `${window.location.origin}/u/${profile.username}`
    : null;

  const isPremium = profile?.plan && profile.plan !== "free";

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-border/50 transition-all duration-300 relative flex-shrink-0 ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
      style={{
        background:
          "linear-gradient(180deg, hsl(var(--card)) 0%, hsl(210, 20%, 98%) 100%)",
      }}
    >
      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-7 w-7 h-7 rounded-full bg-card border border-border/60 shadow-md flex items-center justify-center z-10 hover:border-primary/40 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </motion.button>

      {/* Logo */}
      <div
        className={`flex items-center gap-2.5 px-5 h-16 border-b border-border/40 flex-shrink-0 ${collapsed ? "justify-center px-3" : ""}`}
      >
        <div className="relative">
          <img
            src="/icon-192.jpg"
            alt="AvyLink"
            className="w-9 h-9 rounded-xl object-cover flex-shrink-0 shadow-sm"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-card" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-dm font-bold text-lg text-foreground"
            >
              Avy<span className="text-gradient">Link</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-shrink-0 border-b border-border/40 py-2">
        <PageSwitcher
          profiles={profiles}
          activeProfile={profile}
          onSwitch={onSwitchProfile}
          onCreated={onProfileCreated}
          onDeleted={onProfileDeleted}
          collapsed={collapsed}
        />
      </div>

      <div className="mx-3 h-px bg-border/40" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {navItems.map((item) => {
          const isActive = item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={collapsed ? item.label : undefined}
              className="block"
            >
              <motion.div
                whileHover={{ x: collapsed ? 0 : 3 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                } ${collapsed ? "justify-center" : ""}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(204 94% 52% / 0.1), hsl(204 94% 52% / 0.05))",
                      border: "1px solid hsl(204 94% 52% / 0.15)",
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full gradient-cta"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon
                  className={`w-[18px] h-[18px] flex-shrink-0 relative z-10 ${isActive ? "text-primary" : ""}`}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="relative z-10 whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </NavLink>
          );
        })}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="my-3 mx-3 h-px bg-border/50" />
            {!collapsed && (
              <div className="px-4 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-destructive/70">
                  Administration
                </span>
              </div>
            )}
            {[
              {
                to: "/dashboard/admin",
                label: "Vue d'ensemble",
                icon: Shield,
                end: true,
              },
              {
                to: "/dashboard/admin/users",
                label: "Utilisateurs",
                icon: Users,
              },
              {
                to: "/dashboard/admin/analytics",
                label: "Analytics",
                icon: BarChart3,
              },
              {
                to: "/dashboard/admin/notifications",
                label: "Notifications",
                icon: MessageSquare,
              },
              {
                to: "/dashboard/admin/maintenance",
                label: "Maintenance",
                icon: Settings,
              },
              {
                to: "/dashboard/admin/tickets",
                label: "Tickets",
                icon: MessageSquare,
              },
              {
                to: "/dashboard/admin/source-code",
                label: "Code Source",
                icon: FileCode,
              },
            ].map((item) => {
              const isActive = item.end
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to) &&
                  item.to !== "/dashboard/admin";
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={collapsed ? item.label : undefined}
                  className="block"
                >
                  <motion.div
                    whileHover={{ x: collapsed ? 0 : 3 }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                      isActive
                        ? "text-destructive"
                        : "text-muted-foreground hover:text-destructive"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-admin-active"
                        className="absolute inset-0 rounded-xl bg-destructive/10 border border-destructive/15"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-admin-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-destructive"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <item.icon className="w-[18px] h-[18px] flex-shrink-0 relative z-10" />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="relative z-10 whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      {/* View profile link */}
      {!collapsed && profileUrl && (
        <div className="px-3 py-2">
          <motion.a
            whileHover={{ scale: 1.01 }}
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-muted-foreground hover:text-primary glass-blue transition-all"
          >
            <Eye className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Voir mon profil public</span>
          </motion.a>
        </div>
      )}

      {/* Upgrade CTA */}
      {!isPremium && !collapsed && !isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-3 mb-3 p-4 rounded-2xl relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, hsl(204 94% 52% / 0.08), hsl(338 85% 65% / 0.06))",
            border: "1px solid hsl(204 94% 52% / 0.12)",
          }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-2 mb-2 relative">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary">
              Passer à Premium
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed relative">
            Débloque analytics avancés, thèmes premium et domaine custom.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/dashboard/abonnement")}
            className="w-full py-2 text-xs font-bold gradient-cta text-primary-foreground rounded-xl shadow-blue"
          >
            Voir les plans ✨
          </motion.button>
        </motion.div>
      )}

      {/* Admin badge */}
      {isAdmin && !collapsed && (
        <div className="mx-3 mb-3 p-3 rounded-2xl bg-destructive/5 border border-destructive/15">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-destructive" />
            <span className="text-xs font-bold text-destructive">
              Accès Admin
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Toutes les fonctionnalités débloquées.
          </p>
        </div>
      )}

      {/* User footer */}
      <div
        className={`border-t border-border/40 px-3 py-3 flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}
      >
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0 shadow-sm">
          {(profile?.display_name || user?.email || "U")[0].toUpperCase()}
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="flex-1 min-w-0 flex items-center gap-2"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {profile?.display_name || user?.email?.split("@")[0]}
                  </p>
                  {profile?.is_verified && (
                    <VerifiedBadge
                      style={(profile as any).verified_badge_style}
                      size="sm"
                    />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {isAdmin
                    ? "Administrateur"
                    : profile?.plan === "free"
                      ? "Plan gratuit"
                      : profile?.plan || "free"}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={async () => {
                  await signOut();
                  navigate("/");
                }}
                className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
