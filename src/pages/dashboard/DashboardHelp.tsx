import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Rocket,
  Link2,
  Palette,
  BarChart3,
  ShoppingBag,
  Users,
  Sparkles,
  Search,
  ChevronRight,
  PlayCircle,
  Lightbulb,
  ShieldCheck,
  CreditCard,
  Layers,
  MessageSquare,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

interface Tutorial {
  icon: typeof Rocket;
  title: string;
  duration: string;
  category: string;
  steps: string[];
}

const TUTORIALS: Tutorial[] = [
  {
    icon: Rocket,
    category: "Démarrage",
    duration: "2 min",
    title: "Créer ma première page AvyLink",
    steps: [
      "Va dans « Ma Page » depuis le menu de gauche.",
      "Renseigne ton nom affiché, ta bio et choisis un nom d'utilisateur (ton URL : avylink.app/u/ton-nom).",
      "Upload un avatar et une bannière (1200×400 recommandé).",
      "Clique sur « Voir mon profil public » en haut à droite pour vérifier le rendu.",
    ],
  },
  {
    icon: Link2,
    category: "Liens",
    duration: "1 min",
    title: "Ajouter et organiser mes liens",
    steps: [
      "Ouvre l'onglet « Liens » dans le menu.",
      "Clique sur « Ajouter un lien », colle l'URL — l'icône est détectée automatiquement (YouTube, Spotify, TikTok…).",
      "Glisse-dépose les liens pour les réorganiser.",
      "Active/désactive un lien avec le bouton interrupteur sans le supprimer.",
    ],
  },
  {
    icon: Palette,
    category: "Design",
    duration: "3 min",
    title: "Personnaliser l'apparence de ma page",
    steps: [
      "Va dans « Apparence » pour choisir un thème, une police et une couleur principale.",
      "Utilise « Modèles » pour partir d'un design prêt à l'emploi (24 templates thématiques).",
      "Active le badge Verified depuis « Ma Page » (offert sur les plans payants).",
      "Désactive « Fait avec AvyLink » depuis « Ma Page » > Pied de page (plans payants).",
    ],
  },
  {
    icon: Layers,
    category: "Multi-pages",
    duration: "2 min",
    title: "Créer plusieurs pages (mode multipage)",
    steps: [
      "Clique sur le sélecteur de page en haut de la sidebar (ou sur la pastille « Mes pages » en mobile).",
      "Appuie sur « Créer une nouvelle page » (Starter = 3 pages, Premium = illimité).",
      "Pour dupliquer : survole une page → icône copie → choisis « Copier le design » ou « Copier tout ».",
      "Bascule entre tes pages à tout moment depuis le sélecteur.",
    ],
  },
  {
    icon: ShoppingBag,
    category: "Boutique",
    duration: "4 min",
    title: "Vendre sur ma page (boutique intégrée)",
    steps: [
      "Ouvre « Boutique » et ajoute tes produits (prix en FCFA, photos, description).",
      "Active le paiement MeSomb (Mobile Money) ou Stripe (CB) depuis « Portefeuille ».",
      "Les acheteurs paient directement sur ta page, tu reçois les fonds dans ton portefeuille AvyLink.",
      "Retire tes gains via virement bancaire ou Mobile Money depuis « Portefeuille ».",
    ],
  },
  {
    icon: BarChart3,
    category: "Stats",
    duration: "1 min",
    title: "Comprendre mes analytics",
    steps: [
      "« Analytics » affiche tes vues, clics, taux de conversion et top pays.",
      "« Heatmap & A/B » te montre où les visiteurs cliquent le plus.",
      "Connecte Google Analytics / Meta Pixel depuis « Intégrations » pour aller plus loin.",
    ],
  },
  {
    icon: Users,
    category: "Équipe",
    duration: "2 min",
    title: "Collaborer en équipe (multi-utilisateurs)",
    steps: [
      "Va dans « Équipe » et invite par email (rôles : Admin, Éditeur, Lecteur).",
      "Les Éditeurs peuvent modifier les liens et le contenu mais pas la facturation.",
      "Retire un membre à tout moment depuis la liste.",
    ],
  },
  {
    icon: CreditCard,
    category: "Abonnement",
    duration: "1 min",
    title: "Changer ou améliorer mon abonnement",
    steps: [
      "Ouvre « Abonnement » dans le menu.",
      "Compare Gratuit / Starter / Premium / Business.",
      "Paie en CB (Stripe) ou Mobile Money (MeSomb).",
      "Tu peux annuler ou changer de plan à tout moment.",
    ],
  },
  {
    icon: ShieldCheck,
    category: "Sécurité",
    duration: "1 min",
    title: "Sécuriser mon compte",
    steps: [
      "Active la connexion via Google pour éviter d'utiliser un mot de passe.",
      "Utilise un mot de passe unique et long (12 caractères minimum).",
      "Ne partage jamais tes accès — les Éditeurs en équipe sont une meilleure solution.",
    ],
  },
];

