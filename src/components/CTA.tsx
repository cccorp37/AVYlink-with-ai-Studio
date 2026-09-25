import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Aïsha Diallo",
    role: "Influenceuse Mode",
    country: "🇸🇳 Dakar",
    avatar: "👩🏾",
    text: "Depuis que j'utilise AvyLink, mes ventes de mode ont triplé. Ma page est si belle que mes abonnés pensent que j'ai une agence derrière moi !",
    plan: "Premium",
  },
  {
    name: "Kwame Mensah",
    role: "Photographe Pro",
    country: "🇬🇭 Accra",
    avatar: "👨🏿",
    text: "AvyLink m'a permis de centraliser mon portfolio, mon Instagram et ma boutique. Je gagne 2x plus de clients depuis 3 mois.",
    plan: "Business",
  },
  {
    name: "Marie-Claire Koffi",
    role: "Coach Bien-être",
    country: "🇨🇮 Abidjan",
    avatar: "👩🏽",
    text: "Super facile à utiliser ! J'ai créé ma page en 10 minutes et mes clients trouvent tout mes services en un clic.",
    plan: "Starter",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardAnim = {
  hidden: { opacity: 0, y: 30, rotateX: 5 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const CTA = () => {
  return (
    <>
      {/* Testimonials */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse,hsl(204,94%,52%,0.04),transparent)] pointer-events-none" />

        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 space-y-4"
          >
            <div className="inline-flex items-center gap-2 bg-primary/[0.06] border border-primary/10 px-5 py-2.5 rounded-full text-sm font-semibold text-primary">
              <Star className="w-4 h-4 fill-primary" />
              Témoignages vérifiés
            </div>
            <h2 className="font-dm font-black text-4xl md:text-5xl text-foreground tracking-tight">
              Ils nous font{" "}
              <span className="bg-gradient-to-r from-primary to-[hsl(338,85%,65%)] bg-clip-text text-transparent">
                confiance
              </span>
            </h2>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-5"
          >
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.name}
                variants={cardAnim}
                className={`relative bg-card rounded-[1.75rem] p-8 border border-border/30 transition-all duration-300 hover:shadow-lg group ${
                  idx === 1 ? "md:-translate-y-6" : ""
                }`}
              >
                {/* Giant quote mark */}
                <div className="absolute top-6 right-8 text-7xl font-serif text-primary/[0.04] leading-none select-none">
                  "
                </div>

                <div className="relative z-10">
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-warning text-warning"
                      />
                    ))}
                  </div>

                  <p className="text-foreground/80 text-sm leading-relaxed mb-8">
                    "{t.text}"
                  </p>

                  <div className="flex items-center gap-3 pt-5 border-t border-border/30">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[hsl(207,89%,42%)] flex items-center justify-center text-xl flex-shrink-0 shadow-md">
                      {t.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-dm font-bold text-sm text-foreground">
                        {t.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t.role} · {t.country}
                      </div>
                    </div>
                    <span className="bg-primary/[0.06] border border-primary/10 text-primary text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                      {t.plan}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-foreground" />
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_0%,hsl(204,94%,52%,0.15)_0deg,transparent_120deg,hsl(338,85%,65%,0.08)_240deg,hsl(204,94%,52%,0.15)_360deg)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="container mx-auto px-4 py-32 text-center relative z-10"
        >
          <div className="inline-flex items-center gap-2 bg-white/[0.06] backdrop-blur-sm text-white/80 px-5 py-2.5 rounded-full text-sm font-semibold mb-10 border border-white/[0.06]">
            <Sparkles className="w-4 h-4" />
            Rejoins +10 000 créateurs africains
          </div>
          <h2 className="font-dm font-black text-5xl md:text-7xl lg:text-8xl text-white mb-8 tracking-tight leading-[0.95]">
            Ton univers mérite
            <br />
            <span className="bg-gradient-to-r from-primary via-[hsl(199,89%,73%)] to-[hsl(338,85%,65%)] bg-clip-text text-transparent">
              une belle vitrine
            </span>
          </h2>
          <p className="text-white/50 text-lg mb-14 max-w-lg mx-auto leading-relaxed">
            Crée ta page AVYLINK gratuitement en 5 minutes. Aucune carte
            bancaire requise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-foreground hover:bg-white/90 shadow-2xl rounded-2xl font-black text-base px-14 py-7 group"
            >
              Créer ma page maintenant
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1.5" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="border border-white/10 text-white hover:bg-white/[0.06] rounded-2xl font-semibold text-base px-10 py-7"
            >
              Voir les tarifs
            </Button>
          </div>
          <p className="text-white/30 text-sm mt-10">
            Gratuit pour toujours · Pas de carte requise · Support en français
            🇫🇷
          </p>
        </motion.div>
      </section>
    </>
  );
};

export default CTA;
