import { useState, useEffect } from "react";
import {
  Loader2,
  Activity,
  FlaskConical,
  Play,
  Pause,
  Trophy,
  Plus,
  BarChart3,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { firestoreDB as supabase } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";
import type { Tables } from "@/lib/types";

type Profile = Tables<"profiles">;
interface Props {
  profile: Profile | null;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

function HeatmapVisualization({ clicks }: { clicks: any[] }) {
  if (clicks.length === 0) {
    return (
      <div className="aspect-[9/16] max-w-[280px] mx-auto bg-muted/20 rounded-2xl border border-border/50 flex items-center justify-center">
        <p className="text-sm text-muted-foreground text-center px-4">
          Pas encore de données de clics.
          <br />
          Les clics sur ta page publique apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <div className="aspect-[9/16] max-w-[280px] mx-auto bg-muted/10 rounded-2xl border border-border/50 relative overflow-hidden">
      {/* Phone frame */}
      <div className="absolute top-0 inset-x-0 h-6 bg-foreground/5 rounded-t-2xl flex items-center justify-center">
        <div className="w-16 h-1 rounded-full bg-foreground/10" />
      </div>
      {/* Heatmap dots */}
      {clicks.map((click, i) => {
        const x = Number(click.x_percent);
        const y = Number(click.y_percent);
        return (
          <motion.div
            key={click.id || i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ delay: i * 0.02 }}
            className="absolute w-6 h-6 rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle, hsl(0 85% 50% / 0.7), hsl(40 95% 55% / 0.3), transparent)`,
            }}
          />
        );
      })}
      {/* Aggregated zones */}
      <div className="absolute bottom-4 inset-x-4 flex justify-between text-xs text-muted-foreground">
        <span>{clicks.length} clics</span>
        <span>Dernières 24h</span>
      </div>
    </div>
  );
}

