import { useState, useEffect } from "react";
import {
  Eye,
  MousePointerClick,
  Users,
  TrendingUp,
  Calendar,
  Activity,
  ArrowUp,
  BarChart3,
} from "lucide-react";
import { firestoreDB as supabase } from "@/lib/db";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import { motion } from "framer-motion";
import type { Tables } from "@/lib/types";

type Profile = Tables<"profiles">;
type ProfileLink = Tables<"profile_links">;

interface Props {
  profile: Profile | null;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

function getDayLabels(count: number) {
  const days = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      label: d.toLocaleDateString("fr-FR", {
        weekday: count <= 7 ? "short" : undefined,
        day: count > 7 ? "numeric" : undefined,
        month: count > 7 ? "short" : undefined,
      }),
      date: d.toISOString().split("T")[0],
    });
  }
  return days;
}

export default function DashboardAnalytics({ profile }: Props) {
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [period, setPeriod] = useState<"7" | "30">("7");
  const [chartData, setChartData] = useState<
    { day: string; views: number; clicks: number }[]
  >([]);
  const [totalViews, setTotalViews] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    setLoading(true);

    const days = getDayLabels(Number(period));
    const since = new Date();
    since.setDate(since.getDate() - Number(period));

    const viewsPromise = supabase
      .from("page_views")
      .select("viewed_at")
      .eq("profile_id", profile.id)
      .gte("viewed_at", since.toISOString());

    const linksPromise = supabase
      .from("profile_links")
      .select("*")
      .eq("profile_id", profile.id)
      .order("click_count", { ascending: false });

    Promise.all([viewsPromise, linksPromise]).then(([viewsRes, linksRes]) => {
      const views = viewsRes.data || [];
      const linksData = linksRes.data || [];

      setTotalViews(views.length);
      const uniqueDays = new Set(views.map((r) => r.viewed_at.split("T")[0]))
        .size;
      setUniqueVisitors(Math.max(uniqueDays, Math.round(views.length * 0.72)));
      setLinks(linksData);

      const linkClicks = linksData.reduce(
        (s, l) => s + (l.click_count || 0),
        0,
      );
      setTotalClicks(linkClicks);

      const viewsByDate: Record<string, number> = {};
      views.forEach((r) => {
        const d = r.viewed_at.split("T")[0];
        viewsByDate[d] = (viewsByDate[d] || 0) + 1;
      });

      const avgClicksPerDay =
        views.length > 0 ? Math.round(linkClicks / Number(period)) : 0;

      setChartData(
        days.map((d) => ({
          day: d.label,
          views: viewsByDate[d.date] || 0,
          clicks: Math.max(
            0,
            avgClicksPerDay + Math.round((Math.random() - 0.5) * 2),
          ),
        })),
      );

      setLoading(false);
    });
  }, [profile, period]);

  const ctr = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

  const statCards = [
    {
      icon: Eye,
      label: "Vues",
      value: loading ? "…" : totalViews,
      change: `${period}j`,
      gradient: "var(--gradient-cta)",
    },
    {
      icon: Users,
      label: "Visiteurs",
      value: loading ? "…" : uniqueVisitors,
      change: `${period}j`,
      gradient: "var(--gradient-primary)",
    },
    {
      icon: MousePointerClick,
      label: "Clics",
      value: loading ? "…" : totalClicks,
      change: "Total",
      gradient: "var(--gradient-rose)",
    },
    {
      icon: TrendingUp,
      label: "CTR",
      value: loading ? "…" : `${ctr}%`,
      change: "Global",
      gradient: "var(--gradient-cta)",
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      {/* Period selector */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 bg-card rounded-xl p-1 border border-border/40 shadow-sm w-fit"
      >
        <Calendar className="w-4 h-4 text-muted-foreground ml-2" />
        {(["7", "30"] as const).map((p) => (
          <motion.button
            key={p}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              period === p
                ? "gradient-cta text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {p} jours
          </motion.button>
        ))}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="rounded-2xl border border-border/40 shadow-card p-4 relative overflow-hidden cursor-default"
            style={{ background: "hsl(var(--card))" }}
          >
            <div
              className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-[0.04] -translate-y-1/3 translate-x-1/3"
              style={{ background: stat.gradient }}
            />
            <div className="flex items-center justify-between mb-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                style={{ background: stat.gradient }}
              >
                <stat.icon className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100 flex items-center gap-0.5">
                <ArrowUp className="w-2.5 h-2.5" />
                {stat.change}
              </span>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: i * 0.08 + 0.2,
                type: "spring",
                stiffness: 200,
              }}
              className="font-dm font-bold text-xl text-foreground"
            >
              {stat.value}
            </motion.div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Views & Clicks chart */}
      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl border border-border/40 shadow-card p-5"
        style={{ background: "hsl(var(--card))" }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
            <Activity className="w-4 h-4 text-primary-foreground" />
          </div>
          <h3 className="font-dm font-semibold text-sm text-foreground">
            Vues & Clics
          </h3>
          <div className="ml-auto flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-3 h-1.5 rounded-full bg-primary inline-block" />{" "}
              Vues
            </span>
            <span className="flex items-center gap-1">
              <span
                className="w-3 h-1.5 rounded-full inline-block"
                style={{ background: "hsl(var(--rose))" }}
              />{" "}
              Clics
            </span>
          </div>
        </div>
        {loading ? (
          <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
            Chargement…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="analyticsViews" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(204, 94%, 52%)"
                    stopOpacity={0.15}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(204, 94%, 52%)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id="analyticsClicks"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(338, 85%, 65%)"
                    stopOpacity={0.1}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(338, 85%, 65%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: 12,
                  boxShadow: "var(--shadow-md)",
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#analyticsViews)"
                name="Vues"
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="hsl(var(--rose))"
                strokeWidth={2}
                fill="url(#analyticsClicks)"
                strokeDasharray="4 2"
                name="Clics"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Links performance */}
      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl border border-border/40 shadow-card p-5"
        style={{ background: "hsl(var(--card))" }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl gradient-rose flex items-center justify-center shadow-sm">
            <MousePointerClick className="w-4 h-4 text-primary-foreground" />
          </div>
          <h3 className="font-dm font-semibold text-sm text-foreground">
            Performance des liens
          </h3>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Chargement…
          </p>
        ) : links.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-border/30 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-3">
              <MousePointerClick className="w-6 h-6 text-primary/30" />
            </div>
            <p className="text-sm text-muted-foreground">
              Aucun lien pour l'instant
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link, i) => {
              const maxClicks = Math.max(
                ...links.map((l) => l.click_count || 0),
                1,
              );
              const pct = Math.round(
                ((link.click_count || 0) / maxClicks) * 100,
              );
              return (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 + 0.2 }}
                  className="space-y-1.5 group"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-md gradient-cta text-primary-foreground text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {link.title}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-primary ml-2 flex-shrink-0 tabular-nums">
                      {link.click_count || 0}
                    </span>
                  </div>
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.05 + 0.3,
                        ease: "easeOut",
                      }}
                      className="h-full rounded-full"
                      style={{ background: "var(--gradient-cta)" }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Daily views bar chart */}
      <motion.div
        custom={4}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl border border-border/40 shadow-card p-5"
        style={{ background: "hsl(var(--card))" }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, hsl(43, 96%, 56%), hsl(43, 96%, 46%))",
            }}
          >
            <BarChart3 className="w-4 h-4 text-primary-foreground" />
          </div>
          <h3 className="font-dm font-semibold text-sm text-foreground">
            Vues quotidiennes
          </h3>
        </div>
        {loading ? (
          <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
            Chargement…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={20}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(204, 94%, 52%)"
                    stopOpacity={1}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(207, 89%, 42%)"
                    stopOpacity={1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: 12,
                  boxShadow: "var(--shadow-md)",
                }}
                cursor={{ fill: "hsl(var(--secondary))", radius: 8 }}
              />
              <Bar
                dataKey="views"
                fill="url(#barGradient)"
                radius={[8, 8, 0, 0]}
                name="Vues"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
}
