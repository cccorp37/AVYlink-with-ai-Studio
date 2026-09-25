import { useEffect, useState } from "react";
import { firestoreDB as supabase } from "@/lib/db";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Users, Link2, Star, TrendingUp } from "lucide-react";

const COLORS = [
  "hsl(204, 94%, 52%)",
  "hsl(338, 85%, 65%)",
  "hsl(160, 75%, 40%)",
  "hsl(43, 96%, 56%)",
];

export default function AdminAnalytics() {
  const [planDist, setPlanDist] = useState<{ name: string; value: number }[]>(
    [],
  );
  const [topLinks, setTopLinks] = useState<{ title: string; clicks: number }[]>(
    [],
  );
  const [signupData] = useState([
    { month: "Oct", users: 12 },
    { month: "Nov", users: 28 },
    { month: "Déc", users: 45 },
    { month: "Jan", users: 67 },
    { month: "Fév", users: 89 },
  ]);
  const [globalStats, setGlobalStats] = useState({
    users: 0,
    links: 0,
    premium: 0,
    avgLinks: 0,
  });

  useEffect(() => {
    async function load() {
      const [
        { count: userCount },
        { count: linkCount },
        { count: premiumCount },
        { data: links },
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
          .from("profile_links")
          .select("title, click_count")
          .order("click_count", { ascending: false })
          .limit(10),
      ]);
      const freeCount = (userCount || 0) - (premiumCount || 0);
      setPlanDist([
        { name: "Free", value: freeCount },
        { name: "Premium", value: premiumCount || 0 },
      ]);
      setTopLinks(
        (links || []).map((l) => ({
          title: l.title,
          clicks: l.click_count || 0,
        })),
      );
      setGlobalStats({
        users: userCount || 0,
        links: linkCount || 0,
        premium: premiumCount || 0,
        avgLinks: userCount ? Math.round((linkCount || 0) / userCount) : 0,
      });
    }
    load();
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="font-dm font-bold text-2xl text-foreground">
          Analytics Globaux
        </h2>
        <p className="text-sm text-muted-foreground">
          Vue d'ensemble des performances de la plateforme
        </p>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Users,
            label: "Utilisateurs",
            value: globalStats.users,
            color: "gradient-cta",
          },
          {
            icon: Link2,
            label: "Liens totaux",
            value: globalStats.links,
            color: "gradient-primary",
          },
          {
            icon: Star,
            label: "Premium",
            value: globalStats.premium,
            color: "gradient-rose",
          },
          {
            icon: TrendingUp,
            label: "Moy. liens/user",
            value: globalStats.avgLinks,
            color: "gradient-cta",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card rounded-2xl p-5 border border-border/50 shadow-card"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}
            >
              <s.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="font-dm font-bold text-2xl text-foreground">
              {s.value}
            </div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Signups chart */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-card p-5">
          <h3 className="font-dm font-semibold text-base text-foreground mb-4">
            📈 Inscriptions par mois
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={signupData} barSize={32}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="month"
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
                }}
                cursor={{ fill: "hsl(var(--secondary))" }}
              />
              <Bar
                dataKey="users"
                fill="hsl(var(--primary))"
                radius={[6, 6, 0, 0]}
                name="Nouveaux users"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Plan distribution */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-card p-5">
          <h3 className="font-dm font-semibold text-base text-foreground mb-4">
            🥧 Répartition des plans
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={planDist}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${Math.round(percent * 100)}%`
                }
                labelLine={false}
              >
                {planDist.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: 12,
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top links */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-card p-5">
        <h3 className="font-dm font-semibold text-base text-foreground mb-4">
          🔗 Top liens (tous utilisateurs)
        </h3>
        {topLinks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Aucune donnée de clics
          </p>
        ) : (
          <div className="space-y-3">
            {topLinks.map((link, i) => {
              const maxClicks = Math.max(...topLinks.map((l) => l.clicks), 1);
              const pct = Math.round((link.clicks / maxClicks) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-muted-foreground w-4">
                        {i + 1}
                      </span>
                      <span className="font-medium text-foreground truncate">
                        {link.title}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-primary ml-2 flex-shrink-0">
                      {link.clicks} clics
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-cta rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
