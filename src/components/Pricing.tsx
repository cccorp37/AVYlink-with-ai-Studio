import { Check, X, Star, Zap, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";

const plans = [
  {
    id: "free",
    name: "Gratuit",
    icon: Star,
    price: { usd: 0, fcfa: 0 },
    priceAnnual: { usd: 0, fcfa: 0 },
    description: "Pour découvrir AvyLink",
    popular: false,
    cta: "Commencer Gratuitement",
    ctaVariant: "outline" as const,
    features: [
      { label: "10 liens maximum", included: true },
      { label: "5 thèmes basiques", included: true },
      { label: "3 miniatures vidéo", included: true },
      { label: "100 MB de stockage", included: true },
      { label: "Analytics 7 jours", included: true },
      { label: "URL : avylink.com/nom", included: true },
      { label: "Logo AvyLink visible", included: false },
      { label: "Domaine personnalisé", included: false },
      { label: "Support prioritaire", included: false },
    ],
  },
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    price: { usd: 2.99, fcfa: 1750 },
    priceAnnual: { usd: 2.24, fcfa: 1313 },
    description: "Pour créateurs débutants",
    popular: false,
    cta: "Choisir Starter",
    ctaVariant: "outline" as const,
    features: [
      { label: "25 liens maximum", included: true },
      { label: "15 thèmes", included: true },
      { label: "10 miniatures vidéo", included: true },
      { label: "1 GB de stockage", included: true },
      { label: "Analytics 30 jours", included: true },
      { label: "1 formulaire personnalisé", included: true },
      { label: "Logo AvyLink supprimé", included: true },
      { label: "Domaine personnalisé", included: false },
      { label: "Support prioritaire", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    icon: Crown,
    price: { usd: 4.99, fcfa: 2900 },
    priceAnnual: { usd: 3.74, fcfa: 2175 },
    description: "Pour créateurs sérieux",
    popular: true,
    cta: "Passer à Premium 🔥",
    ctaVariant: "default" as const,
    features: [
      { label: "Liens illimités ∞", included: true },
      { label: "50+ thèmes pro", included: true },
      { label: "Vidéos illimitées", included: true },
      { label: "5 GB de stockage", included: true },
      { label: "Analytics 12 mois + Export", included: true },
      { label: "5 formulaires + Pop-ups ∞", included: true },
      { label: "Domaine personnalisé", included: true },
      { label: "Badge Certified ✓", included: true },
      { label: "Support prioritaire 12h", included: true },
    ],
  },
  {
    id: "business",
    name: "Business",
    icon: Building2,
    price: { usd: 9.99, fcfa: 5850 },
    priceAnnual: { usd: 7.49, fcfa: 4388 },
    description: "Pour entreprises",
    popular: false,
    cta: "Choisir Business",
    ctaVariant: "outline" as const,
    features: [
      { label: "Tout Premium inclus", included: true },
      { label: "Boutique e-commerce ∞", included: true },
      { label: "Commission 2% seulement", included: true },
      { label: "Stockage illimité", included: true },
      { label: "Heatmap + A/B Testing", included: true },
      { label: "API Access + Webhooks", included: true },
      { label: "Tous les Pixels (TikTok...)", included: true },
      { label: "Support 24h email", included: true },
      { label: "Multi-utilisateurs", included: true },
    ],
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const Pricing = () => {
  const [annual, setAnnual] = useState(false);
  const [currency, setCurrency] = useState<"usd" | "fcfa">("fcfa");

  return (
    <section id="tarifs" className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,hsl(204,94%,52%,0.06),transparent)] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 space-y-5"
        >
          <div className="inline-flex items-center gap-2 bg-primary/[0.06] border border-primary/10 px-5 py-2.5 rounded-full text-sm font-semibold text-primary">
            🌍 Prix accessibles à tous
          </div>
          <h2 className="font-dm font-black text-4xl md:text-6xl text-foreground tracking-tight leading-tight">
            Commencez{" "}
            <span className="bg-gradient-to-r from-primary to-[hsl(338,85%,65%)] bg-clip-text text-transparent">
              gratuitement
            </span>
            <br />
            évoluez à votre rythme
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Des prix pensés pour l'Afrique 🌍 — Même les étudiants peuvent se
            l'offrir !
          </p>
        </motion.div>

        {/* Toggles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14"
        >
          <div className="bg-card border border-border/40 rounded-2xl p-1 flex items-center gap-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                !annual
                  ? "gradient-cta text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                annual
                  ? "gradient-cta text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annuel
              <span className="bg-warning/20 text-warning text-[10px] font-black px-2 py-0.5 rounded-full">
                -25%
              </span>
            </button>
          </div>

          <div className="bg-card border border-border/40 rounded-2xl p-1 flex items-center gap-1">
            {(["fcfa", "usd"] as const).map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  currency === cur
                    ? "bg-foreground text-background shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cur === "fcfa" ? "🇨🇮 FCFA" : "💵 USD"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Plans */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {plans.map((plan) => {
            const price = annual ? plan.priceAnnual : plan.price;
            const displayPrice = currency === "fcfa" ? price.fcfa : price.usd;
            const suffix = currency === "fcfa" ? "FCFA" : "$";
            const Icon = plan.icon;

            return (
              <motion.div
                key={plan.id}
                variants={cardVariant}
                className={`relative bg-card rounded-[1.75rem] p-7 border transition-all duration-300 hover:-translate-y-1.5 flex flex-col ${
                  plan.popular
                    ? "border-primary/30 shadow-xl ring-1 ring-primary/10 lg:scale-[1.03] z-10"
                    : "border-border/30 shadow-sm hover:shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 gradient-cta text-primary-foreground text-[11px] font-black uppercase tracking-wider px-5 py-1.5 rounded-full shadow-lg">
                    ⭐ Le plus populaire
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-7">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                      plan.popular
                        ? "gradient-cta shadow-md"
                        : "bg-primary/[0.07]"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${plan.popular ? "text-primary-foreground" : "text-primary"}`}
                    />
                  </div>
                  <h3 className="font-dm font-black text-xl text-foreground">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-7">
                  {displayPrice === 0 ? (
                    <div className="font-dm font-black text-4xl text-foreground">
                      Gratuit
                      <span className="text-sm font-medium text-muted-foreground ml-2">
                        pour toujours
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-dm font-black text-4xl text-foreground">
                          {currency === "fcfa"
                            ? displayPrice.toLocaleString()
                            : displayPrice}
                        </span>
                        <span className="text-muted-foreground font-medium">
                          {suffix}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        par mois{annual ? " (facturé annuellement)" : ""}
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className={`w-full rounded-xl font-bold mb-7 py-5 ${
                    plan.popular
                      ? "gradient-cta text-primary-foreground shadow-md hover:shadow-lg"
                      : "border-border/50 text-foreground hover:bg-primary/5 hover:border-primary/30"
                  }`}
                >
                  {plan.cta}
                </Button>

                {/* Features */}
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat.label} className="flex items-start gap-2.5">
                      {feat.included ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                          <X className="w-3 h-3 text-muted-foreground/40" />
                        </div>
                      )}
                      <span
                        className={`text-sm ${feat.included ? "text-foreground" : "text-muted-foreground/50 line-through"}`}
                      >
                        {feat.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center text-muted-foreground text-sm"
        >
          ✅ Pas de carte bancaire requise pour le plan gratuit · Annulez à tout
          moment · Support en français
        </motion.p>
      </div>
    </section>
  );
};

export default Pricing;
