import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  LogOut,
  Trash2,
  Shield,
  Bell,
  Globe,
  ChevronRight,
  HelpCircle,
  Mail,
  Facebook,
  Instagram,
  Settings2,
  Wallet,
  MessageSquare,
  ExternalLink,
  Lock,
  Sun,
  Moon,
  Lightbulb,
  BookOpen,
  Download,
} from "lucide-react";
import { firestoreDB as supabase } from "@/lib/db";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useLanguage } from "@/hooks/useLanguage";
import type { Tables } from "@/lib/types";
import DashboardAdvancedSettings from "./DashboardAdvancedSettings";
import DashboardFormMessages from "./DashboardFormMessages";

type Profile = Tables<"profiles">;

interface Props {
  profile: Profile | null;
  onUpdate: (updates: Partial<Profile>) => Promise<void>;
}

type SubPage = null | "advanced" | "messages" | "wallet" | "domain";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function DashboardSettings({ profile, onUpdate }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [notifs, setNotifs] = useState(() => {
    try {
      const saved = localStorage.getItem("avylink_notifs");
      return saved
        ? JSON.parse(saved)
        : { newVisitor: true, weeklyReport: true, tips: true };
    } catch {
      return { newVisitor: true, weeklyReport: true, tips: true };
    }
  });
  const [subPage, setSubPage] = useState<SubPage>(null);

  useEffect(() => {
    localStorage.setItem("avylink_notifs", JSON.stringify(notifs));
  }, [notifs]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast({ title: "À bientôt ! 👋" });
  };

  const handleSaveNotifs = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast({ title: "✅ Préférences sauvegardées" });
  };

  if (subPage === "advanced")
    return (
      <DashboardAdvancedSettings
        profile={profile}
        onUpdate={onUpdate}
        onBack={() => setSubPage(null)}
      />
    );
  if (subPage === "messages")
    return (
      <DashboardFormMessages
        profile={profile}
        onBack={() => setSubPage(null)}
      />
    );

  const generalItems = [
    {
      icon: Globe,
      label: "Gestion de domaine",
      desc: "Connecte ton propre domaine",
      onClick: () => setSubPage("domain"),
      gradient: "from-blue-500/20 to-cyan-500/10",
    },
    {
      icon: MessageSquare,
      label: "Mes messages de formulaire",
      desc: "Voir les soumissions reçues",
      onClick: () => setSubPage("messages"),
      gradient: "from-green-500/20 to-emerald-500/10",
    },
    {
      icon: Wallet,
      label: "Mon portefeuille",
      desc: "Revenus et transactions",
      onClick: () => navigate("/dashboard/portefeuille"),
      gradient: "from-amber-500/20 to-orange-500/10",
    },
    {
      icon: Settings2,
      label: "Réglages avancés",
      desc: "SEO, Analytics, Pixel",
      onClick: () => setSubPage("advanced"),
      gradient: "from-purple-500/20 to-violet-500/10",
    },
  ];

  const contactItems = [
    {
      icon: BookOpen,
      label: "Comment utiliser AvyLink",
      onClick: () => navigate("/dashboard/aide"),
    },
    {
      icon: HelpCircle,
      label: "Centre d'aide",
      onClick: () => navigate("/dashboard/aide"),
    },
    {
      icon: MessageSquare,
      label: "Contacter le support",
      onClick: () => navigate("/dashboard/support"),
    },
    {
      icon: Mail,
      label: "Envoyez-nous un email",
      href: "mailto:avydigitalbusiness@gmail.com",
    },
    {
      icon: Facebook,
      label: "Suis nous sur Facebook",
      href: "https://facebook.com",
    },
    {
      icon: Instagram,
      label: "Suis nous sur Instagram",
      href: "https://instagram.com",
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      {/* Profile card */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm p-5 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="flex items-center gap-4 mb-4 relative z-10">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-xl font-bold shadow-lg flex-shrink-0">
            {(profile?.display_name || user?.email || "U")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-dm font-bold text-base text-foreground truncate">
              {profile?.display_name || "Mon profil"}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
          <button className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-3 relative z-10">
          <button className="flex-1 py-2 px-4 rounded-xl border border-border/50 text-sm font-medium text-foreground hover:bg-secondary transition-colors backdrop-blur-sm">
            Gérer son compte
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-sm font-bold transition-colors flex items-center justify-center gap-1 shadow-lg"
          >
            Améliorer 👑
          </motion.button>
        </div>
      </motion.div>

      {/* Account */}
      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-dm font-bold text-base text-foreground">
            Compte
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Email
            </label>
            <Input
              value={user?.email || ""}
              readOnly
              className="rounded-xl bg-muted/30 text-muted-foreground cursor-not-allowed border-border/50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              L'email ne peut pas être modifié ici.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Plan actuel
            </label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-muted/20 backdrop-blur-sm">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${profile?.plan === "free" ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"}`}
              >
                {profile?.plan || "free"}
              </span>
              <span className="text-sm text-muted-foreground">
                {profile?.plan === "free"
                  ? "Plan gratuit — limité à 5 liens"
                  : "Accès complet"}
              </span>
              {profile?.plan === "free" && (
                <button className="ml-auto text-xs font-semibold text-primary hover:underline">
                  Upgrader →
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Général */}
      <motion.div
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-3 border-b border-border/50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Général
          </p>
        </div>
        {generalItems.map((item, idx) => (
          <motion.button
            key={item.label}
            onClick={item.onClick}
            whileHover={{
              x: 4,
              backgroundColor: "hsl(var(--secondary) / 0.6)",
            }}
            transition={{ duration: 0.15 }}
            className="w-full flex items-center gap-4 px-5 py-4 transition-colors border-b border-border/30 last:border-0"
          >
            <div
              className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0`}
            >
              <item.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-foreground">
                {item.label}
              </p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </motion.button>
        ))}
      </motion.div>

      {/* Notifications */}
      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-dm font-bold text-base text-foreground">
            Notifications
          </h3>
        </div>
        <div className="space-y-3">
          {[
            {
              key: "newVisitor",
              label: "Nouveau visiteur",
              desc: "Quand quelqu'un visite ton profil",
            },
            {
              key: "weeklyReport",
              label: "Rapport hebdomadaire",
              desc: "Résumé de tes stats chaque semaine",
            },
            {
              key: "tips",
              label: "Conseils & astuces",
              desc: "Recommandations pour booster ton profil",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-2"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() =>
                  setNotifs((n) => ({
                    ...n,
                    [item.key]: !n[item.key as keyof typeof n],
                  }))
                }
                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${notifs[item.key as keyof typeof notifs] ? "bg-primary" : "bg-muted"}`}
              >
                <motion.span
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md ${notifs[item.key as keyof typeof notifs] ? "left-6" : "left-1"}`}
                />
              </motion.button>
            </div>
          ))}
        </div>
        <Button
          onClick={handleSaveNotifs}
          disabled={saving}
          size="sm"
          className="mt-4 bg-primary text-primary-foreground rounded-xl hover:opacity-90"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-1" />
          )}
          Sauvegarder
        </Button>
      </motion.div>

      {/* Theme */}
      <motion.div
        custom={4}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            {theme === "dark" ? (
              <Moon className="w-4 h-4 text-primary" />
            ) : (
              <Sun className="w-4 h-4 text-primary" />
            )}
          </div>
          <h3 className="font-dm font-bold text-base text-foreground">
            Apparence (mode clair / sombre)
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "light", label: "Mode clair", icon: Sun },
            { id: "dark", label: "Mode sombre", icon: Moon },
          ].map((t) => (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setTheme(t.id);
                toast({ title: `${t.label} activé` });
              }}
              className={`py-3 px-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${theme === t.id ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-border/50 text-muted-foreground hover:border-primary/40"}`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Language */}
      <motion.div
        custom={5}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Globe className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-dm font-bold text-base text-foreground">
            Langue
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { id: "fr", label: "🇫🇷 Français" },
              { id: "en", label: "🇬🇧 English" },
            ] as const
          ).map((l) => (
            <motion.button
              key={l.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setLang(l.id);
                toast({
                  title:
                    l.id === "fr" ? "Langue : Français" : "Language: English",
                });
              }}
              className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${lang === l.id ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-border/50 text-muted-foreground hover:border-primary/40"}`}
            >
              {l.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Application Install */}
      <motion.div
        custom={6}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-card/80 backdrop-blur-xl rounded-2xl border border-primary/20 shadow-sm p-5 bg-gradient-to-br from-primary/5 to-transparent"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-dm font-bold text-base text-foreground">
                Installer AvyLink
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Accédez rapidement depuis votre écran d'accueil
              </p>
            </div>
          </div>
          <Button
            onClick={() => (window.location.href = "/install")}
            className="rounded-xl gradient-cta text-white"
          >
            Installer
          </Button>
        </div>
      </motion.div>

      {/* Astuce du jour */}
      <motion.div
        custom={6}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-4 flex items-start gap-3"
      >
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">
            Astuce du jour
          </p>
          <p className="text-sm text-foreground leading-snug">
            {
              [
                "Mets ton lien le plus important en premier.",
                "Une bannière 1200×400 booste le taux de clic.",
                "Active le badge Verified pour gagner en crédibilité.",
                "Crée plusieurs pages pour séparer projets perso et pro.",
                "Partage ta page AvyLink en bio Instagram & TikTok.",
              ][new Date().getDate() % 5]
            }
          </p>
        </div>
      </motion.div>

      {/* Contact / Aide */}
      <motion.div
        custom={7}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-3 border-b border-border/50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Aide & contact
          </p>
        </div>
        {contactItems.map((item: any) => {
          const content = (
            <>
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="flex-1 text-sm font-medium text-foreground text-left">
                {item.label}
              </span>
              {item.href?.startsWith("http") ||
              item.href?.startsWith("mailto") ? (
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
            </>
          );
          if (item.onClick) {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-secondary/60 transition-colors border-b border-border/30 last:border-0 text-left"
              >
                {content}
              </button>
            );
          }
          return (
            <a
              key={item.label}
              href={item.href}
              target={item.href?.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-secondary/60 transition-colors border-b border-border/30 last:border-0"
            >
              {content}
            </a>
          );
        })}
      </motion.div>

      {/* Déconnexion */}
      <motion.div
        custom={6}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-all shadow-sm"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span className="text-sm font-semibold">Se déconnecter</span>
        </motion.button>
      </motion.div>

      {/* Danger zone */}
      <motion.div
        custom={7}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-card/80 backdrop-blur-xl rounded-2xl border border-destructive/20 shadow-sm p-5"
      >
        <h3 className="font-dm font-bold text-base text-destructive mb-4">
          ⚠️ Zone dangereuse
        </h3>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
          onClick={() =>
            toast({
              title: "Fonctionnalité bientôt disponible",
              variant: "destructive",
            })
          }
        >
          <Trash2 className="w-4 h-4" /> Supprimer mon compte
        </Button>
      </motion.div>
    </div>
  );
}
