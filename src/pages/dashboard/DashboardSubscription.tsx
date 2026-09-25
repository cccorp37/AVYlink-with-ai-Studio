import { useState } from "react";
import { Crown, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentModal } from "@/components/PaymentModal";
import { motion } from "framer-motion";
import type { Tables } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

type Profile = Tables<"profiles">;

interface Props {
  profile: Profile | null;
}

const PLANS = [
  {
    id: "premium",
    name: "Premium",
    price: { monthly: 2500, yearly: 25000 },
    features: [
      "Analytics avancés",
      "Thèmes Premium",
      "Domaine personnalisé",
      "Badge vérifié",
      "Support prioritaire",
      "Intégrations avancées",
    ],
    gradient: "linear-gradient(135deg, hsl(204 94% 52%), hsl(217 91% 60%))",
  },
  {
    id: "business",
    name: "Business",
    price: { monthly: 7500, yearly: 75000 },
    features: [
      "Tout Premium +",
      "Boutique en ligne",
      "Équipe (5 membres)",
      "API complète",
      "Webhooks illimités",
      "A/B Testing",
      "Heatmap avancé",
      "Support dédié 24/7",
    ],
    gradient: "linear-gradient(135deg, hsl(338 85% 55%), hsl(280 70% 55%))",
  },
];

export default function DashboardSubscription({ profile }: Props) {
  const { toast } = useToast();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [paymentPlan, setPaymentPlan] = useState<(typeof PLANS)[0] | null>(
    null,
  );
  const [paymentOpen, setPaymentOpen] = useState(false);

  const currentPlan = profile?.plan || "free";

  const handleUpgrade = (plan: (typeof PLANS)[0]) => {
    setPaymentPlan(plan);
    setPaymentOpen(true);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="font-dm font-bold text-2xl text-foreground flex items-center gap-2">
          <Crown className="w-6 h-6 text-primary" />
          Abonnement
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Plan actuel :{" "}
          <span className="font-bold text-primary capitalize">
            {currentPlan}
          </span>
        </p>
      </motion.div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setBilling("monthly")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            billing === "monthly"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          Mensuel
        </button>
        <button
          onClick={() => setBilling("yearly")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all relative ${
            billing === "yearly"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          Annuel
          <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded-full">
            -17%
          </span>
        </button>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLANS.map((plan, i) => {
          const isCurrentPlan = currentPlan === plan.id;
          const price = plan.price[billing];

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl border-2 p-6 relative overflow-hidden ${
                isCurrentPlan ? "border-primary" : "border-border/40"
              }`}
              style={{ background: "hsl(var(--card))" }}
            >
              {isCurrentPlan && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                  Actif
                </div>
              )}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
                style={{ background: plan.gradient }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-dm font-bold text-xl text-foreground">
                {plan.name}
              </h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-dm font-bold text-foreground">
                  {price.toLocaleString("fr-FR")}
                </span>
                <span className="text-sm text-muted-foreground ml-1">
                  XAF/{billing === "monthly" ? "mois" : "an"}
                </span>
              </div>
              <div className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <div
                    key={f}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <Button
                onClick={() => handleUpgrade(plan)}
                disabled={isCurrentPlan}
                className={`w-full rounded-xl h-11 font-bold ${
                  isCurrentPlan
                    ? "bg-secondary text-muted-foreground"
                    : "gradient-cta text-primary-foreground"
                }`}
              >
                {isCurrentPlan ? "Plan actuel" : `Passer à ${plan.name}`}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Payment Modal */}
      {paymentPlan && (
        <PaymentModal
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          onSuccess={() => {
            toast({ title: `🎉 Bienvenue dans ${paymentPlan.name} !` });
            // Reload to reflect new plan
            window.location.reload();
          }}
          amount={paymentPlan.price[billing]}
          type="subscription"
          metadata={{
            plan: paymentPlan.id,
            profile_id: profile?.id,
            billing_cycle: billing,
          }}
          title={`Passer à ${paymentPlan.name}`}
          description={`${paymentPlan.price[billing].toLocaleString("fr-FR")} XAF/${billing === "monthly" ? "mois" : "an"}`}
        />
      )}
    </div>
  );
}
