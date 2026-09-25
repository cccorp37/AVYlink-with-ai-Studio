import {
  ArrowRight,
  Sparkles,
  Star,
  Users,
  TrendingUp,
  Zap,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import heroBg from "@/assets/hero-bg.jpg";

const stats = [
  { value: "10K+", label: "Créateurs actifs", icon: Users },
  { value: "98%", label: "Satisfaction", icon: Star },
  { value: "5M+", label: "Clics générés", icon: TrendingUp },
  { value: "50+", label: "Pays couverts", icon: Zap },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const Hero = () => {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Cinematic gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[conic-gradient(from_180deg_at_70%_20%,hsl(204,94%,97%)_0deg,hsl(204,94%,52%,0.08)_120deg,hsl(338,85%,65%,0.06)_240deg,hsl(204,94%,97%)_360deg)]" />
          <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-[radial-gradient(ellipse,hsl(204,94%,52%,0.12),transparent_70%)]" />
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-[radial-gradient(ellipse,hsl(338,85%,65%,0.06),transparent_70%)]" />
        </div>

        {/* Dot matrix pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(204,94%,52%) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Diagonal accent line */}
        <div className="absolute top-0 right-[20%] w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent rotate-12 origin-top" />

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left content — 7 cols */}
            <div className="lg:col-span-7 space-y-8">
              {/* Badge */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0}
                className="inline-flex items-center gap-2.5 bg-primary/[0.06] border border-primary/10 pl-2 pr-5 py-1.5 rounded-full"
              >
                <span className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                  Nouveau
                </span>
                <span className="text-sm font-medium text-foreground/70">
                  🌍 Fait pour l'Afrique, ouvert au Monde
                </span>
              </motion.div>

              {/* Title — massive with text-clip gradient */}
              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={1}
                className="font-dm font-black text-[2.5rem] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] text-foreground leading-[0.95] tracking-[-0.03em]"
              >
                Ton univers
                <br />
                en{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-primary via-[hsl(199,89%,60%)] to-[hsl(338,85%,65%)] bg-clip-text text-transparent">
                    un lien
                  </span>
                  {/* Underline decoration */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      delay: 0.8,
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute -bottom-2 left-0 right-0 h-3 bg-primary/10 rounded-full origin-left"
                  />
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={2}
                className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl"
              >
                Centralise tes réseaux sociaux, produits et contenus.{" "}
                <span className="text-foreground font-semibold">
                  Monétise ta présence en ligne
                </span>{" "}
                avec une page unique et personnalisable.
              </motion.p>

              {/* CTA */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={3}
                className="flex flex-wrap gap-4 pt-2"
              >
                <Button
                  size="lg"
                  onClick={() => setShowAuth(true)}
                  className="relative gradient-cta text-primary-foreground rounded-2xl font-bold text-base px-10 py-7 group overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Créer ma page gratuitement
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5" />
                  </span>
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-2xl border-border/60 text-foreground font-semibold text-base px-8 py-7 hover:bg-primary/5 hover:border-primary/30 transition-all"
                >
                  <Sparkles className="w-5 h-5 mr-2 text-primary" />
                  Voir la démo
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => (window.location.href = "/install")}
                  className="rounded-2xl border-primary/20 text-primary font-semibold text-base px-8 py-7 hover:bg-primary/10 transition-all gap-2"
                >
                  <Download className="w-5 h-5" />
                  Installer AVYlink
                </Button>
              </motion.div>

              {/* Social proof — horizontal */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={4}
                className="flex items-center gap-5 pt-4"
              >
                <div className="flex -space-x-2.5">
                  {["🧑🏿", "👩🏽", "👨🏾", "👩🏿", "🧑🏾"].map((emoji, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.08 }}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-sm border-[3px] border-background shadow-sm"
                    >
                      {emoji}
                    </motion.div>
                  ))}
                </div>
                <div className="border-l border-border/50 pl-5">
                  <div className="flex items-center gap-1 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 fill-warning text-warning"
                      />
                    ))}
                    <span className="text-sm font-bold text-foreground ml-1">
                      4.9
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Rejoint par{" "}
                    <strong className="text-foreground">+10 000</strong>{" "}
                    créateurs
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Right: Hero visual — 5 cols */}
            <motion.div
              initial={{ opacity: 0, x: 60, rotateY: -5 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{
                delay: 0.4,
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="lg:col-span-5 relative flex justify-center"
            >
              <div className="relative">
                {/* Glow behind image */}
                <div className="absolute -inset-8 bg-gradient-to-br from-primary/15 via-transparent to-[hsl(338,85%,65%)]/10 rounded-[3rem] blur-2xl" />

                {/* Main image */}
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/20">
                  <img
                    src={heroBg}
                    alt="AVYLINK - Portfolio personnalisable"
                    className="w-full max-w-md rounded-[2rem] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent" />
                </div>

                {/* Floating cards */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="absolute -left-4 sm:-left-12 top-1/4 backdrop-blur-2xl bg-background/90 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 shadow-xl border border-border/30 hidden sm:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground font-medium">
                        Clics aujourd'hui
                      </div>
                      <div className="font-dm font-black text-xl text-foreground leading-tight">
                        +2 847
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                  className="absolute -right-4 sm:-right-10 bottom-1/4 backdrop-blur-2xl bg-background/90 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 shadow-xl border border-border/30 hidden sm:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-[hsl(207,89%,42%)] flex items-center justify-center shadow-sm">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground font-medium">
                        Nouveaux abonnés
                      </div>
                      <div className="font-dm font-black text-xl text-foreground leading-tight">
                        +142
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Stats bar — bottom of hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-20 max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-card rounded-3xl border border-border/40 shadow-lg overflow-hidden">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={`flex items-center gap-3 px-4 sm:px-6 py-4 sm:py-5 ${i < 3 ? "sm:border-r border-border/30" : ""}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/[0.07] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-dm font-black text-xl text-foreground leading-tight">
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {showAuth && (
        <AuthModal defaultMode="signup" onClose={() => setShowAuth(false)} />
      )}
    </>
  );
};

export default Hero;
