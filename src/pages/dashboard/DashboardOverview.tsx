import { useEffect, useState } from "react";
import {
  Eye,
  Users,
  MousePointerClick,
  TrendingUp,
  ArrowUp,
  Link2,
  Star,
  Zap,
  CheckCircle2,
  ArrowRight,
  Activity,
  Palette,
  ExternalLink,
  BarChart3,
  LayoutTemplate,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
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
} from "recharts";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  gradient,
  index,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub: string;
  gradient: string;
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative rounded-2xl p-5 border border-border/40 shadow-card overflow-hidden group cursor-default"
      style={{ background: "hsl(var(--card))" }}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.04] -translate-y-1/3 translate-x-1/3"
        style={{ background: gradient }}
      />
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm`}
          style={{ background: gradient }}
        >
          <Icon className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100">
          <ArrowUp className="w-2.5 h-2.5" />
          {sub}
        </span>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: index * 0.08 + 0.2,
          type: "spring",
          stiffness: 200,
        }}
        className="font-dm font-bold text-2xl text-foreground"
      >
        {value}
      </motion.div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </motion.div>
  );
}

function ProfileCompletion({ profile }: { profile: Profile | null }) {
  const steps = [
    { label: "Photo de profil", done: !!profile?.avatar_url },
    { label: "Nom d'affichage", done: !!profile?.display_name },
    { label: "Bio", done: !!profile?.bio },
    { label: "Nom d'utilisateur", done: !!profile?.username },
    { label: "Site web", done: !!profile?.website },
  ];
  const completed = steps.filter((s) => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);

  if (pct === 100) return null;

  return (
    <motion.div
      custom={1}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="rounded-2xl border border-border/40 shadow-card p-5 relative overflow-hidden"
      style={{ background: "hsl(var(--card))" }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-muted/50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
          className="h-full gradient-cta rounded-r-full"
        />
      </div>
      <div className="flex items-center justify-between mb-3 mt-1">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <h3 className="font-dm font-bold text-sm text-foreground">
            Complétion du profil
          </h3>
        </div>
        <span className="text-xs font-bold text-primary">{pct}%</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {steps.map((step) => (
          <div
            key={step.label}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all ${
              step.done
                ? "bg-green-50 text-green-700 border border-green-100"
                : "bg-muted/30 text-muted-foreground border border-border/30"
            }`}
          >
            <CheckCircle2
              className={`w-3.5 h-3.5 flex-shrink-0 ${step.done ? "text-green-500" : "text-muted-foreground/40"}`}
            />
            <span className="truncate">{step.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      label: d.toLocaleDateString("fr-FR", { weekday: "short" }),
      date: d.toISOString().split("T")[0],
    });
  }
  return days;
}

