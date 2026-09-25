import {
  Instagram,
  Youtube,
  Twitter,
  Music,
  ShoppingBag,
  Globe,
  Heart,
  ExternalLink,
  Play,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";

const profileLinks = [
  {
    icon: Instagram,
    label: "Instagram",
    handle: "@kofi.creates",
    color: "bg-gradient-to-br from-purple-500 to-pink-500",
    url: "#",
  },
  {
    icon: Youtube,
    label: "YouTube",
    handle: "Kofi Creates TV",
    color: "bg-red-500",
    url: "#",
  },
  {
    icon: Twitter,
    label: "Twitter / X",
    handle: "@kofi_creates",
    color: "bg-sky-500",
    url: "#",
  },
  {
    icon: Music,
    label: "Spotify",
    handle: "Écouter ma musique",
    color: "bg-green-500",
    url: "#",
  },
  {
    icon: ShoppingBag,
    label: "Ma Boutique",
    handle: "shop.kofi.avylink.com",
    color: "bg-gradient-cta",
    url: "#",
  },
  {
    icon: Globe,
    label: "Mon Portfolio",
    handle: "kofi.design",
    color: "bg-primary",
    url: "#",
  },
];

const steps = [
  {
    step: "01",
    title: "Crée ton compte",
    desc: "Email, Google ou téléphone — c'est toi qui choisis",
  },
  {
    step: "02",
    title: "Personnalise ta page",
    desc: "Ajoute tes liens, choisis ton thème, upload ta photo",
  },
  {
    step: "03",
    title: "Partage ton lien",
    desc: "avylink.com/tonnom — mets-le partout !",
  },
  {
    step: "04",
    title: "Suis tes stats",
    desc: "Analytics en temps réel, sources de trafic, clics",
  },
];

const ProfileDemo = () => {
  return (
    <section id="demo" className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 space-y-4"
        >
          <h2 className="font-dm font-black text-4xl md:text-6xl text-foreground tracking-tight">
            Voilà à quoi ressemble
            <br />
            <span className="bg-gradient-to-r from-primary to-[hsl(338,85%,65%)] bg-clip-text text-transparent">
              ta page AVYLINK
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Simple, beau, professionnel. En moins de 5 minutes.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-16 justify-center">
          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50, rotateY: 8 }}
            whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Glow behind phone */}
            <div className="absolute -inset-10 bg-gradient-to-br from-primary/10 via-transparent to-[hsl(338,85%,65%)]/10 rounded-[4rem] blur-3xl" />

            {/* Phone frame */}
            <div className="relative w-80 bg-foreground rounded-[3rem] p-3 shadow-2xl">
              <div
                className="w-full bg-white rounded-[2.4rem] overflow-hidden"
                style={{ minHeight: 640 }}
              >
                {/* Notch */}
                <div className="bg-primary/5 px-6 pt-4 pb-2 flex justify-between items-center text-xs text-muted-foreground">
                  <span>9:41</span>
                  <div className="w-24 h-5 bg-foreground rounded-full" />
                  <span>●●●</span>
                </div>

                {/* Profile content */}
                <div className="bg-gradient-to-b from-primary/[0.03] to-background min-h-full px-5 pb-8 pt-4 space-y-5">
                  {/* Avatar */}
                  <div className="text-center space-y-2">
                    <div className="relative inline-block">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-[hsl(207,89%,42%)] flex items-center justify-center text-3xl mx-auto shadow-lg ring-4 ring-white">
                        👨🏿‍💻
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">
                          ✓
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-dm font-bold text-base text-foreground">
                        Kofi Asante
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <MapPin className="w-3 h-3" /> Accra, Ghana 🇬🇭
                      </p>
                      <p className="text-xs text-foreground/70 mt-1 max-w-48 mx-auto">
                        🎨 Designer & Créateur de contenu
                      </p>
                    </div>
                    <div className="flex justify-center gap-3 text-xs">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                        ✓ Certified
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Heart className="w-3 h-3 text-[hsl(338,85%,65%)]" />{" "}
                        24.5K
                      </span>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="space-y-2.5">
                    {profileLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <div
                          key={link.label}
                          className="flex items-center gap-3 bg-white rounded-2xl px-3 py-2.5 shadow-sm border border-border/30 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 group"
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${link.color}`}
                          >
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-xs text-foreground">
                              {link.label}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {link.handle}
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      );
                    })}
                  </div>

                  {/* YouTube */}
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border/30">
                    <div className="relative bg-foreground/5 h-20 flex items-center justify-center">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      </div>
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-xs font-semibold text-foreground">
                        Comment j'ai gagné 1M FCFA en 30 jours
                      </p>
                      <p className="text-xs text-muted-foreground">
                        142K vues · il y a 3 jours
                      </p>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      Powered by{" "}
                      <span className="text-gradient font-semibold">
                        AvyLink
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating decorations */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute -right-8 top-16 bg-card rounded-2xl px-4 py-3 shadow-lg border border-border/30 text-center"
            >
              <div className="text-xl">🔥</div>
              <div className="text-xs font-black text-foreground">Viral!</div>
              <div className="text-[10px] text-muted-foreground">+4.2K/j</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7, type: "spring" }}
              className="absolute -left-8 bottom-24 bg-card rounded-2xl px-4 py-3 shadow-lg border border-border/30 text-center"
            >
              <div className="text-xl">💰</div>
              <div className="text-xs font-black text-foreground">Revenus</div>
              <div className="text-[10px] text-muted-foreground">340K FCFA</div>
            </motion.div>
          </motion.div>

          {/* Right side — Steps */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-md space-y-10"
          >
            <div>
              <h3 className="font-dm font-black text-3xl text-foreground mb-3">
                Crée ta page en{" "}
                <span className="bg-gradient-to-r from-primary to-[hsl(338,85%,65%)] bg-clip-text text-transparent">
                  5 minutes
                </span>
              </h3>
              <p className="text-muted-foreground text-lg">
                Pas besoin de coder. Notre éditeur drag-and-drop te permet de
                tout personnaliser.
              </p>
            </div>

            <div className="space-y-6">
              {steps.map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-5 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[hsl(207,89%,42%)] text-primary-foreground flex items-center justify-center font-dm font-black text-sm flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                    {s.step}
                  </div>
                  <div>
                    <h4 className="font-dm font-bold text-foreground text-base">
                      {s.title}
                    </h4>
                    <p className="text-muted-foreground text-sm mt-0.5">
                      {s.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="bg-primary/[0.04] border border-primary/10 rounded-2xl p-6"
            >
              <p className="text-primary font-bold text-sm mb-1">
                💡 Le saviez-vous ?
              </p>
              <p className="text-foreground/70 text-sm leading-relaxed">
                Les créateurs AvyLink génèrent en moyenne{" "}
                <strong className="text-foreground">3x plus de clics</strong>{" "}
                qu'avec Linktree, grâce à nos pages optimisées pour le marché
                africain.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProfileDemo;