const TIPS = [
  "Mets ton lien le plus important en premier — c'est lui qui reçoit le plus de clics.",
  "Une bonne bannière de 1200×400 augmente le taux de conversion de 30%.",
  "Active le badge Verified pour gagner la confiance instantanée de tes visiteurs.",
  "Réponds aux messages de support sous 24h pour booster ta réputation.",
  "Partage ta page AvyLink en bio Instagram/TikTok — c'est fait pour ça.",
  "Crée plusieurs pages (mode multipage) pour séparer tes projets perso et pro.",
];

export default function DashboardHelp() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const filtered = TUTORIALS.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.category.toLowerCase().includes(query.toLowerCase()) ||
      t.steps.some((s) => s.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      {/* Hero */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-sm p-5 md:p-6"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.12),transparent_60%)]" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="font-dm font-bold text-xl md:text-2xl text-foreground">
                Comment utiliser AvyLink
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Tutoriels, astuces et bonnes pratiques pour aller plus loin.
              </p>
            </div>
          </div>
          <div className="relative mt-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              strokeWidth={1.8}
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un tutoriel (ex: liens, badge, boutique...)"
              className="pl-9 h-11 rounded-xl"
            />
          </div>
        </div>
      </motion.div>

      {/* Daily tip */}
      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-4 flex items-start gap-3"
      >
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-4 h-4 text-amber-600" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">
            Astuce du jour
          </p>
          <p className="text-sm text-foreground leading-snug">
            {TIPS[new Date().getDate() % TIPS.length]}
          </p>
        </div>
      </motion.div>

      {/* Quick links */}
      <motion.div
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-2.5"
      >
        {[
          { label: "Ma Page", icon: Rocket, to: "/dashboard/page" },
          { label: "Mes liens", icon: Link2, to: "/dashboard/liens" },
          { label: "Modèles", icon: Sparkles, to: "/dashboard/modeles" },
          { label: "Support", icon: MessageSquare, to: "/dashboard/support" },
        ].map((item) => (
          <motion.button
            key={item.label}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(item.to)}
            className="flex flex-col items-start gap-2 p-3 rounded-xl border border-border/50 bg-card/80 hover:border-primary/30 hover:bg-primary/5 transition"
          >
            <item.icon className="w-4 h-4 text-primary" strokeWidth={1.8} />
            <span className="text-xs font-semibold text-foreground">
              {item.label}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Tutorials */}
      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Tutoriels ({filtered.length})
          </p>
          <PlayCircle
            className="w-4 h-4 text-muted-foreground"
            strokeWidth={1.8}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Aucun tutoriel trouvé pour « {query} ».
          </div>
        ) : (
          filtered.map((tuto, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={tuto.title}
                className="border-b border-border/30 last:border-0"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-secondary/40 transition text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center flex-shrink-0">
                    <tuto.icon
                      className="w-4 h-4 text-primary"
                      strokeWidth={1.8}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded-md bg-secondary text-[10px] font-semibold text-muted-foreground">
                        {tuto.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {tuto.duration}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug">
                      {tuto.title}
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    strokeWidth={1.8}
                  />
                </button>
                {isOpen && (
                  <motion.ol
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="px-5 pb-4 pl-[68px] space-y-2"
                  >
                    {tuto.steps.map((step, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground leading-relaxed flex gap-2.5"
                      >
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </motion.ol>
                )}
              </div>
            );
          })
        )}
      </motion.div>

      {/* FAQ shortcut */}
      <motion.div
        custom={4}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-border/50 bg-card/80 p-5 flex items-center gap-4"
      >
        <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <MessageSquare className="w-5 h-5 text-primary" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            Tu n'as pas trouvé ta réponse ?
          </p>
          <p className="text-xs text-muted-foreground">
            Notre équipe répond en moins de 24h.
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/support")}
          className="px-4 py-2 rounded-xl gradient-cta text-primary-foreground text-xs font-bold shadow-blue hover:opacity-95 transition"
        >
          Contacter
        </button>
      </motion.div>
    </div>
  );
}
