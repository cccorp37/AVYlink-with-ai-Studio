import { useEffect, useState } from "react";
import { firestoreDB as supabase } from "@/lib/db";
import {
  Users,
  Link2,
  Star,
  UserCheck,
  MessageSquare,
  Ban,
  Bell,
  Eye,
  Clock,
  UserPlus,
  Activity,
  Download,
  FileCode,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Stats {
  totalUsers: number;
  totalLinks: number;
  totalViews: number;
  premiumUsers: number;
  todaySignups: number;
  openTickets: number;
  bannedUsers: number;
  suspendedUsers: number;
  activeNotifications: number;
  todayViews: number;
}

export default function AdminOverview() {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalLinks: 0,
    totalViews: 0,
    premiumUsers: 0,
    todaySignups: 0,
    openTickets: 0,
    bannedUsers: 0,
    suspendedUsers: 0,
    activeNotifications: 0,
    todayViews: 0,
  });
  const [recentProfiles, setRecentProfiles] = useState<
    {
      id: string;
      display_name: string | null;
      username: string | null;
      plan: string;
      created_at: string;
      status: string;
    }[]
  >([]);
  const [recentTickets, setRecentTickets] = useState<
    {
      id: string;
      subject: string;
      priority: string;
      status: string;
      created_at: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();

    const [
      { count: userCount },
      { count: linkCount },
      { count: premiumCount },
      { count: todaySignups },
      { count: openTickets },
      { count: bannedCount },
      { count: suspendedCount },
      { count: activeNotifs },
      { count: todayViews },
      { data: profiles },
      { data: tickets },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("profile_links")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .neq("plan", "free"),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayISO),
      supabase
        .from("support_tickets")
        .select("*", { count: "exact", head: true })
        .eq("status", "open"),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", "banned"),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", "suspended"),
      supabase
        .from("admin_notifications")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("page_views")
        .select("*", { count: "exact", head: true })
        .gte("viewed_at", todayISO),
      supabase
        .from("profiles")
        .select("id, display_name, username, plan, created_at, status")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("support_tickets")
        .select("id, subject, priority, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    setStats({
      totalUsers: userCount || 0,
      totalLinks: linkCount || 0,
      totalViews: todayViews || 0,
      premiumUsers: premiumCount || 0,
      todaySignups: todaySignups || 0,
      openTickets: openTickets || 0,
      bannedUsers: bannedCount || 0,
      suspendedUsers: suspendedCount || 0,
      activeNotifications: activeNotifs || 0,
      todayViews: todayViews || 0,
    });
    setRecentProfiles((profiles as typeof recentProfiles) || []);
    setRecentTickets((tickets as typeof recentTickets) || []);
    setLoading(false);
    setLastRefresh(new Date());
  };

  useEffect(() => {
    load();
    // Auto-refresh every 30s
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "profiles" },
        () => load(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_tickets" },
        () => load(),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "page_views" },
        () => {
          setStats((prev) => ({ ...prev, todayViews: prev.todayViews + 1 }));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const mainCards = [
    {
      icon: Users,
      label: "Utilisateurs totaux",
      value: stats.totalUsers,
      color: "gradient-cta",
      sub: `${stats.premiumUsers} premium`,
    },
    {
      icon: UserPlus,
      label: "Inscrits aujourd'hui",
      value: stats.todaySignups,
      color: "gradient-primary",
      sub: "Nouvelles inscriptions",
      highlight: stats.todaySignups > 0,
    },
    {
      icon: Eye,
      label: "Vues aujourd'hui",
      value: stats.todayViews,
      color: "gradient-rose",
      sub: "Pages visitées",
    },
    {
      icon: UserCheck,
      label: "Taux conversion",
      value:
        stats.totalUsers > 0
          ? `${Math.round((stats.premiumUsers / stats.totalUsers) * 100)}%`
          : "0%",
      color: "gradient-cta",
      sub: "Free → Premium",
    },
  ];

  const secondaryCards = [
    {
      icon: MessageSquare,
      label: "Tickets ouverts",
      value: stats.openTickets,
      color: stats.openTickets > 0 ? "bg-destructive/10" : "bg-muted",
      textColor:
        stats.openTickets > 0 ? "text-destructive" : "text-muted-foreground",
      urgent: stats.openTickets > 0,
    },
    {
      icon: Ban,
      label: "Comptes bannis",
      value: stats.bannedUsers,
      color: "bg-destructive/10",
      textColor: "text-destructive",
    },
    {
      icon: Clock,
      label: "Comptes suspendus",
      value: stats.suspendedUsers,
      color: "bg-yellow-500/10",
      textColor: "text-yellow-600",
    },
    {
      icon: Bell,
      label: "Notifications actives",
      value: stats.activeNotifications,
      color: "bg-primary/10",
      textColor: "text-primary",
    },
    {
      icon: Link2,
      label: "Liens créés",
      value: stats.totalLinks,
      color: "bg-muted",
      textColor: "text-muted-foreground",
    },
    {
      icon: Star,
      label: "Comptes Premium",
      value: stats.premiumUsers,
      color: "bg-primary/10",
      textColor: "text-primary",
    },
  ];

  const priorityStyles: Record<string, string> = {
    urgent: "bg-destructive/10 text-destructive",
    high: "bg-yellow-500/10 text-yellow-600",
    normal: "bg-primary/10 text-primary",
    low: "bg-muted text-muted-foreground",
  };

  const statusLabels: Record<string, string> = {
    active: "Actif",
    suspended: "Suspendu",
    banned: "Banni",
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-500/10 text-green-600",
    suspended: "bg-yellow-500/10 text-yellow-600",
    banned: "bg-destructive/10 text-destructive",
  };

  const handleDownloadSource = async () => {
    setDownloading(true);
    try {
      const modules = import.meta.glob(
        [
          "/index.html",
          "/README.md",
          "/package.json",
          "/vite.config.ts",
          "/tailwind.config.ts",
          "/tsconfig.json",
          "/tsconfig.app.json",
          "/tsconfig.node.json",
          "/components.json",
          "/postcss.config.js",
          "/eslint.config.js",
          "/vitest.config.ts",
          "/src/**/*.{tsx,ts,css,html}",
          "/supabase-legacy-reference/**/*.{ts,json,toml}",
          "/public/robots.txt",
          "!**/node_modules/**",
        ],
        { query: "?raw", import: "default", eager: true },
      ) as Record<string, string>;
      const entries = Object.entries(modules).sort(([a], [b]) =>
        a.localeCompare(b),
      );
      let doc = `// AvyLink - Code Source Complet\n// Généré le ${new Date().toLocaleString("fr-FR")}\n// ${entries.length} fichiers\n\n`;
      for (const [path, content] of entries) {
        doc += `${"=".repeat(80)}\n// FILE: ${path}\n${"=".repeat(80)}\n\n${content}\n\n`;
      }
      const blob = new Blob([doc], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `avylink-source-${new Date().toISOString().split("T")[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-dm font-bold text-2xl text-foreground">
            Tableau de bord Admin 🛡️
          </h2>
          <p className="text-muted-foreground text-sm">
            Vue globale en temps réel de la plateforme AvyLink
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSource}
            disabled={downloading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Code source
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
          <span className="text-[11px] text-muted-foreground hidden sm:block">
            {lastRefresh.toLocaleTimeString("fr-FR")}
          </span>
        </div>
      </div>

      {/* Main stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mainCards.map((card) => (
          <div
            key={card.label}
            className={`bg-card rounded-2xl p-5 border border-border/50 shadow-card transition-all ${card.highlight ? "ring-2 ring-primary/20" : ""}`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}
            >
              <card.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="font-dm font-bold text-2xl text-foreground">
              {loading ? "..." : card.value}
            </div>
            <div className="text-sm font-medium text-foreground">
              {card.label}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {secondaryCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl p-4 border border-border/50 bg-card text-center ${card.urgent ? "ring-1 ring-destructive/30" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${card.color}`}
            >
              <card.icon className={`w-4 h-4 ${card.textColor}`} />
            </div>
            <div className={`font-dm font-bold text-lg ${card.textColor}`}>
              {loading ? "..." : card.value}
            </div>
            <div className="text-[11px] text-muted-foreground leading-tight">
              {card.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent users */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-dm font-semibold text-base text-foreground">
              Derniers inscrits
            </h3>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : recentProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Aucun utilisateur
            </p>
          ) : (
            <div className="divide-y divide-border/50">
              {recentProfiles.map((p) => (
                <div key={p.id} className="flex items-center gap-3 py-2.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0 ${p.status === "banned" ? "bg-destructive" : p.status === "suspended" ? "bg-yellow-500" : "gradient-primary"}`}
                  >
                    {(p.display_name || p.username || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {p.display_name || "Sans nom"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      @{p.username || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {p.status !== "active" && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${statusColors[p.status] || ""}`}
                      >
                        {statusLabels[p.status]}
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${p.plan !== "free" ? "gradient-cta text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {p.plan}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent tickets */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-dm font-semibold text-base text-foreground">
              Derniers tickets
            </h3>
            {stats.openTickets > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-destructive/10 text-destructive">
                {stats.openTickets} ouvert(s)
              </span>
            )}
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : recentTickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Aucun ticket</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {recentTickets.map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-2.5">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${t.status === "open" ? "bg-destructive" : t.status === "in_progress" ? "bg-yellow-500" : "bg-green-500"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {t.subject}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(t.created_at).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${priorityStyles[t.priority] || priorityStyles.normal}`}
                    >
                      {t.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
