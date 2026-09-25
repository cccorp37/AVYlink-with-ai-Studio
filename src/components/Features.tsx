import {
  Link2,
  Palette,
  BarChart3,
  ShoppingBag,
  Globe,
  Zap,
  Youtube,
  Music,
  Lock,
  Smartphone,
  Share2,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Link2,
    title: "Liens Illimités",
    description:
      "Ajoutez tous vos liens : réseaux sociaux, boutiques, portfolios, musique... sans limite.",
    gradient: "from-primary to-[hsl(199,89%,73%)]",
    badge: null,
    span: "lg:col-span-2",
  },
  {
    icon: Palette,
    title: "50+ Thèmes Visuels",
    description:
      "Personnalisez entièrement votre page avec des thèmes pro, vos couleurs et vos polices.",
    gradient: "from-violet-500 to-purple-600",
    badge: "✨ Populaire",
    span: "",
  },
  {
    icon: BarChart3,
    title: "Analytics Avancés",
    description:
      "Suivez vos clics, sources de trafic, géolocalisation et l'évolution de votre audience.",
    gradient: "from-emerald-400 to-emerald-600",
    badge: null,
    span: "",
  },
  {
    icon: ShoppingBag,
    title: "Boutique Intégrée",
    description:
      "Vendez vos produits directement depuis votre page. Catalogue, paiement, livraison.",
    gradient: "from-orange-400 to-orange-600",
    badge: "🔥 Business",
    span: "lg:col-span-2",
  },
  {
    icon: Youtube,
    title: "Miniatures Vidéo",
    description:
      "Intégrez vos vidéos YouTube avec miniatures HD, titres et vues automatiques.",
    gradient: "from-red-400 to-red-600",
    badge: null,
    span: "",
  },
  {
    icon: Globe,
    title: "Domaine Personnalisé",
    description:
      "Utilisez votre propre domaine (votresite.com) pour une image ultra-professionnelle.",
    gradient: "from-primary to-[hsl(207,89%,42%)]",
    badge: null,
    span: "lg:col-span-2",
  },
  {
    icon: Zap,
    title: "Ultra-Rapide",
    description:
      "Pages optimisées pour le mobile-first, même avec une connexion 3G lente.",
    gradient: "from-amber-400 to-yellow-500",
    badge: "⚡ Afrique",
    span: "",
  },
  {
    icon: Music,
    title: "Plateformes Musicales",
    description:
      "Spotify, Deezer, SoundCloud, Apple Music — intégrez votre musique en un clic.",
    gradient: "from-green-400 to-emerald-500",
    badge: null,
    span: "",
  },
  {
    icon: Lock,
    title: "Liens Protégés",
    description:
      "Accès par mot de passe, liens premium réservés à vos abonnés payants.",
    gradient: "from-primary to-[hsl(338,85%,65%)]",
    badge: "🔐 Premium",
    span: "",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const Features = () => {
  return (
    <section
      id="fonctionnalites"
      className="py-32 bg-background relative overflow-hidden"
    >
      {/* Accent blobs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[radial-gradient(ellipse,hsl(204,94%,52%,0.05),transparent)] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[radial-gradient(ellipse,hsl(338,85%,65%,0.04),transparent)] pointer-events-none" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 space-y-5"
        >
          <div className="inline-flex items-center gap-2 bg-primary/[0.06] border border-primary/10 px-5 py-2.5 rounded-full text-sm font-semibold text-primary">
            <Zap className="w-4 h-4" />
            Fonctionnalités puissantes
          </div>
          <h2 className="font-dm font-black text-4xl md:text-6xl text-foreground tracking-tight leading-tight">
            Tout ce dont tu as besoin,
            <br />
            <span className="bg-gradient-to-r from-primary to-[hsl(338,85%,65%)] bg-clip-text text-transparent">
              sans complexité
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            AVYLINK combine puissance et simplicité pour que chaque créateur
            puisse briller en ligne.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                variants={item}
                className={`group relative rounded-[1.75rem] p-7 border border-border/30 bg-card hover:bg-card/80 overflow-hidden transition-colors duration-300 ${feat.span}`}
              >
                {/* Gradient reveal on hover */}
                <div
                  className={`absolute -inset-px bg-gradient-to-br ${feat.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 rounded-[1.75rem]`}
                />
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feat.gradient} opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700`}
                />

                {/* Badge */}
                {feat.badge && (
                  <span className="absolute top-5 right-5 bg-foreground/5 border border-foreground/10 text-foreground/70 text-[11px] font-bold px-3 py-1 rounded-full">
                    {feat.badge}
                  </span>
                )}

                <div className="relative z-10">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center mb-5 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-dm font-bold text-xl text-foreground mb-2 flex items-center gap-2">
                    {feat.title}
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Mobile showcase banner */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-24 relative rounded-[2rem] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-[hsl(207,89%,42%)] to-[hsl(220,60%,30%)]" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-5">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold text-sm px-4 py-2 rounded-full border border-white/10">
                <Smartphone className="w-4 h-4" />
                Mobile-First
              </div>
              <h3 className="font-dm font-black text-4xl md:text-5xl text-white leading-[0.95]">
                Conçu pour
                <br />
                l'Afrique 🌍
              </h3>
              <p className="text-white/70 leading-relaxed max-w-md text-lg">
                Pages ultra-légères optimisées pour les connexions 3G/4G.
                Interface traduite en français, anglais, wolof, swahili et plus.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  "🇨🇮 Côte d'Ivoire",
                  "🇸🇳 Sénégal",
                  "🇨🇲 Cameroun",
                  "🇳🇬 Nigeria",
                  "🇬🇭 Ghana",
                ].map((country) => (
                  <span
                    key={country}
                    className="bg-white/[0.08] backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full text-sm text-white/80 font-medium"
                  >
                    {country}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: Share2,
                    label: "Partage facile",
                    value: "1 lien = tout",
                  },
                  { icon: BarChart3, label: "Analytics", value: "Temps réel" },
                  { icon: Zap, label: "Vitesse", value: "< 1 seconde" },
                  { icon: Globe, label: "Langues", value: "Multi-langues" },
                ].map((cardItem) => (
                  <div
                    key={cardItem.label}
                    className="bg-white/[0.07] backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center hover:bg-white/[0.12] transition-colors"
                  >
                    <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <cardItem.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="font-dm font-bold text-sm text-white">
                      {cardItem.value}
                    </div>
                    <div className="text-xs text-white/50 mt-0.5">
                      {cardItem.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
