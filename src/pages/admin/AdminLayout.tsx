import { useEffect } from "react";
import { useNavigate, Routes, Route, NavLink } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import {
  Loader2,
  LayoutDashboard,
  Users,
  Link2,
  BarChart3,
  Shield,
  LogOut,
  Bell,
  Wrench,
  MessageSquare,
  FileCode,
  ArrowLeft,
} from "lucide-react";
import { signOut } from "@/lib/auth";

import AdminOverview from "./AdminOverview";
import AdminUsers from "./AdminUsers";
import AdminLinks from "./AdminLinks";
import AdminAnalytics from "./AdminAnalytics";
import AdminSourceCode from "./AdminSourceCode";
import AdminNotifications from "./AdminNotifications";
import AdminMaintenance from "./AdminMaintenance";
import AdminTickets from "./AdminTickets";

const navItems = [
  { to: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Utilisateurs", icon: Users },
  { to: "/admin/links", label: "Liens", icon: Link2 },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/admin/tickets", label: "Tickets", icon: MessageSquare },
  { to: "/admin/source-code", label: "Code Source", icon: FileCode },
];

export default function AdminLayout() {
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/");
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex w-full bg-secondary/20">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-card border-r border-border flex-shrink-0">
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border">
          <img
            src="/icon-192.jpg"
            alt="AvyLink"
            className="w-8 h-8 rounded-xl object-cover"
          />
          <div>
            <span className="font-dm font-bold text-base text-foreground">
              Avy<span className="text-gradient">Link</span>
            </span>
            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-destructive text-destructive-foreground uppercase tracking-wider">
              Admin
            </span>
          </div>
        </div>

        {/* Back to dashboard */}
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2 px-5 py-3 text-xs text-muted-foreground hover:text-primary transition-colors border-b border-border/50"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour au Dashboard
        </NavLink>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border-l-[3px] ${
                  isActive
                    ? "bg-primary/10 text-primary border-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground border-transparent"
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mx-3 mb-3 p-3 rounded-2xl bg-destructive/5 border border-destructive/20">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-3.5 h-3.5 text-destructive" />
            <span className="text-xs font-semibold text-destructive">
              Accès Admin
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Session sécurisée. Ne partage jamais cet accès.
          </p>
        </div>

        <div className="border-t border-border px-3 py-3">
          <button
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-14 px-6 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2 md:hidden">
            <img
              src="/icon-192.jpg"
              alt="AvyLink"
              className="w-7 h-7 rounded-lg object-cover"
            />
            <span className="font-dm font-bold text-sm">Admin</span>
          </div>
          <div className="hidden md:block">
            <span className="text-xs text-muted-foreground font-medium">
              Panneau d'administration — Accès restreint
            </span>
          </div>
          <div className="flex items-center gap-2">
            <NavLink
              to="/dashboard"
              className="px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors hidden md:block"
            >
              ← Dashboard
            </NavLink>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full gradient-cta text-primary-foreground">
              Administrateur
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/links" element={<AdminLinks />} />
            <Route path="/analytics" element={<AdminAnalytics />} />
            <Route path="/notifications" element={<AdminNotifications />} />
            <Route path="/maintenance" element={<AdminMaintenance />} />
            <Route path="/tickets" element={<AdminTickets />} />
            <Route path="/source-code" element={<AdminSourceCode />} />
          </Routes>
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
          <div className="flex items-stretch overflow-x-auto">
            {navItems.slice(0, 6).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors min-w-[60px] ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
