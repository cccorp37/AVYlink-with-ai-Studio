import { useState } from "react";
import {
  ArrowLeft,
  Save,
  Loader2,
  Star,
  Search,
  BarChart2,
  Target,
  Link2,
  Smartphone,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import type { Tables } from "@/lib/types";

type Profile = Tables<"profiles">;

interface Props {
  profile: Profile | null;
  onUpdate: (updates: Partial<Profile>) => Promise<void>;
  onBack: () => void;
}

type ActiveSection =
  null | "favicon" | "seo" | "analytics" | "pixel" | "pixels_all" | "utm";

export default function DashboardAdvancedSettings({
  profile,
  onUpdate,
  onBack,
}: Props) {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [saving, setSaving] = useState(false);
  const p = profile as Record<string, unknown> | null;
  const [form, setForm] = useState({
    seo_title: (p?.seo_title as string) || "",
    seo_description: (p?.seo_description as string) || "",
    google_analytics_id: (p?.google_analytics_id as string) || "",
    facebook_pixel_id: (p?.facebook_pixel_id as string) || "",
    favicon_url: (p?.favicon_url as string) || "",
    tiktok_pixel_id: (p?.tiktok_pixel_id as string) || "",
    snapchat_pixel_id: (p?.snapchat_pixel_id as string) || "",
    pinterest_tag_id: (p?.pinterest_tag_id as string) || "",
    linkedin_insight_tag: (p?.linkedin_insight_tag as string) || "",
  });

  const save = async (fields: Partial<typeof form>) => {
    if (!profile) return;
    setSaving(true);
    await onUpdate(fields as Partial<Profile>);
    setSaving(false);
    toast({ title: "✅ Réglages avancés sauvegardés !" });
  };

  const SECTIONS = [
    {
      id: "favicon" as ActiveSection,
      icon: Star,
      title: "Icône de favori",
      desc: "Icône affichée dans les onglets du navigateur et l'écran d'accueil.",
    },
    {
      id: "seo" as ActiveSection,
      icon: Search,
      title: "SEO",
      desc: "Améliorez la visibilité de votre site auprès des moteurs de recherche.",
    },
    {
      id: "analytics" as ActiveSection,
      icon: BarChart2,
      title: "Google Analytics",
      desc: "Ajoutez Google Analytics pour exploiter la puissance de GA.",
    },
    {
      id: "pixel" as ActiveSection,
      icon: Target,
      title: "Facebook Pixel",
      desc: "Ajoutez le code pixel Facebook pour le reciblage et les conversions.",
    },
    {
      id: "pixels_all" as ActiveSection,
      icon: Smartphone,
      title: "Tous les Pixels",
      desc: "TikTok, Snapchat, Pinterest, LinkedIn — tous vos pixels en un seul endroit.",
    },
    {
      id: "utm" as ActiveSection,
      icon: Link2,
      title: "UTM Parameters",
      desc: "Paramètres UTM automatiques pour le suivi dans Google Analytics.",
    },
  ];

  if (activeSection) {
    const section = SECTIONS.find((s) => s.id === activeSection)!;
    const SectionIcon = section.icon;

    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
        <button
          onClick={() => setActiveSection(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {section.title}
        </button>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <SectionIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-dm font-bold text-base text-foreground">
                {section.title}
              </h3>
              <p className="text-xs text-muted-foreground">{section.desc}</p>
            </div>
          </div>

          {activeSection === "favicon" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  URL de l'icône
                </label>
                <Input
                  value={form.favicon_url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, favicon_url: e.target.value }))
                  }
                  placeholder="https://..."
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Format recommandé : 32x32 ou 64x64 px (PNG, ICO)
                </p>
              </div>
              {form.favicon_url && (
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                  <img
                    src={form.favicon_url}
                    alt="Favicon"
                    className="w-8 h-8 rounded object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className="text-sm text-foreground">
                    Aperçu de l'icône
                  </span>
                </div>
              )}
              <Button
                onClick={() =>
                  save({ favicon_url: form.favicon_url } as Partial<Profile>)
                }
                disabled={saving}
                className="w-full bg-primary text-primary-foreground rounded-xl"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}{" "}
                Sauvegarder
              </Button>
            </div>
          )}

          {activeSection === "seo" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Titre SEO
                </label>
                <Input
                  value={form.seo_title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, seo_title: e.target.value }))
                  }
                  placeholder="Mon profil - Nom | AvyLink"
                  maxLength={60}
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {form.seo_title.length}/60 caractères
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Description SEO
                </label>
                <textarea
                  value={form.seo_description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, seo_description: e.target.value }))
                  }
                  placeholder="Découvrez mon profil AvyLink..."
                  maxLength={160}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {form.seo_description.length}/160 caractères
                </p>
              </div>
              {(form.seo_title || form.seo_description) && (
                <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">
                    Aperçu Google
                  </p>
                  <p className="text-primary text-sm font-medium">
                    {form.seo_title || "Titre de votre page"}
                  </p>
                  <p className="text-green-600 text-xs">
                    avylink.app/u/{profile?.username || "..."}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {form.seo_description || "Description..."}
                  </p>
                </div>
              )}
              <Button
                onClick={() =>
                  save({
                    seo_title: form.seo_title,
                    seo_description: form.seo_description,
                  } as Partial<Profile>)
                }
                disabled={saving}
                className="w-full bg-primary text-primary-foreground rounded-xl"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}{" "}
                Sauvegarder
              </Button>
            </div>
          )}

          {activeSection === "analytics" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  ID de mesure Google Analytics
                </label>
                <Input
                  value={form.google_analytics_id}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      google_analytics_id: e.target.value,
                    }))
                  }
                  placeholder="G-XXXXXXXXXX"
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Admin → Propriété → Flux de données
                </p>
              </div>
              <Button
                onClick={() =>
                  save({
                    google_analytics_id: form.google_analytics_id,
                  } as Partial<Profile>)
                }
                disabled={saving}
                className="w-full bg-primary text-primary-foreground rounded-xl"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}{" "}
                Sauvegarder
              </Button>
            </div>
          )}

          {activeSection === "pixel" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  ID du pixel Facebook
                </label>
                <Input
                  value={form.facebook_pixel_id}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      facebook_pixel_id: e.target.value,
                    }))
                  }
                  placeholder="123456789012345"
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Facebook Events Manager → Pixels
                </p>
              </div>
              <Button
                onClick={() =>
                  save({
                    facebook_pixel_id: form.facebook_pixel_id,
                  } as Partial<Profile>)
                }
                disabled={saving}
                className="w-full bg-primary text-primary-foreground rounded-xl"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}{" "}
                Sauvegarder
              </Button>
            </div>
          )}

          {activeSection === "pixels_all" && (
            <div className="space-y-5">
              {[
                {
                  key: "tiktok_pixel_id",
                  label: "TikTok Pixel ID",
                  placeholder: "XXXXXXXXXXXXXXXXX",
                  icon: "🎵",
                  help: "TikTok Ads Manager → Assets → Events",
                },
                {
                  key: "snapchat_pixel_id",
                  label: "Snapchat Pixel ID",
                  placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                  icon: "👻",
                  help: "Snapchat Ads Manager → Events Manager",
                },
                {
                  key: "pinterest_tag_id",
                  label: "Pinterest Tag ID",
                  placeholder: "123456789",
                  icon: "📌",
                  help: "Pinterest Ads → Conversions → Tag",
                },
                {
                  key: "linkedin_insight_tag",
                  label: "LinkedIn Insight Tag",
                  placeholder: "123456",
                  icon: "💼",
                  help: "LinkedIn Campaign Manager → Insight Tag",
                },
              ].map((pixel) => (
                <div
                  key={pixel.key}
                  className="p-4 rounded-xl border border-border/50 bg-muted/10 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{pixel.icon}</span>
                    <label className="text-sm font-semibold text-foreground">
                      {pixel.label}
                    </label>
                  </div>
                  <Input
                    value={(form as Record<string, string>)[pixel.key] || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [pixel.key]: e.target.value }))
                    }
                    placeholder={pixel.placeholder}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">{pixel.help}</p>
                </div>
              ))}
              <Button
                onClick={() =>
                  save({
                    tiktok_pixel_id: form.tiktok_pixel_id,
                    snapchat_pixel_id: form.snapchat_pixel_id,
                    pinterest_tag_id: form.pinterest_tag_id,
                    linkedin_insight_tag: form.linkedin_insight_tag,
                  } as Partial<Profile>)
                }
                disabled={saving}
                className="w-full bg-primary text-primary-foreground rounded-xl"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}{" "}
                Sauvegarder tous les pixels
              </Button>
            </div>
          )}

          {activeSection === "utm" && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-sm font-medium text-green-700 mb-2">
                  ✅ Paramètres UTM actifs
                </p>
                <p className="text-xs text-muted-foreground">
                  Les paramètres UTM sont automatiquement ajoutés à vos liens.
                </p>
              </div>
              <div className="space-y-2">
                {[
                  ["utm_source", "avylink"],
                  ["utm_medium", "social"],
                  ["utm_campaign", "[titre du lien]"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <span className="text-sm text-muted-foreground">{k}</span>
                    <span className="text-sm font-medium text-foreground">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Retour aux paramètres
      </button>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-border/50">
          <h2 className="font-dm font-bold text-base text-foreground">
            Réglages avancés
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configuration SEO, Analytics et tracking
          </p>
        </div>
        {SECTIONS.map((section, i) => {
          const SectionIcon = section.icon;
          return (
            <motion.button
              key={section.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveSection(section.id)}
              whileHover={{
                x: 4,
                backgroundColor: "hsl(var(--secondary) / 0.6)",
              }}
              className="w-full flex items-start gap-4 px-5 py-4 transition-colors border-b border-border/30 last:border-0 text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <SectionIcon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {section.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {section.desc}
                </p>
              </div>
              <ArrowLeft className="w-4 h-4 text-muted-foreground flex-shrink-0 rotate-180 mt-1" />
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
