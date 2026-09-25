import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const reviews = [
  {
    name: "Aïsha Diallo",
    role: "Influenceuse Mode",
    country: "🇸🇳 Dakar",
    avatar:
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Aisha&backgroundColor=ffb3d9&skinColor=brown",
    rating: 5,
    text: "Depuis que j'utilise AvyLink, mes ventes de mode ont triplé ! Ma page est si élégante que mes abonnés pensent que j'ai une agence derrière moi.",
    plan: "Premium",
  },
  {
    name: "Kwame Mensah",
    role: "Photographe & Vidéaste",
    country: "🇬🇭 Accra",
    avatar:
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Kwame&backgroundColor=b6e3f4&skinColor=darkBrown",
    rating: 5,
    text: "AvyLink m'a permis de centraliser mon portfolio, mon Instagram et ma boutique en un seul endroit. Je gagne 2x plus de clients depuis 3 mois.",
    plan: "Business",
  },
  {
    name: "Marie-Claire Koffi",
    role: "Coach Bien-être",
    country: "🇨🇮 Abidjan",
    avatar:
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Marie&backgroundColor=ffd5dc&skinColor=brown",
    rating: 5,
    text: "Super facile à utiliser ! J'ai créé ma page en 10 minutes et mes clients trouvent tous mes services en un clic. Le support en français est parfait.",
    plan: "Starter",
  },
  {
    name: "Ibrahim Traoré",
    role: "Musicien & Beatmaker",
    country: "🇧🇫 Ouagadougou",
    avatar:
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Ibrahim&backgroundColor=c0aede&skinColor=darkBrown",
    rating: 5,
    text: "J'ai connecté Spotify, YouTube et ma boutique de beats sur une seule page. En 2 mois, j'ai doublé mes streams et mes ventes.",
    plan: "Premium",
  },
  {
    name: "Fatou Sarr",
    role: "Entrepreneuse & Coach",
    country: "🇸🇳 Thiès",
    avatar:
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Fatou&backgroundColor=d1f4d1&skinColor=brown",
    rating: 5,
    text: "Je cherchais une solution africaine adaptée à nos réalités. AvyLink accepte les paiements en FCFA et comprend nos besoins.",
    plan: "Gratuit",
  },
  {
    name: "Chidi Okafor",
    role: "Consultant Tech",
    country: "🇳🇬 Lagos",
    avatar:
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Chidi&backgroundColor=b6e3f4&skinColor=darkBrown",
    rating: 5,
    text: "As a tech consultant, I need a professional online presence. AvyLink gives me that instantly. The analytics are detailed and the page loads super fast.",
    plan: "Business",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const card = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const Reviews = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-primary/[0.02]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-5"
        >
          <div className="inline-flex items-center gap-2 bg-primary/[0.06] border border-primary/10 px-5 py-2.5 rounded-full text-sm font-semibold text-primary">
            <Star className="w-4 h-4 fill-primary" />
            Note moyenne 4.9/5 — 2 847 avis
          </div>
          <h2 className="font-dm font-black text-4xl md:text-6xl text-foreground tracking-tight leading-tight">
            Ce que disent nos
            <br />
            <span className="bg-gradient-to-r from-primary to-[hsl(338,85%,65%)] bg-clip-text text-transparent">
              créateurs africains
            </span>
          </h2>
        </motion.div>

        {/* Rating bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-14"
        >
          <div className="bg-card border border-border/30 rounded-3xl px-8 py-6 flex flex-wrap items-center gap-8 justify-center shadow-sm">
            <div className="text-center">
              <div className="font-dm font-black text-5xl text-foreground">
                4.9
              </div>
              <div className="flex justify-center mt-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                sur 5 étoiles
              </div>
            </div>
            <div className="h-14 w-px bg-border/50 hidden sm:block" />
            {[
              { stars: 5, pct: 91 },
              { stars: 4, pct: 7 },
              { stars: 3, pct: 2 },
            ].map((row) => (
              <div key={row.stars} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-8 text-right font-medium">
                  {row.stars}★
                </span>
                <div className="w-32 h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-cta"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="text-muted-foreground w-8 font-medium">
                  {row.pct}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Reviews grid — masonry-like with alternating heights */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {reviews.map((review, idx) => (
            <motion.div
              key={review.name}
              variants={card}
              className={`bg-card rounded-[1.75rem] p-7 border border-border/30 hover:shadow-lg transition-all duration-300 flex flex-col group ${
                idx % 3 === 1 ? "lg:-translate-y-4" : ""
              }`}
            >
              {/* Quote */}
              <Quote className="w-8 h-8 text-primary/10 mb-4 flex-shrink-0" />

              {/* Text */}
              <p className="text-foreground/80 text-sm leading-relaxed flex-1 mb-6">
                "{review.text}"
              </p>

              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {[...Array(review.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-warning text-warning"
                  />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-border/30">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-11 h-11 rounded-full bg-muted flex-shrink-0 object-cover ring-2 ring-border/30"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-dm font-bold text-sm text-foreground truncate">
                      {review.name}
                    </span>
                    <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground text-[9px] font-bold">
                        ✓
                      </span>
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {review.role} · {review.country}
                  </div>
                </div>
                <span className="bg-primary/[0.06] border border-primary/10 text-primary text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                  {review.plan}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center text-muted-foreground text-sm"
        >
          🌟 Rejoins{" "}
          <strong className="text-foreground">+10 000 créateurs</strong> qui
          font confiance à AvyLink
        </motion.p>
      </div>
    </section>
  );
};

export default Reviews;
