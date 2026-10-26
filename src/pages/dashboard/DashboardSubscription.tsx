import { useState, useEffect } from "react";
import {
  Crown,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  Calculator,
  Tag,
  Receipt,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  X,
  Star,
  Rocket,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentModal } from "@/components/PaymentModal";
import { VerifiedBadge, BADGE_STYLES } from "@/components/VerifiedBadge";
import { firestoreDB as supabase } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import type { Tables } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

type Profile = Tables<"profiles">;

interface Props {
  profile: Profile | null;
}

interface PlanDef {
  id: "free" | "starter" | "premium" | "business";
  name: string;
  tagline: string;
  badge?: string;
  popular?: boolean;
  price: { monthly: number; yearly: number };
  commission: string;
  features: string[];
  gradient: string;
  Icon: any;
}

const PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Gratuit",
    tagline: "Pour découvrir AvyLink et partager ses premiers liens",
    price: { monthly: 0, yearly: 0 },
    commission: "Standard",
    Icon: Star,
    features: [
      "Liens illimités & QR Code de base",
      "Carte de visite vCard (.vcf)",
      "Thèmes classiques",
      "Blocs essentiels (Texte, Entête, Réseaux)",
      "Statistiques de vues (7 jours)",
    ],
    gradient: "linear-gradient(135deg, #64748b, #475569)",
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "Idéal pour les créateurs qui lancent leur audience",
    badge: "Nouveau",
    price: { monthly: 1500, yearly: 15000 },
    commission: "Frais réduits",
    Icon: Rocket,
    features: [
      "Tout le plan Gratuit inclus",
      "Pourboires Mobile Money (Tip Jar)",
      "Bouton WhatsApp Direct & Compte à rebours",
      "Modèles Créatifs & Grille Bento",
      "Suppression du logo AvyLink",
      "Statistiques sur 30 jours",
    ],
    gradient: "linear-gradient(135deg, #10b981, #059669)",
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Le choix n°1 des influenceurs, coachs et freelances",
    badge: "Le plus populaire",
    popular: true,
    price: { monthly: 2500, yearly: 25000 },
    commission: "3% par vente",
    Icon: Sparkles,
    features: [
      "Tout le plan Starter inclus",
      "Badge Vérifié officiel (5 styles au choix)",
      "Tous les modèles Pro, Festival & Néon",
      "Boutique Mobile Money (jusqu'à 15 articles)",
      "Domaine personnalisé & SEO avancé",
      "Pixels Marketing (Meta, TikTok, Google)",
      "Support prioritaire WhatsApp",
    ],
    gradient: "linear-gradient(135deg, hsl(204 94% 52%), hsl(217 91% 60%))",
  },
  {
    id: "business",
    name: "Business",
    tagline: "La suite complète e-commerce, formations & agences",
    badge: "Puissance Max",
    price: { monthly: 5850, yearly: 58500 },
    commission: "Prioritaire",
    Icon: Briefcase,
    features: [
      "Tout le plan Premium inclus",
      "Boutique E-Commerce illimitée",
      "Vente de Packs de Formation & Fichiers Lourds",
      "Carte de chaleur (Heatmap) & A/B Testing",
      "Gestion d'équipe (jusqu'à 5 membres)",
      "Clés API & Webhooks temps réel",
      "Accompagnement VIP dédié 24/7",
    ],
    gradient: "linear-gradient(135deg, hsl(338 85% 55%), hsl(280 70% 55%))",
  },
];

const PROMO_CODES: Record<string, { discountPercent: number; label: string }> = {
  AVYLINK20: { discountPercent: 20, label: "-20% Créateur AvyLink" },
  WELCOME10: { discountPercent: 10, label: "-10% Offre Bienvenue" },
  CREATOR25: { discountPercent: 25, label: "-25% Pack Ambassadeur" },
};