export default function DashboardOverview({ profile }: Props) {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [viewData, setViewData] = useState<{ day: string; views: number }[]>(
    [],
  );

  useEffect(() => {
    if (!profile) return;

    supabase
      .from("profile_links")
      .select("*")
      .eq("profile_id", profile.id)
      .order("click_count", { ascending: false })
      .limit(5)
      .then(({ data }) => setLinks(data || []));

    const since = new Date();
    since.setDate(since.getDate() - 7);

    supabase
      .from("page_views")
      .select("viewed_at, device")
      .eq("profile_id", profile.id)
      .gte("viewed_at", since.toISOString())
      .then(({ data }) => {
        const rows = data || [];
        setTotalViews(rows.length);
        const uniqueDays = new Set(rows.map((r) => r.viewed_at.split("T")[0]))
          .size;
        setUniqueVisitors(Math.max(uniqueDays, Math.round(rows.length * 0.72)));
        const days = getLast7Days();
        const countByDate: Record<string, number> = {};
        rows.forEach((r) => {
          const d = r.viewed_at.split("T")[0];
          countByDate[d] = (countByDate[d] || 0) + 1;
        });
        setViewData(
          days.map((d) => ({ day: d.label, views: countByDate[d.date] || 0 })),
        );
      });
  }, [profile]);

  const totalClicks = links.reduce((s, l) => s + (l.click_count || 0), 0);
  const ctr = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Bonjour"
      : now.getHours() < 18
        ? "Bon après-midi"
        : "Bonsoir";
  const displayName = profile?.display_name || profile?.username || "toi";
  const dateStr = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
      >
        <div>
          <h2 className="font-dm font-bold text-2xl md:text-3xl text-foreground">
            {greeting}, {displayName}{" "}
            <span className="inline-block animate-float">👋</span>
          </h2>
          <p className="text-muted-foreground text-sm capitalize mt-0.5">
            {dateStr}
          </p>
        </div>
        {profile?.username && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              navigator.clipboard.writeText(
                `${window.location.origin}/u/${profile.username}`,
              )
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-blue text-sm font-medium text-foreground hover:shadow-blue transition-all self-start"
          >
            <Link2 className="w-4 h-4 text-primary" />
            <span className="truncate">avylink.app/u/{profile.username}</span>
            <span className="text-xs text-primary font-semibold ml-1">
              Copier
            </span>
          </motion.button>
        )}
      </motion.div>

      {/* Profile completion */}
      <ProfileCompletion profile={profile} />

      {/* Admin quick access */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onClick={() => navigate("/dashboard/admin")}
          className="rounded-2xl p-5 border border-destructive/20 bg-destructive/5 cursor-pointer hover:bg-destructive/10 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-dm font-bold text-sm text-foreground">
                  Espace Administration
                </h3>
                <p className="text-xs text-muted-foreground">
                  Gérer les utilisateurs, notifications, maintenance…
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-destructive group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon={Eye}
          label="Vues (7j)"
          value={totalViews}
          sub="7 jours"
          gradient="var(--gradient-cta)"
          index={0}
        />
        <StatCard
          icon={Users}
          label="Visiteurs"
          value={uniqueVisitors}
          sub="7 jours"
          gradient="var(--gradient-primary)"
          index={1}
        />
        <StatCard
          icon={MousePointerClick}
          label="Clics"
          value={totalClicks}
          sub="Total"
          gradient="var(--gradient-rose)"
          index={2}
        />
        <StatCard
          icon={TrendingUp}
          label="CTR"
          value={`${ctr}%`}
          sub="Global"
          gradient="var(--gradient-cta)"
          index={3}
        />
      </div>

      {/* Chart */}
      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl border border-border/40 shadow-card p-5"
        style={{ background: "hsl(var(--card))" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="font-dm font-semibold text-sm text-foreground">
              Vues des 7 derniers jours
            </h3>
          </div>
          <button
            onClick={() => navigate("/dashboard/analytics")}
            className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
          >
            Voir tout <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={viewData}>
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(204, 94%, 52%)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(204, 94%, 52%)"
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
              cursor={{
                stroke: "hsl(var(--primary))",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              fill="url(#viewsGradient)"
              name="Vues"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top links */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="rounded-2xl border border-border/40 shadow-card p-5"
          style={{ background: "hsl(var(--card))" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-dm font-semibold text-sm text-foreground flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" /> Top Liens
            </h3>
            <button
              onClick={() => navigate("/dashboard/liens")}
              className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
            >
              Gérer <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {links.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-3">
                <Link2 className="w-6 h-6 text-primary/30" />
              </div>
              <p className="text-sm text-muted-foreground">Aucun lien encore</p>
              <button
                onClick={() => navigate("/dashboard/liens")}
                className="mt-3 text-xs text-primary font-semibold hover:underline"
              >
                Ajouter mon premier lien →
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {links.map((link, i) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.3 }}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-secondary/60 transition-colors group"
                >
                  <span className="w-6 h-6 rounded-lg gradient-cta text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {link.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {link.url}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary flex-shrink-0">
                    {link.click_count || 0}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="rounded-2xl border border-border/40 shadow-card p-5"
          style={{ background: "hsl(var(--card))" }}
        >
          <h3 className="font-dm font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Actions Rapides
          </h3>
          <div className="space-y-1.5">
            {(
              [
                {
                  label: "Ajouter un nouveau lien",
                  href: "/dashboard/liens",
                  Icon: Link2,
                  iconColor: "text-sky-500",
                  bg: "bg-sky-50 border-sky-100 dark:bg-sky-950/30 dark:border-sky-900/40",
                },
                {
                  label: "Personnaliser l'apparence",
                  href: "/dashboard/apparence",
                  Icon: Palette,
                  iconColor: "text-violet-500",
                  bg: "bg-violet-50 border-violet-100 dark:bg-violet-950/30 dark:border-violet-900/40",
                },
                {
                  label: "Voir mon profil public",
                  href: profile?.username ? `/u/${profile.username}` : "#",
                  Icon: ExternalLink,
                  iconColor: "text-emerald-500",
                  target: "_blank",
                  bg: "bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/40",
                },
                {
                  label: "Voir mes analytics",
                  href: "/dashboard/analytics",
                  Icon: BarChart3,
                  iconColor: "text-amber-500",
                  bg: "bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/40",
                },
                {
                  label: "Explorer les modèles",
                  href: "/dashboard/modeles",
                  Icon: LayoutTemplate,
                  iconColor: "text-rose-500",
                  bg: "bg-rose-50 border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/40",
                },
              ] as const
            ).map((action, i) => (
              <motion.a
                key={action.href + action.label}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{
                  x: 6,
                  scale: 1.01,
                  transition: { type: "spring", stiffness: 400, damping: 20 },
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ delay: i * 0.05 + 0.4 }}
                href={
                  "target" in action && action.target ? action.href : undefined
                }
                onClick={
                  !("target" in action)
                    ? (e: React.MouseEvent) => {
                        e.preventDefault();
                        navigate(action.href);
                      }
                    : undefined
                }
                target={
                  "target" in action && action.target
                    ? action.target
                    : undefined
                }
                rel={
                  "target" in action && action.target
                    ? "noopener noreferrer"
                    : undefined
                }
                className={`flex items-center gap-3 px-3 py-3 rounded-xl border hover:shadow-md hover:border-primary/20 transition-all group cursor-pointer ${action.bg}`}
              >
                <motion.div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${action.iconColor} bg-white/80 dark:bg-white/10 shadow-sm group-hover:shadow-md transition-shadow`}
                  whileHover={{
                    rotate: [0, -8, 8, 0],
                    transition: { duration: 0.4 },
                  }}
                >
                  <action.Icon className="w-4.5 h-4.5" strokeWidth={1.8} />
                </motion.div>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors flex-1">
                  {action.label}
                </span>
                <motion.div
                  className="text-muted-foreground group-hover:text-primary"
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Upgrade banner */}
      {(!profile?.plan || profile?.plan === "free") && (
        <motion.div
          custom={5}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{ background: "var(--gradient-cta)" }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Star className="w-5 h-5 text-primary-foreground" />
                <span className="font-dm font-bold text-primary-foreground text-base">
                  Passe à Premium
                </span>
              </div>
              <p className="text-primary-foreground/80 text-sm leading-relaxed">
                Débloques analytics avancés, thèmes premium, domaine custom et
                bien plus encore.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-white text-primary font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex-shrink-0"
            >
              Voir les plans ✨
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
