import { useState, useEffect } from "react";
import {
  Crown,
  ExternalLink,
  Check,
  Plug,
  Zap,
  X,
  Save,
  Loader2,
  Settings2,
  BarChart3,
  CreditCard,
} from "lucide-react";
import SocialIcon from "@/components/SocialIcon";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { firestoreDB as supabase } from "@/lib/db";
import type { Tables } from "@/lib/types";

type Profile = Tables<"profiles">;
interface Props {
  profile: Profile | null;
  onUpdate: (updates: Partial<Profile>) => Promise<void>;
}

interface IntegrationDef {
  id: string;
  name: string;
  category: string;
  desc: string;
  socialKey?: string;
  lucideIcon?: "analytics" | "stripe";
  color: string;
  bgColor: string;
  isPro: boolean;
  href: string;
  configFields: {
    key: string;
    label: string;
    placeholder: string;
    help: string;
  }[];
  profileField?: keyof Profile;
}

function IntegrationIcon({
  def,
  size = 32,
}: {
  def: IntegrationDef;
  size?: number;
}) {
  if (def.socialKey) return <SocialIcon platform={def.socialKey} size={size} />;
  if (def.lucideIcon === "analytics")
    return <BarChart3 size={size} className="text-white drop-shadow-md" />;
  if (def.lucideIcon === "stripe")
    return <CreditCard size={size} className="text-white drop-shadow-md" />;
  return null;
}