const COMPARISON_ROWS = [
  { label: "Liens & QR Code Studio HD", free: true, starter: true, premium: true, business: true },
  { label: "Carte de visite vCard (.vcf)", free: true, starter: true, premium: true, business: true },
  { label: "Pourboires Mobile Money (Tip Jar)", free: true, starter: true, premium: true, business: true },
  { label: "Masquer le branding AvyLink", free: false, starter: true, premium: true, business: true },
  { label: "Modèles Pro, Bento & Festival", free: false, starter: true, premium: true, business: true },
  { label: "Badge Vérifié personnalisable", free: false, starter: false, premium: true, business: true },
  { label: "Boutique Mobile Money", free: "—", starter: "3 articles", premium: "15 articles", business: "Illimité" },
  { label: "Packs Formation & Fichiers lourds", free: false, starter: false, premium: false, business: true },
  { label: "Pixels (TikTok, Facebook, Google)", free: false, starter: false, premium: true, business: true },
  { label: "Heatmap, A/B Testing, API & Équipe", free: false, starter: false, premium: false, business: true },
];

export default function DashboardSubscription({ profile }: Props) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [paymentPlan, setPaymentPlan] = useState<PlanDef | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  // Promo code state
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPercent: number;
    label: string;
  } | null>(null);

  // Revenue simulator state
  const [simSalesPerMonth, setSimSalesPerMonth] = useState(15);
  const [simAvgPrice, setSimAvgPrice] = useState(5000);

  // Billing history
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [usageStats, setUsageStats] = useState({ links: 0, blocks: 0, products: 0 });

  const currentPlan = (profile?.plan || "free") as PlanDef["id"];

  useEffect(() => {
    if (!profile) return;
    Promise.all([
      supabase.from("profile_links").select("id").eq("profile_id", profile.id),
      supabase.from("page_blocks").select("id").eq("profile_id", profile.id),
      supabase.from("store_items").select("id").eq("profile_id", profile.id),
    ]).then(([l, b, s]) => {
      setUsageStats({
        links: l.data?.length || 0,
        blocks: b.data?.length || 0,
        products: s.data?.length || 0,
      });
    });

    if (user) {
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          if (data) {
            setBillingHistory(
              data.filter((t: any) => t.type === "subscription" || t.amount > 0).slice(0, 8),
            );
          }
        });
    }
  }, [profile?.id, user?.id]);

  const handleApplyPromo = () => {
    const clean = promoInput.trim().toUpperCase();
    if (!clean) return;
    const found = PROMO_CODES[clean];
    if (!found) {
      toast({
        title: "Code promo invalide",
        description: "Essaie par exemple AVYLINK20 ou WELCOME10.",
        variant: "destructive",
      });
      return;
    }
    setAppliedPromo({ code: clean, ...found });
    toast({
      title: `🎉 Code ${clean} activé !`,
      description: `Réduction immédiate de ${found.discountPercent}% sur tous les abonnements.`,
    });
  };

  const getDiscountedPrice = (rawPrice: number) => {
    if (!appliedPromo || rawPrice === 0) return rawPrice;
    return Math.round(rawPrice * (1 - appliedPromo.discountPercent / 100));
  };

  const handleUpgrade = (plan: PlanDef) => {
    if (plan.id === "free") return;
    setPaymentPlan(plan);
    setPaymentOpen(true);
  };

  const estMonthlyRevenue = simSalesPerMonth * simAvgPrice;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header + Current Plan Status Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/50 bg-card p-5 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-primary" />
            <h2 className="font-dm font-bold text-xl md:text-2xl text-foreground">
              Abonnement & Facturation
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase bg-primary/15 text-primary border border-primary/25">
              Plan {currentPlan}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Débloque la monétisation Mobile Money, le badge vérifié et les modèles Pro sans engagement.
          </p>
        </div>

        {/* Active Usage Counters */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-secondary/50 p-2.5 rounded-xl border border-border/40">
          <div className="text-center px-2">
            <p className="font-dm font-extrabold text-base text-foreground">{usageStats.links}</p>
            <p className="text-[10px] text-muted-foreground">Liens</p>
          </div>
          <div className="text-center px-2 border-x border-border/50">
            <p className="font-dm font-extrabold text-base text-foreground">{usageStats.blocks}</p>
            <p className="text-[10px] text-muted-foreground">Blocs</p>
          </div>
          <div className="text-center px-2">
            <p className="font-dm font-extrabold text-base text-primary">{usageStats.products}</p>
            <p className="text-[10px] text-muted-foreground">Produits</p>
          </div>
        </div>
      </motion.div>

      {/* Billing Cycle Toggle + Promo Code Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/80 rounded-2xl border border-border/50 p-4">
        <div className="flex items-center gap-2 bg-secondary p-1 rounded-xl">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              billing === "monthly"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Facturation Mensuelle
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              billing === "yearly"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Annuel</span>
            <span className="text-[10px] font-extrabold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
              2 mois offerts (-17%)
            </span>
          </button>
        </div>

        {/* Promo Code Input */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {appliedPromo ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
              <Tag className="w-3.5 h-3.5" />
              <span>
                {appliedPromo.code} ({appliedPromo.label})
              </span>
              <button
                onClick={() => {
                  setAppliedPromo(null);
                  setPromoInput("");
                }}
                className="p-0.5 hover:bg-emerald-500/20 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-44">
                <Tag className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Code promo (ex: AVYLINK20)"
                  className="pl-8 h-9 rounded-xl text-xs"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleApplyPromo}
                className="h-9 rounded-xl text-xs font-bold"
              >
                Appliquer
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 4-Tier Pricing Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan, i) => {
          const isCurrentPlan = currentPlan === plan.id;
          const rawPrice = plan.price[billing];
          const finalPrice = getDiscountedPrice(rawPrice);
          const PlanIcon = plan.Icon;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`rounded-2xl border-2 p-5 relative flex flex-col justify-between transition-all ${
                plan.popular
                  ? "border-primary shadow-xl shadow-primary/10 bg-card"
                  : isCurrentPlan
                    ? "border-emerald-500/60 bg-card"
                    : "border-border/50 bg-card/90 hover:border-primary/40"
              }`}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-3 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-white shadow-sm ${
                    plan.popular
                      ? "bg-gradient-to-r from-sky-500 to-blue-600"
                      : plan.id === "business"
                        ? "bg-gradient-to-r from-pink-500 to-purple-600"
                        : "bg-emerald-600"
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Actif
                </div>
              )}

              <div>
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
                  style={{ background: plan.gradient }}
                >
                  <PlanIcon className="w-5 h-5 text-white" />
                </div>

                <h3 className="font-dm font-bold text-lg text-foreground">
                  {plan.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 min-h-[32px]">
                  {plan.tagline}
                </p>

                <div className="mt-4 mb-4 pb-4 border-b border-border/50">
                  {rawPrice === 0 ? (
                    <div>
                      <span className="text-2xl font-dm font-extrabold text-foreground">
                        0 XAF
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        / toujours
                      </span>
                    </div>
                  ) : (
                    <div>
                      {appliedPromo && (
                        <p className="text-xs text-muted-foreground line-through">
                          {rawPrice.toLocaleString("fr-FR")} XAF
                        </p>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-dm font-extrabold text-foreground">
                          {finalPrice.toLocaleString("fr-FR")}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">
                          XAF/{billing === "monthly" ? "mois" : "an"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <div
                      key={f}
                      className="flex items-start gap-2 text-xs text-foreground/90 leading-snug"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => handleUpgrade(plan)}
                disabled={isCurrentPlan || plan.id === "free"}
                className={`w-full rounded-xl h-10 text-xs font-bold ${
                  isCurrentPlan
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                    : plan.id === "free"
                      ? "bg-secondary text-muted-foreground"
                      : "gradient-cta text-primary-foreground shadow-md hover:opacity-95"
                }`}
              >
                {isCurrentPlan
                  ? "✓ Ton plan actuel"
                  : plan.id === "free"
                    ? "Inclus de base"
                    : `Passer à ${plan.name}`}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Creator Earnings Simulator */}
      <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-dm font-bold text-base text-foreground">
              Simulateur de revenus Créateur & E-Commerce
            </h3>
            <p className="text-xs text-muted-foreground">
              Estime combien ta page AvyLink peut te rapporter chaque mois via Orange Money & MTN MoMo
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center pt-1">
          <div className="space-y-3 md:col-span-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-muted-foreground">Ventes ou pourboires par mois</span>
                <span className="text-foreground font-bold">{simSalesPerMonth} ventes / mois</span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={simSalesPerMonth}
                onChange={(e) => setSimSalesPerMonth(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-muted-foreground">Prix moyen d'un produit / coaching</span>
                <span className="text-foreground font-bold">
                  {simAvgPrice.toLocaleString("fr-FR")} XAF
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={50000}
                step={500}
                value={simAvgPrice}
                onChange={(e) => setSimAvgPrice(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-emerald-500/10 border border-primary/25 p-4 text-center space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              Revenu net estimé dans ton Wallet
            </p>
            <p className="font-dm font-extrabold text-2xl sm:text-3xl text-primary">
              {estMonthlyRevenue.toLocaleString("fr-FR")} XAF
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              ⚡ Abonnement rentabilisé dès la 1ère vente !
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-card">
        <div className="p-5 border-b border-border/50">
          <h3 className="font-dm font-bold text-base text-foreground">
            Comparatif détaillé des fonctionnalités
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[540px]">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/40 text-xs font-bold text-foreground">
                <th className="p-3.5">Fonctionnalité</th>
                <th className="p-3.5 text-center">Gratuit</th>
                <th className="p-3.5 text-center text-emerald-600">Starter</th>
                <th className="p-3.5 text-center text-primary">Premium</th>
                <th className="p-3.5 text-center text-purple-600">Business</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-xs">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.label} className="hover:bg-secondary/20">
                  <td className="p-3.5 font-medium text-foreground">{row.label}</td>
                  {(["free", "starter", "premium", "business"] as const).map((col) => {
                    const val = row[col];
                    return (
                      <td key={col} className="p-3.5 text-center">
                        {typeof val === "boolean" ? (
                          val ? (
                            <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )
                        ) : (
                          <span className="font-bold text-foreground">{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Billing & Transaction History */}
      <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            <h3 className="font-dm font-bold text-base text-foreground">
              Historique de facturation & paiements Mobile Money
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            Sécurisé par MeSomb (Orange Money & MTN MoMo)
          </span>
        </div>

        {billingHistory.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground bg-secondary/20 rounded-xl border border-border/30">
            Aucune facture d'abonnement enregistrée pour le moment.
          </div>
        ) : (
          <div className="space-y-2">
            {billingHistory.map((tx: any) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-secondary/20 text-xs"
              >
                <div>
                  <p className="font-bold text-foreground">
                    {tx.description || `Transaction #${String(tx.id).slice(0, 8)}`}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {tx.created_at
                      ? new Date(tx.created_at).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Récemment"}{" "}
                    • {tx.payment_method || "Mobile Money"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-dm font-bold text-foreground">
                    {Number(tx.amount || 0).toLocaleString("fr-FR")} XAF
                  </p>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      tx.status === "completed" || tx.status === "SUCCESS"
                        ? "bg-emerald-500/15 text-emerald-600"
                        : "bg-amber-500/15 text-amber-600"
                    }`}
                  >
                    {tx.status === "completed" || tx.status === "SUCCESS"
                      ? "Payé"
                      : tx.status || "En attente"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {paymentPlan && (
        <PaymentModal
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          onSuccess={() => {
            toast({ title: `🎉 Bienvenue dans le plan ${paymentPlan.name} !` });
            window.location.reload();
          }}
          amount={getDiscountedPrice(paymentPlan.price[billing])}
          type="subscription"
          metadata={{
            plan: paymentPlan.id,
            profile_id: profile?.id,
            billing_cycle: billing,
            promo_code: appliedPromo?.code || null,
          }}
          title={`Passer au plan ${paymentPlan.name}`}
          description={`${getDiscountedPrice(paymentPlan.price[billing]).toLocaleString("fr-FR")} XAF/${billing === "monthly" ? "mois" : "an"}${appliedPromo ? ` (Code ${appliedPromo.code} appliqué)` : ""}`}
        />
      )}
    </div>
  );
}