export default function DashboardHeatmap({ profile }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clicks, setClicks] = useState<any[]>([]);
  const [abTests, setAbTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"heatmap" | "ab">("heatmap");
  const [newTestName, setNewTestName] = useState("");
  const [creatingTest, setCreatingTest] = useState(false);

  useEffect(() => {
    if (!profile) return;
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;
    const [clicksRes, abRes] = await Promise.all([
      supabase
        .from("click_heatmap")
        .select("*")
        .eq("profile_id", profile.id)
        .order("clicked_at", { ascending: false })
        .limit(200),
      supabase
        .from("ab_tests")
        .select("*")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false }),
    ]);
    setClicks(clicksRes.data || []);
    setAbTests(abRes.data || []);
    setLoading(false);
  };

  const handleCreateTest = async () => {
    if (!profile || !newTestName.trim()) return;
    setCreatingTest(true);
    const { error } = await supabase.from("ab_tests").insert({
      profile_id: profile.id,
      name: newTestName.trim(),
      variant_a: { title: "Variante A", description: "Version originale" },
      variant_b: { title: "Variante B", description: "Version alternative" },
    });
    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "✅ Test A/B créé !" });
      setNewTestName("");
      loadData();
    }
    setCreatingTest(false);
  };

  const handleToggleTest = async (test: any) => {
    const newStatus = test.status === "running" ? "paused" : "running";
    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === "running" && !test.started_at)
      updates.started_at = new Date().toISOString();
    await supabase.from("ab_tests").update(updates).eq("id", test.id);
    toast({
      title:
        newStatus === "running" ? "▶️ Test démarré" : "⏸️ Test mis en pause",
    });
    loadData();
  };

  const handleEndTest = async (test: any) => {
    const winner = test.variant_a_clicks >= test.variant_b_clicks ? "A" : "B";
    await supabase
      .from("ab_tests")
      .update({
        status: "completed",
        winner,
        ended_at: new Date().toISOString(),
      })
      .eq("id", test.id);
    toast({ title: `🏆 Test terminé — Variante ${winner} gagne !` });
    loadData();
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm p-5 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-dm font-bold text-lg text-foreground">
              Heatmap & A/B Testing
            </h2>
            <p className="text-sm text-muted-foreground">
              Visualise les clics et optimise tes conversions
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: "heatmap" as const, label: "🔥 Heatmap", icon: Activity },
          { id: "ab" as const, label: "🧪 A/B Tests", icon: FlaskConical },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-foreground text-background shadow-md"
                : "bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : tab === "heatmap" ? (
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-dm font-bold text-base text-foreground">
              Carte de chaleur des clics
            </h3>
            <span className="text-xs text-muted-foreground">
              {clicks.length} clics enregistrés
            </span>
          </div>
          <HeatmapVisualization clicks={clicks} />
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Zone haute",
                value: clicks.filter((c) => Number(c.y_percent) < 33).length,
                color: "text-red-500",
              },
              {
                label: "Zone milieu",
                value: clicks.filter(
                  (c) => Number(c.y_percent) >= 33 && Number(c.y_percent) < 66,
                ).length,
                color: "text-amber-500",
              },
              {
                label: "Zone basse",
                value: clicks.filter((c) => Number(c.y_percent) >= 66).length,
                color: "text-green-500",
              },
            ].map((zone) => (
              <div
                key={zone.label}
                className="p-3 rounded-xl border border-border/50 bg-muted/10 text-center"
              >
                <p className={`text-lg font-bold ${zone.color}`}>
                  {zone.value}
                </p>
                <p className="text-xs text-muted-foreground">{zone.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {/* Create A/B test */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm p-5 space-y-4"
          >
            <h3 className="font-dm font-bold text-base text-foreground flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-primary" /> Créer un test
              A/B
            </h3>
            <div className="flex gap-3">
              <Input
                value={newTestName}
                onChange={(e) => setNewTestName(e.target.value)}
                placeholder="Nom du test (ex: Titre du profil)"
                className="rounded-xl flex-1"
              />
              <Button
                onClick={handleCreateTest}
                disabled={creatingTest || !newTestName.trim()}
                className="bg-primary text-primary-foreground rounded-xl"
              >
                {creatingTest ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Créer
              </Button>
            </div>
          </motion.div>

          {/* A/B tests list */}
          <AnimatePresence>
            {abTests.map((test, i) => {
              const totalA = test.variant_a_views || 0;
              const totalB = test.variant_b_views || 0;
              const clicksA = test.variant_a_clicks || 0;
              const clicksB = test.variant_b_clicks || 0;
              const rateA =
                totalA > 0 ? ((clicksA / totalA) * 100).toFixed(1) : "0.0";
              const rateB =
                totalB > 0 ? ((clicksB / totalB) * 100).toFixed(1) : "0.0";

              return (
                <motion.div
                  key={test.id}
                  custom={i + 2}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-dm font-bold text-sm text-foreground">
                        {test.name}
                      </h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                          test.status === "running"
                            ? "bg-green-50 text-green-600 border border-green-200"
                            : test.status === "completed"
                              ? "bg-blue-50 text-blue-600 border border-blue-200"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {test.status === "running"
                          ? "▶️ En cours"
                          : test.status === "completed"
                            ? "✅ Terminé"
                            : test.status === "paused"
                              ? "⏸️ Pause"
                              : "📝 Brouillon"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {test.status !== "completed" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleTest(test)}
                            className="rounded-xl"
                          >
                            {test.status === "running" ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5" />
                            )}
                          </Button>
                          {test.status === "running" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEndTest(test)}
                              className="rounded-xl"
                            >
                              <Trophy className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Variants comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        label: "Variante A",
                        views: totalA,
                        clicks: clicksA,
                        rate: rateA,
                        isWinner: test.winner === "A",
                      },
                      {
                        label: "Variante B",
                        views: totalB,
                        clicks: clicksB,
                        rate: rateB,
                        isWinner: test.winner === "B",
                      },
                    ].map((variant) => (
                      <div
                        key={variant.label}
                        className={`p-4 rounded-xl border ${variant.isWinner ? "border-green-300 bg-green-50/50" : "border-border/50 bg-muted/10"}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-foreground">
                            {variant.label}
                          </span>
                          {variant.isWinner && (
                            <Trophy className="w-3.5 h-3.5 text-green-600" />
                          )}
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          {variant.rate}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Taux de conversion
                        </p>
                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                          <span>{variant.views} vues</span>
                          <span>{variant.clicks} clics</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {abTests.length === 0 && (
            <div className="text-center py-12 bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50">
              <FlaskConical className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Aucun test A/B pour le moment
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Crée un test pour optimiser tes conversions
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