const INTEGRATIONS: IntegrationDef[] = [
  {
    id: "google_analytics",
    name: "Google Analytics",
    category: "Analytics",
    desc: "Suivez le trafic de votre page avec Google Analytics",
    lucideIcon: "analytics",
    color: "bg-orange-100 text-orange-700",
    bgColor: "bg-gradient-to-br from-orange-400 to-yellow-500",
    isPro: false,
    href: "https://analytics.google.com",
    configFields: [
      {
        key: "measurement_id",
        label: "ID de mesure",
        placeholder: "G-XXXXXXXXXX",
        help: "Admin → Propriété → Flux de données",
      },
    ],
    profileField: "google_analytics_id",
  },
  {
    id: "facebook_pixel",
    name: "Facebook Pixel",
    category: "Pixels",
    desc: "Reciblage et conversions Facebook/Meta Ads",
    socialKey: "facebook",
    color: "bg-blue-100 text-blue-700",
    bgColor: "bg-gradient-to-br from-blue-500 to-blue-700",
    isPro: false,
    href: "https://business.facebook.com",
    configFields: [
      {
        key: "pixel_id",
        label: "ID du Pixel",
        placeholder: "123456789012345",
        help: "Facebook Events Manager → Pixels",
      },
    ],
    profileField: "facebook_pixel_id",
  },
  {
    id: "tiktok_pixel",
    name: "TikTok Pixel",
    category: "Pixels",
    desc: "Tracking des conversions TikTok Ads",
    socialKey: "tiktok",
    color: "bg-gray-100 text-gray-700",
    bgColor: "bg-gradient-to-br from-gray-900 to-gray-700",
    isPro: true,
    href: "https://ads.tiktok.com",
    configFields: [
      {
        key: "pixel_id",
        label: "TikTok Pixel ID",
        placeholder: "XXXXXXXXXXXXXXXXX",
        help: "TikTok Ads Manager → Assets → Events",
      },
    ],
    profileField: "tiktok_pixel_id",
  },
  {
    id: "snapchat_pixel",
    name: "Snapchat Pixel",
    category: "Pixels",
    desc: "Tracking des conversions Snapchat Ads",
    socialKey: "snapchat",
    color: "bg-yellow-100 text-yellow-700",
    bgColor: "bg-gradient-to-br from-yellow-400 to-yellow-500",
    isPro: true,
    href: "https://ads.snapchat.com",
    configFields: [
      {
        key: "pixel_id",
        label: "Snapchat Pixel ID",
        placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        help: "Snapchat Ads Manager → Events Manager",
      },
    ],
    profileField: "snapchat_pixel_id",
  },
  {
    id: "pinterest_tag",
    name: "Pinterest Tag",
    category: "Pixels",
    desc: "Tracking des conversions Pinterest Ads",
    socialKey: "pinterest",
    color: "bg-red-100 text-red-700",
    bgColor: "bg-gradient-to-br from-red-500 to-red-600",
    isPro: true,
    href: "https://ads.pinterest.com",
    configFields: [
      {
        key: "tag_id",
        label: "Pinterest Tag ID",
        placeholder: "123456789",
        help: "Pinterest Ads → Conversions → Tag",
      },
    ],
    profileField: "pinterest_tag_id",
  },
  {
    id: "linkedin_insight",
    name: "LinkedIn Insight",
    category: "Pixels",
    desc: "Tracking LinkedIn Campaign Manager",
    socialKey: "linkedin",
    color: "bg-blue-100 text-blue-700",
    bgColor: "bg-gradient-to-br from-blue-600 to-blue-800",
    isPro: true,
    href: "https://www.linkedin.com/campaignmanager",
    configFields: [
      {
        key: "tag_id",
        label: "LinkedIn Insight Tag",
        placeholder: "123456",
        help: "LinkedIn Campaign Manager → Insight Tag",
      },
    ],
    profileField: "linkedin_insight_tag",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    category: "Communication",
    desc: "Bouton WhatsApp direct sur votre page publique",
    socialKey: "whatsapp",
    color: "bg-green-100 text-green-700",
    bgColor: "bg-gradient-to-br from-green-500 to-emerald-600",
    isPro: false,
    href: "https://wa.me",
    configFields: [
      {
        key: "phone",
        label: "Numéro WhatsApp",
        placeholder: "+33612345678",
        help: "Format international avec indicatif pays",
      },
      {
        key: "message",
        label: "Message pré-rempli (optionnel)",
        placeholder: "Bonjour, je viens de votre AvyLink !",
        help: "Ce message sera pré-rempli quand un visiteur clique",
      },
    ],
  },
  {
    id: "spotify",
    name: "Spotify",
    category: "Musique",
    desc: "Affichez vos playlists Spotify sur votre page",
    socialKey: "spotify",
    color: "bg-green-100 text-green-700",
    bgColor: "bg-gradient-to-br from-green-500 to-green-600",
    isPro: false,
    href: "https://open.spotify.com",
    configFields: [
      {
        key: "profile_url",
        label: "URL du profil ou playlist",
        placeholder: "https://open.spotify.com/playlist/...",
        help: "Copiez le lien de partage Spotify",
      },
    ],
  },
  {
    id: "youtube",
    name: "YouTube",
    category: "Vidéo",
    desc: "Intégrez votre chaîne YouTube sur votre page",
    socialKey: "youtube",
    color: "bg-red-100 text-red-700",
    bgColor: "bg-gradient-to-br from-red-500 to-red-600",
    isPro: false,
    href: "https://youtube.com",
    configFields: [
      {
        key: "channel_url",
        label: "URL de la chaîne",
        placeholder: "https://youtube.com/@machaîne",
        help: "Lien vers votre chaîne YouTube",
      },
      {
        key: "channel_id",
        label: "ID de chaîne (optionnel)",
        placeholder: "UC...",
        help: "Nécessaire pour le bouton d'abonnement",
      },
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "Paiement",
    desc: "Acceptez des paiements sur votre page AvyLink",
    lucideIcon: "stripe",
    color: "bg-violet-100 text-violet-700",
    bgColor: "bg-gradient-to-br from-violet-500 to-purple-600",
    isPro: true,
    href: "https://stripe.com",
    configFields: [
      {
        key: "account_id",
        label: "ID du compte Stripe",
        placeholder: "acct_...",
        help: "Stripe Dashboard → Settings → Account details",
      },
    ],
  },
];

const CATEGORIES = [
  "Tous",
  "Analytics",
  "Pixels",
  "Communication",
  "Musique",
  "Vidéo",
  "Paiement",
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

interface IntegrationRecord {
  id: string;
  integration_id: string;
  is_connected: boolean;
  config: Record<string, string>;
}

export default function DashboardIntegrations({ profile, onUpdate }: Props) {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [integrations, setIntegrations] = useState<IntegrationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Load integrations from DB
  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      const { data } = await supabase
        .from("integrations")
        .select("*")
        .eq("profile_id", profile.id);
      setIntegrations(
        (data || []).map((d) => ({
          id: d.id,
          integration_id: d.integration_id,
          is_connected: d.is_connected,
          config: (d.config as Record<string, string>) || {},
        })),
      );
      setLoading(false);
    };
    load();
  }, [profile]);

  const getRecord = (integrationId: string) =>
    integrations.find((i) => i.integration_id === integrationId);
  const isConnected = (integrationId: string) =>
    !!getRecord(integrationId)?.is_connected;

  const openConfig = (def: IntegrationDef) => {
    if (def.isPro && profile?.plan === "free") {
      toast({
        title: "Fonctionnalité Premium 👑",
        description: "Passez au plan Premium pour activer cette intégration.",
        variant: "destructive",
      });
      return;
    }
    const existing = getRecord(def.id);
    // Pre-fill from existing config OR from profile field
    const initialConfig: Record<string, string> = {};
    def.configFields.forEach((f) => {
      if (existing?.config[f.key]) {
        initialConfig[f.key] = existing.config[f.key];
      } else if (def.profileField && f.key === def.configFields[0].key) {
        initialConfig[f.key] =
          ((profile as Record<string, unknown>)?.[
            def.profileField
          ] as string) || "";
      } else {
        initialConfig[f.key] = "";
      }
    });
    setConfigForm(initialConfig);
    setConfiguring(def.id);
  };

  const saveConfig = async (def: IntegrationDef) => {
    if (!profile) return;
    setSaving(true);

    const hasValues = Object.values(configForm).some((v) => v.trim());

    try {
      // If there's a profile field (pixels/analytics), save to profile too
      if (def.profileField && def.configFields[0]) {
        const value = configForm[def.configFields[0].key] || "";
        await onUpdate({
          [def.profileField]: value || null,
        } as Partial<Profile>);
      }

      // Upsert integration record
      const existing = getRecord(def.id);
      if (existing) {
        await supabase
          .from("integrations")
          .update({
            is_connected: hasValues,
            config: configForm,
          })
          .eq("id", existing.id);
        setIntegrations((prev) =>
          prev.map((i) =>
            i.id === existing.id
              ? { ...i, is_connected: hasValues, config: configForm }
              : i,
          ),
        );
      } else if (hasValues) {
        const { data } = await supabase
          .from("integrations")
          .insert({
            profile_id: profile.id,
            integration_id: def.id,
            is_connected: true,
            config: configForm,
          })
          .select()
          .single();
        if (data) {
          setIntegrations((prev) => [
            ...prev,
            {
              id: data.id,
              integration_id: data.integration_id,
              is_connected: data.is_connected,
              config: (data.config as Record<string, string>) || {},
            },
          ]);
        }
      }

      toast({
        title: hasValues
          ? `✅ ${def.name} connecté !`
          : `${def.name} déconnecté`,
      });
      setConfiguring(null);
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const disconnect = async (def: IntegrationDef) => {
    const existing = getRecord(def.id);
    if (!existing) return;
    await supabase
      .from("integrations")
      .update({ is_connected: false, config: {} })
      .eq("id", existing.id);
    if (def.profileField) {
      await onUpdate({ [def.profileField]: null } as Partial<Profile>);
    }
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === existing.id ? { ...i, is_connected: false, config: {} } : i,
      ),
    );
    toast({ title: `${def.name} déconnecté` });
    setConfiguring(null);
  };

  const filtered = INTEGRATIONS.filter(
    (i) => activeCategory === "Tous" || i.category === activeCategory,
  );

  const connectedCount = integrations.filter((i) => i.is_connected).length;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm p-5 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Plug className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-dm font-bold text-lg text-foreground">
              Intégrations
            </h2>
            <p className="text-sm text-muted-foreground">
              Connecte tes outils et plateformes préférés
            </p>
          </div>
          <div className="ml-auto px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {connectedCount} actif{connectedCount > 1 ? "s" : ""}
          </div>
        </div>
      </motion.div>

      {/* Category filter */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              activeCategory === cat
                ? "bg-foreground text-background shadow-md"
                : "bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:border-primary/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((integration, i) => {
              const connected = isConnected(integration.id);
              return (
                <motion.div
                  key={integration.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  layout
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.2)] transition-shadow"
                >
                  {/* Visual header */}
                  <div
                    className={`h-24 ${integration.bgColor} flex items-center justify-center relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent_70%)]" />
                    <motion.div
                      className="relative z-10"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <IntegrationIcon def={integration} size={36} />
                    </motion.div>
                    {integration.isPro && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-lg"
                      >
                        <Crown className="w-3 h-3 text-amber-900" />
                      </motion.div>
                    )}
                    <AnimatePresence>
                      {connected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute top-3 left-3 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-dm font-bold text-sm text-foreground">
                        {integration.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${integration.color}`}
                      >
                        {integration.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      {integration.desc}
                    </p>
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() =>
                          connected
                            ? openConfig(integration)
                            : openConfig(integration)
                        }
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          connected
                            ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                            : integration.isPro && profile?.plan === "free"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-primary text-primary-foreground shadow-sm hover:opacity-90"
                        }`}
                      >
                        {connected ? (
                          <>
                            <Settings2 className="w-3 h-3" /> Configurer
                          </>
                        ) : integration.isPro && profile?.plan === "free" ? (
                          "👑 Passer Pro"
                        ) : (
                          "Connecter"
                        )}
                      </motion.button>
                      <a
                        href={integration.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl border border-border/50 hover:bg-secondary text-muted-foreground transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Configuration modal */}
      <AnimatePresence>
        {configuring &&
          (() => {
            const def = INTEGRATIONS.find((i) => i.id === configuring)!;
            const connected = isConnected(def.id);
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setConfiguring(null);
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 40, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="bg-card rounded-2xl w-full max-w-md shadow-2xl flex flex-col my-auto"
                  style={{ maxHeight: "calc(100vh - 2rem)" }}
                >
                  <div className="flex items-center justify-between p-5 border-b border-border bg-card z-10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: def.bgColor.includes("from-")
                            ? undefined
                            : undefined,
                        }}
                      >
                        <IntegrationIcon def={def} size={24} />
                      </div>
                      <div>
                        <h3 className="font-dm font-bold text-base text-foreground">
                          {def.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {def.category}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setConfiguring(null)}
                      className="p-1.5 rounded-lg hover:bg-secondary"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-5 space-y-4">
                    <p className="text-sm text-muted-foreground">{def.desc}</p>

                    {def.configFields.map((field) => (
                      <div key={field.key}>
                        <label className="text-sm font-medium text-foreground mb-1 block">
                          {field.label}
                        </label>
                        <Input
                          value={configForm[field.key] || ""}
                          onChange={(e) =>
                            setConfigForm((prev) => ({
                              ...prev,
                              [field.key]: e.target.value,
                            }))
                          }
                          placeholder={field.placeholder}
                          className="rounded-xl"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {field.help}
                        </p>
                      </div>
                    ))}

                    {connected && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">
                          Intégration active
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 border-t border-border flex gap-3">
                    <Button
                      onClick={() => saveConfig(def)}
                      disabled={saving}
                      className="flex-1 bg-primary text-primary-foreground rounded-xl"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {connected ? "Mettre à jour" : "Connecter"}
                    </Button>
                    {connected && (
                      <Button
                        variant="outline"
                        onClick={() => disconnect(def)}
                        className="rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Déconnecter
                      </Button>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
      </AnimatePresence>

      {/* Tips banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="relative rounded-2xl border border-primary/20 p-5 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-xl" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-dm font-semibold text-sm text-foreground mb-1">
              Comment ça marche ?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cliquez sur <strong>"Connecter"</strong> pour configurer une
              intégration. Renseignez vos identifiants (Pixel ID, URL, etc.) et
              ils seront automatiquement injectés sur votre page publique. Les
              pixels de tracking se déclenchent à chaque visite.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
