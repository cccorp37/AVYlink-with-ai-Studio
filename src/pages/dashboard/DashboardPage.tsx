import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Save,
  Loader2,
  Copy,
  Check,
  Globe,
  Plus,
  X,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  Heading,
  Video,
  Music,
  Link2,
  ClipboardList,
  Minus,
  Type,
  Mic,
  Clapperboard,
  Instagram,
  Youtube,
  ExternalLink,
  BadgeCheck,
  Smartphone,
  Palette,
  ArrowRight,
  Lock,
  EyeOff,
  ShoppingBag,
  Briefcase,
  Calendar,
  Tag,
  BookOpen,
  FileArchive,
  Crown,
  Sparkles,
  LayoutTemplate,
  AlignLeft,
  AlignCenter,
  Share2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SocialIcon, {
  PLATFORM_COLORS,
  PLATFORM_LABELS,
  formatSocialUrl,
} from "@/components/SocialIcon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { firestoreDB as supabase } from "@/lib/db";
import type { Tables } from "@/lib/types";
import { VerifiedBadge, BADGE_STYLES } from "@/components/VerifiedBadge";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { motion } from "framer-motion";

const PAGE_THEMES = [
  { id: "default", name: "Classique", preview: "linear-gradient(135deg,#ffffff 60%,#e6f4fd)", emoji: "☀️" },
  { id: "dark", name: "Sombre", preview: "linear-gradient(135deg,#0f172a,#1e293b)", emoji: "🌙" },
  { id: "ocean", name: "Océan", preview: "linear-gradient(135deg,#e0f2fe,#bae6fd)", emoji: "🌊" },
  { id: "rose", name: "Rose", preview: "linear-gradient(135deg,#fdf2f8,#fbcfe8)", emoji: "🌸" },
  { id: "forest", name: "Forêt", preview: "linear-gradient(135deg,#f0fdf4,#bbf7d0)", emoji: "🌲" },
  { id: "sunset", name: "Sunset", preview: "linear-gradient(135deg,#fff7ed,#fed7aa)", emoji: "🌅" },
  { id: "grape", name: "Violet", preview: "linear-gradient(135deg,#faf5ff,#e9d5ff)", emoji: "🍇" },
  { id: "luxury", name: "Luxe Or", preview: "linear-gradient(135deg,#1c1917,#292524)", emoji: "👑" },
];

const BUTTON_OPTIONS = [
  { id: "rounded", label: "Arrondi", radius: "rounded-xl" },
  { id: "pill", label: "Pilule", radius: "rounded-full" },
  { id: "square", label: "Carré", radius: "rounded-none" },
  { id: "glass", label: "Glass", radius: "rounded-xl backdrop-blur-md" },
  { id: "outline", label: "Contour", radius: "rounded-xl border-2" },
  { id: "soft", label: "Doux", radius: "rounded-2xl" },
];

const QUICK_TEMPLATES = [
  { id: "creator", name: "Créateur Digital", theme: "grape", button_style: "pill", font_style: "poppins", desc: "Design moderne et dynamique pour artistes et influenceurs" },
  { id: "business", name: "E-Commerce Pro", theme: "dark", button_style: "rounded", font_style: "inter", desc: "Sobre, contrasté et taillé pour convertir les ventes" },
  { id: "coach", name: "Formateur & Coach", theme: "ocean", button_style: "soft", font_style: "dm", desc: "Idéal pour présenter cours, ateliers et prises de rendez-vous" },
  { id: "minimal", name: "Minimaliste Chic", theme: "default", button_style: "outline", font_style: "playfair", desc: "Épuré, raffiné, centré sur le contenu essentiel" },
];

type Profile = Tables<"profiles">;

interface Props {
  profile: Profile | null;
  onUpdate: (updates: Partial<Profile>) => Promise<void>;
}

interface PageBlock {
  id: string;
  type: string;
  title: string | null;
  content: Record<string, unknown>;
  position: number;
  is_active: boolean;
}

const BLOCK_TYPES: {
  type: string;
  label: string;
  Icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  desc: string;
  preview: string;
  premium?: boolean;
}[] = [
  {
    type: "heading",
    label: "Entête",
    Icon: Heading,
    iconColor: "text-violet-500",
    iconBg: "bg-violet-100 dark:bg-violet-500/20",
    desc: "Titre ou sous-titre de section",
    preview: "bg-purple-50 border-purple-200",
  },
  {
    type: "social_icons",
    label: "Icônes sociales",
    Icon: Globe,
    iconColor: "text-sky-500",
    iconBg: "bg-sky-100 dark:bg-sky-500/20",
    desc: "Facebook, Instagram, Twitter, TikTok...",
    preview: "bg-blue-50 border-blue-200",
  },
  {
    type: "video",
    label: "Vidéo",
    Icon: Clapperboard,
    iconColor: "text-rose-500",
    iconBg: "bg-rose-100 dark:bg-rose-500/20",
    desc: "YouTube, Vimeo, TikTok, Twitch",
    preview: "bg-red-50 border-red-200",
  },
  {
    type: "music",
    label: "La musique",
    Icon: Music,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
    desc: "Spotify, Apple Music, SoundCloud",
    preview: "bg-green-50 border-green-200",
  },
  {
    type: "group",
    label: "Groupe de liens",
    Icon: Link2,
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-100 dark:bg-indigo-500/20",
    desc: "Grouper plusieurs liens",
    preview: "bg-indigo-50 border-indigo-200",
  },
  {
    type: "form",
    label: "Formulaire",
    Icon: ClipboardList,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-100 dark:bg-amber-500/20",
    desc: "Collecte nom, email, message",
    preview: "bg-orange-50 border-orange-200",
  },
  {
    type: "social_embed",
    label: "Publication sociale",
    Icon: Instagram,
    iconColor: "text-pink-500",
    iconBg: "bg-pink-100 dark:bg-pink-500/20",
    desc: "Aperçu d'une publication Instagram, X, TikTok...",
    preview: "bg-pink-50 border-pink-200",
    premium: true,
  },
  {
    type: "divider",
    label: "Diviseur",
    Icon: Minus,
    iconColor: "text-gray-500",
    iconBg: "bg-gray-100 dark:bg-gray-500/20",
    desc: "Ligne de séparation décorative",
    preview: "bg-gray-50 border-gray-200",
  },
  {
    type: "text",
    label: "Texte",
    Icon: Type,
    iconColor: "text-yellow-500",
    iconBg: "bg-yellow-100 dark:bg-yellow-500/20",
    desc: "Bloc de texte libre",
    preview: "bg-yellow-50 border-yellow-200",
  },
  {
    type: "podcast",
    label: "Podcast",
    Icon: Mic,
    iconColor: "text-pink-500",
    iconBg: "bg-pink-100 dark:bg-pink-500/20",
    desc: "Intégrer un épisode de podcast",
    preview: "bg-pink-50 border-pink-200",
  },
  {
    type: "tiktok",
    label: "TikTok",
    Icon: Video,
    iconColor: "text-gray-700 dark:text-gray-300",
    iconBg: "bg-gray-200 dark:bg-gray-500/20",
    desc: "Intégrer ta page TikTok",
    preview: "bg-gray-900/5 border-gray-300",
  },
  {
    type: "instagram",
    label: "Instagram",
    Icon: Instagram,
    iconColor: "text-fuchsia-500",
    iconBg: "bg-fuchsia-100 dark:bg-fuchsia-500/20",
    desc: "Grille de photos Instagram",
    preview: "bg-pink-50 border-pink-200",
  },
  {
    type: "youtube_sub",
    label: "YouTube abonné",
    Icon: Youtube,
    iconColor: "text-red-500",
    iconBg: "bg-red-100 dark:bg-red-500/20",
    desc: "Bouton d'abonnement YouTube",
    preview: "bg-red-50 border-red-200",
  },
  {
    type: "shop_item",
    label: "Article / Formation",
    Icon: ShoppingBag,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
    desc: "Articles, packs de formation & fichiers lourds (Plan Business)",
    preview: "bg-emerald-50 border-emerald-200",
    premium: true,
    businessOnly: true,
  },
];

const SHOP_ITEM_TYPES = [
  { id: "article", label: "Article", Icon: Tag },
  { id: "formation_pack", label: "Pack Formation", Icon: BookOpen },
  { id: "heavy_digital", label: "Fichier Lourd", Icon: FileArchive },
  { id: "service", label: "Service", Icon: Briefcase },
  { id: "appointment", label: "Rendez-vous", Icon: Calendar },
];

function BlockPreviewIcon({ type }: { type: string }) {
  const b = BLOCK_TYPES.find((bt) => bt.type === type);
  if (!b) return <span className="text-xl">📦</span>;
  const IconComp = b.Icon;
  return <IconComp className={`w-5 h-5 ${b.iconColor}`} />;
}

function BlockEditor({
  block,
  onSave,
  onClose,
}: {
  block: Partial<PageBlock>;
  onSave: (data: Partial<PageBlock>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ...block });

  const updateContent = (key: string, value: unknown) => {
    setForm((f) => ({ ...f, content: { ...(f.content || {}), [key]: value } }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4 pt-[env(safe-area-inset-top,1rem)]">
      <div
        className="bg-card rounded-2xl w-full max-w-md shadow-2xl flex flex-col my-auto"
        style={{ maxHeight: "calc(100vh - 2rem)" }}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-dm font-bold text-base">
            {BLOCK_TYPES.find((b) => b.type === block.type)?.label || "Bloc"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Titre du bloc
            </label>
            <Input
              value={form.title || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Ex: Mes réseaux sociaux"
              className="rounded-xl"
            />
          </div>

          {/* Type-specific fields */}
          {block.type === "heading" && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Texte de l'entête
              </label>
              <Input
                value={(form.content?.text as string) || ""}
                onChange={(e) => updateContent("text", e.target.value)}
                placeholder="Titre principal"
                className="rounded-xl"
              />
              <div className="mt-2">
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Sous-titre
                </label>
                <Input
                  value={(form.content?.subtitle as string) || ""}
                  onChange={(e) => updateContent("subtitle", e.target.value)}
                  placeholder="Sous-titre optionnel"
                  className="rounded-xl"
                />
              </div>
            </div>
          )}

          {block.type === "video" && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                URL de la vidéo
              </label>
              <Input
                value={(form.content?.url as string) || ""}
                onChange={(e) => updateContent("url", e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground mt-1">
                YouTube, Vimeo, TikTok, Twitch supportés
              </p>
            </div>
          )}

          {block.type === "music" && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                URL de la musique
              </label>
              <Input
                value={(form.content?.url as string) || ""}
                onChange={(e) => updateContent("url", e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Spotify, Apple Music, SoundCloud supportés
              </p>
            </div>
          )}

          {block.type === "podcast" && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                URL du podcast
              </label>
              <Input
                value={(form.content?.url as string) || ""}
                onChange={(e) => updateContent("url", e.target.value)}
                placeholder="https://open.spotify.com/episode/..."
                className="rounded-xl"
              />
            </div>
          )}

          {block.type === "tiktok" && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Nom d'utilisateur TikTok
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  @
                </span>
                <Input
                  value={(form.content?.username as string) || ""}
                  onChange={(e) => updateContent("username", e.target.value)}
                  placeholder="tonpseudo"
                  className="pl-8 rounded-xl"
                />
              </div>
            </div>
          )}

          {block.type === "youtube_sub" && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                ID de chaîne YouTube
              </label>
              <Input
                value={(form.content?.channelId as string) || ""}
                onChange={(e) => updateContent("channelId", e.target.value)}
                placeholder="UC..."
                className="rounded-xl"
              />
              <div className="mt-2">
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Nom de la chaîne
                </label>
                <Input
                  value={(form.content?.channelName as string) || ""}
                  onChange={(e) => updateContent("channelName", e.target.value)}
                  placeholder="Ma chaîne YouTube"
                  className="rounded-xl"
                />
              </div>
            </div>
          )}

          {block.type === "social_icons" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Remplis les liens de tes réseaux
              </p>
              {[
                {
                  key: "facebook",
                  label: "Facebook",
                  placeholder: "https://facebook.com/...",
                },
                {
                  key: "instagram",
                  label: "Instagram",
                  placeholder: "https://instagram.com/...",
                },
                {
                  key: "twitter",
                  label: "Twitter / X",
                  placeholder: "https://twitter.com/...",
                },
                {
                  key: "tiktok",
                  label: "TikTok",
                  placeholder: "https://tiktok.com/@...",
                },
                {
                  key: "youtube",
                  label: "YouTube",
                  placeholder: "https://youtube.com/@...",
                },
                {
                  key: "linkedin",
                  label: "LinkedIn",
                  placeholder: "https://linkedin.com/in/...",
                },
                {
                  key: "whatsapp",
                  label: "WhatsApp",
                  placeholder: "https://wa.me/...",
                },
                {
                  key: "snapchat",
                  label: "Snapchat",
                  placeholder: "https://snapchat.com/add/...",
                },
                {
                  key: "discord",
                  label: "Discord",
                  placeholder: "https://discord.gg/...",
                },
                {
                  key: "telegram",
                  label: "Telegram",
                  placeholder: "https://t.me/...",
                },
                {
                  key: "pinterest",
                  label: "Pinterest",
                  placeholder: "https://pinterest.com/...",
                },
                {
                  key: "github",
                  label: "GitHub",
                  placeholder: "https://github.com/...",
                },
              ].map((sn) => (
                <div key={sn.key} className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg"
                    style={{
                      background: `${(PLATFORM_COLORS as Record<string, string>)[sn.key] || "#999"}18`,
                    }}
                  >
                    <SocialIcon platform={sn.key} size={16} />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={
                        ((form.content as Record<string, unknown>)?.[
                          sn.key
                        ] as string) || ""
                      }
                      onChange={(e) => updateContent(sn.key, e.target.value)}
                      placeholder={sn.placeholder}
                      className="rounded-xl h-9 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {block.type === "form" && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Titre du formulaire
                </label>
                <Input
                  value={(form.content?.formTitle as string) || ""}
                  onChange={(e) => updateContent("formTitle", e.target.value)}
                  placeholder="Contactez-moi"
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Message de confirmation
                </label>
                <Input
                  value={(form.content?.successMessage as string) || ""}
                  onChange={(e) =>
                    updateContent("successMessage", e.target.value)
                  }
                  placeholder="Merci, je vous réponds bientôt !"
                  className="rounded-xl"
                />
              </div>
              <div className="flex items-center justify-between py-2 px-1">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Champ message
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Permettre aux visiteurs d'écrire un message
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateContent(
                      "includeMessage",
                      !((form.content?.includeMessage as boolean) ?? true),
                    )
                  }
                  className={`w-9 h-5 rounded-full transition-colors relative ${((form.content?.includeMessage as boolean) ?? true) ? "bg-primary" : "bg-muted"}`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${((form.content?.includeMessage as boolean) ?? true) ? "left-4" : "left-0.5"}`}
                  />
                </button>
              </div>
            </div>
          )}

          {block.type === "social_embed" && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                URL de la publication
              </label>
              <Input
                value={(form.content?.url as string) || ""}
                onChange={(e) => updateContent("url", e.target.value)}
                placeholder="https://www.instagram.com/p/... ou https://x.com/.../status/..."
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Instagram, X (Twitter), TikTok, Facebook supportés
              </p>
            </div>
          )}

          {block.type === "text" && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Contenu
              </label>
              <textarea
                value={(form.content?.text as string) || ""}
                onChange={(e) => updateContent("text", e.target.value)}
                placeholder="Votre texte ici..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          )}

          {block.type === "divider" && (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Style du diviseur
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["solid", "dashed", "dotted"].map((style) => (
                  <button
                    key={style}
                    onClick={() => updateContent("style", style)}
                    className={`py-3 px-2 rounded-xl border text-xs font-medium transition-all ${(form.content?.style as string) === style ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}
                  >
                    <div
                      className={`w-full h-0.5 bg-foreground/40 mb-1 border-t border-foreground/40 ${style === "dashed" ? "border-dashed" : style === "dotted" ? "border-dotted" : "border-solid"}`}
                    />
                    {style}
                  </button>
                ))}
              </div>
            </div>
          )}

          {block.type === "instagram" && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Nom d'utilisateur Instagram
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  @
                </span>
                <Input
                  value={(form.content?.username as string) || ""}
                  onChange={(e) => updateContent("username", e.target.value)}
                  placeholder="tonpseudo"
                  className="pl-8 rounded-xl"
                />
              </div>
            </div>
          )}

          {block.type === "group" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Description du groupe
                </label>
                <Input
                  value={(form.content?.description as string) || ""}
                  onChange={(e) => updateContent("description", e.target.value)}
                  placeholder="Mes liens principaux"
                  className="rounded-xl"
                />
              </div>
              {/* Links list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">
                    Liens du groupe
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const links =
                        (form.content?.links as Array<{
                          title: string;
                          url: string;
                        }>) || [];
                      updateContent("links", [
                        ...links,
                        { title: "", url: "" },
                      ]);
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter un lien
                  </button>
                </div>
                <div className="space-y-3">
                  {(
                    (form.content?.links as Array<{
                      title: string;
                      url: string;
                    }>) || []
                  ).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-3 bg-muted/30 rounded-xl">
                      Aucun lien ajouté. Clique sur "Ajouter un lien" pour
                      commencer.
                    </p>
                  )}
                  {(
                    (form.content?.links as Array<{
                      title: string;
                      url: string;
                    }>) || []
                  ).map((link, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-muted/30 rounded-xl space-y-2 relative"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const links = [
                            ...((form.content?.links as Array<{
                              title: string;
                              url: string;
                            }>) || []),
                          ];
                          links.splice(idx, 1);
                          updateContent("links", links);
                        }}
                        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div>
                        <label className="text-xs text-muted-foreground mb-0.5 block">
                          Titre du lien
                        </label>
                        <Input
                          value={link.title}
                          onChange={(e) => {
                            const links = [
                              ...((form.content?.links as Array<{
                                title: string;
                                url: string;
                              }>) || []),
                            ];
                            links[idx] = {
                              ...links[idx],
                              title: e.target.value,
                            };
                            updateContent("links", links);
                          }}
                          placeholder="Ex: Mon site web"
                          className="rounded-lg h-9 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-0.5 block">
                          URL
                        </label>
                        <Input
                          value={link.url}
                          onChange={(e) => {
                            const links = [
                              ...((form.content?.links as Array<{
                                title: string;
                                url: string;
                              }>) || []),
                            ];
                            links[idx] = { ...links[idx], url: e.target.value };
                            updateContent("links", links);
                          }}
                          placeholder="https://..."
                          className="rounded-lg h-9 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {block.type === "shop_item" && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Type d'élément
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SHOP_ITEM_TYPES.map((t) => {
                    const active =
                      ((form.content?.item_type as string) || "article") ===
                      t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => updateContent("item_type", t.id)}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${active ? "border-primary bg-primary/5 shadow-xs" : "border-border/40 hover:border-border"}`}
                      >
                        <t.Icon
                          className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground"}`}
                        />
                        <span className="text-[11px] font-medium text-center">
                          {t.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {((form.content?.item_type as string) === "formation_pack" ||
                (form.content?.item_type as string) === "heavy_digital") && (
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-400">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Stockage Fichiers Lourds & Formation (Plan Business)</span>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">
                      Lien de téléchargement / Accès au pack lourd
                    </label>
                    <Input
                      value={(form.content?.download_url as string) || ""}
                      onChange={(e) => updateContent("download_url", e.target.value)}
                      placeholder="https://drive.google.com/... ou https://mega.nz/..."
                      className="rounded-xl bg-background text-xs"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Lien direct ou cloud (Google Drive, Mega, Dropbox) envoyé à l'acheteur après validation du paiement.
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">
                      Taille estimée du pack ou fichier
                    </label>
                    <Input
                      value={(form.content?.file_size as string) || ""}
                      onChange={(e) => updateContent("file_size", e.target.value)}
                      placeholder="Ex: 1.2 Go ou 450 Mo"
                      className="rounded-xl bg-background text-xs"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  En-tête
                </label>
                <Input
                  value={(form.content?.header_text as string) || ""}
                  onChange={(e) => updateContent("header_text", e.target.value)}
                  placeholder="🔥 Offre limitée"
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Nom *
                </label>
                <Input
                  value={(form.content?.name as string) || ""}
                  onChange={(e) => updateContent("name", e.target.value)}
                  placeholder="Ex: Consultation Marketing"
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Description
                </label>
                <textarea
                  value={(form.content?.description as string) || ""}
                  onChange={(e) => updateContent("description", e.target.value)}
                  rows={3}
                  placeholder="Description détaillée..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Créative / Image (URL)
                </label>
                <Input
                  value={(form.content?.image_url as string) || ""}
                  onChange={(e) => updateContent("image_url", e.target.value)}
                  placeholder="https://..."
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Prix (FCFA) *
                </label>
                <Input
                  type="number"
                  value={(form.content?.price as number) || ""}
                  onChange={(e) =>
                    updateContent("price", parseInt(e.target.value) || 0)
                  }
                  placeholder="5000"
                  className="rounded-xl"
                />
                {!!form.content?.price && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Le client paiera{" "}
                    {Math.round(
                      (form.content.price as number) * 1.07,
                    ).toLocaleString("fr-FR")}{" "}
                    XAF (frais 7% inclus)
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Lien de redirection après paiement
                </label>
                <Input
                  value={(form.content?.redirect_url as string) || ""}
                  onChange={(e) =>
                    updateContent("redirect_url", e.target.value)
                  }
                  placeholder="https://mon-site.com/merci"
                  className="rounded-xl"
                />
              </div>
              <div className="rounded-xl border border-border/40 p-3 space-y-2">
                <p className="text-xs font-semibold text-foreground">
                  Coordonnées du vendeur
                </p>
                <Input
                  value={(form.content?.seller_name as string) || ""}
                  onChange={(e) => updateContent("seller_name", e.target.value)}
                  placeholder="Nom"
                  className="rounded-xl h-9 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={(form.content?.seller_phone as string) || ""}
                    onChange={(e) =>
                      updateContent("seller_phone", e.target.value)
                    }
                    placeholder="Téléphone"
                    className="rounded-xl h-9 text-sm"
                  />
                  <Input
                    value={(form.content?.seller_email as string) || ""}
                    onChange={(e) =>
                      updateContent("seller_email", e.target.value)
                    }
                    placeholder="Email"
                    className="rounded-xl h-9 text-sm"
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                💳 Les paiements seront crédités automatiquement dans ton
                portefeuille AvyLink.
              </p>
            </div>
          )}
        </div>
        <div className="p-5 border-t border-border flex gap-3">
          <Button
            onClick={() => onSave(form)}
            className="flex-1 gradient-cta text-primary-foreground rounded-xl"
          >
            <Check className="w-4 h-4 mr-2" /> Sauvegarder
          </Button>
          <Button variant="ghost" onClick={onClose} className="rounded-xl">
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
}

function BlockPreview({ block }: { block: PageBlock }) {
  const def = BLOCK_TYPES.find((b) => b.type === block.type);
  const c = block.content as Record<string, unknown>;

  if (block.type === "heading") {
    return (
      <div className="py-2">
        {c.text && (
          <p className="font-dm font-bold text-base text-foreground">
            {c.text as string}
          </p>
        )}
        {c.subtitle && (
          <p className="text-sm text-muted-foreground">
            {c.subtitle as string}
          </p>
        )}
      </div>
    );
  }
  if (block.type === "divider") {
    const style = (c.style as string) || "solid";
    return (
      <div
        className={`my-2 border-t border-border/50 ${style === "dashed" ? "border-dashed" : style === "dotted" ? "border-dotted" : ""}`}
      />
    );
  }
  if (block.type === "social_icons") {
    const networks = [
      "facebook",
      "instagram",
      "twitter",
      "tiktok",
      "youtube",
      "linkedin",
      "whatsapp",
      "snapchat",
      "discord",
      "telegram",
      "pinterest",
      "github",
    ];
    const filled = networks.filter((n) => c[n] && String(c[n]).trim() !== "");
    return (
      <div className="flex flex-wrap gap-2 py-1">
        {filled.length === 0 ? (
          <span className="text-xs text-muted-foreground">
            Aucun réseau configuré
          </span>
        ) : (
          filled.map((n) => {
            const raw = String(c[n]);
            const href = formatSocialUrl(n, raw);
            return (
              <a
                key={n}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={PLATFORM_LABELS[n] || n}
                className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer"
                style={{
                  backgroundColor: `${(PLATFORM_COLORS as Record<string, string>)[n] || "#999"}18`,
                }}
              >
                <SocialIcon platform={n} size={20} />
              </a>
            );
          })
        )}
      </div>
    );
  }
  if (block.type === "form") {
    return (
      <div className="space-y-2 py-1">
        <p className="text-xs font-semibold text-foreground">
          {(c.formTitle as string) || "Formulaire de contact"}
        </p>
        <div className="h-7 rounded-lg bg-muted/50 border border-border/50 text-xs px-3 flex items-center text-muted-foreground">
          Nom complet
        </div>
        <div className="h-7 rounded-lg bg-muted/50 border border-border/50 text-xs px-3 flex items-center text-muted-foreground">
          Email
        </div>
        <div className="h-7 rounded-lg bg-primary/10 border border-primary/20 text-xs px-3 flex items-center justify-center text-primary font-medium">
          Envoyer
        </div>
      </div>
    );
  }
  if (
    block.type === "video" ||
    block.type === "music" ||
    block.type === "podcast"
  ) {
    return (
      <div className="flex items-center gap-3 py-1">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${def?.iconBg || "bg-muted"}`}
        >
          {def && <def.Icon className={`w-6 h-6 ${def.iconColor}`} />}
        </div>
        <div>
          <p className="text-xs font-medium text-foreground">
            {block.title || def?.label}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
            {(c.url as string) || "URL non configurée"}
          </p>
        </div>
      </div>
    );
  }
  if (block.type === "shop_item") {
    const clientPrice = c.price ? Math.round((c.price as number) * 1.07) : 0;
    return (
      <div className="flex items-center gap-3 py-1">
        {c.image_url ? (
          <img
            src={c.image_url as string}
            alt=""
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground truncate">
            {(c.name as string) || "Article"}
          </p>
          <p className="text-[10px] text-primary font-bold">
            {clientPrice.toLocaleString("fr-FR")} XAF
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 py-1">
      {def && <def.Icon className={`w-4 h-4 ${def.iconColor}`} />}
      <span className="text-xs text-muted-foreground">{def?.desc}</span>
    </div>
  );
}

function LivePreviewBlock({ block }: { block: PageBlock }) {
  const def = BLOCK_TYPES.find((b) => b.type === block.type);
  const c = (block.content || {}) as Record<string, unknown>;

  if (block.type === "heading") {
    return (
      <div className="text-center py-1">
        {c.text && (
          <p className="font-dm font-bold text-xs text-foreground">
            {c.text as string}
          </p>
        )}
        {c.subtitle && (
          <p className="text-[10px] text-muted-foreground">
            {c.subtitle as string}
          </p>
        )}
      </div>
    );
  }

  if (block.type === "divider") {
    const style = (c.style as string) || "solid";
    return (
      <div
        className={`my-1 border-t border-border/40 ${style === "dashed" ? "border-dashed" : style === "dotted" ? "border-dotted" : ""}`}
      />
    );
  }

  if (block.type === "social_icons") {
    const networks = [
      "facebook",
      "instagram",
      "twitter",
      "tiktok",
      "youtube",
      "linkedin",
      "whatsapp",
      "snapchat",
      "discord",
      "telegram",
      "pinterest",
      "github",
    ];
    const filled = networks.filter((n) => c[n] && String(c[n]).trim() !== "");
    if (filled.length === 0)
      return (
        <p className="text-[10px] text-muted-foreground text-center">
          Aucun réseau configuré
        </p>
      );
    return (
      <div className="flex flex-wrap justify-center gap-1.5 py-1">
        {filled.map((n) => {
          const raw = String(c[n]);
          const href = formatSocialUrl(n, raw);
          return (
            <a
              key={n}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={PLATFORM_LABELS[n] || n}
              className="w-7 h-7 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
              style={{
                backgroundColor: `${(PLATFORM_COLORS as Record<string, string>)[n] || "#999"}18`,
              }}
            >
              <SocialIcon platform={n} size={14} />
            </a>
          );
        })}
      </div>
    );
  }

  if (block.type === "text") {
    return (
      <div className="rounded-xl border border-border/40 bg-secondary/20 p-2.5">
        {block.title && (
          <p className="font-dm font-semibold text-[10px] text-foreground mb-1">
            {block.title}
          </p>
        )}
        <p className="text-[10px] text-foreground/70 leading-snug line-clamp-3">
          {(c.text as string) || "..."}
        </p>
      </div>
    );
  }

  if (block.type === "form") {
    return (
      <div className="rounded-xl border border-border/40 bg-secondary/20 p-2.5 space-y-1.5">
        <p className="text-[10px] font-semibold text-foreground">
          {(c.formTitle as string) || "Formulaire"}
        </p>
        <div className="h-5 rounded-md bg-muted/50 border border-border/30 text-[8px] px-2 flex items-center text-muted-foreground">
          Nom
        </div>
        <div className="h-5 rounded-md bg-muted/50 border border-border/30 text-[8px] px-2 flex items-center text-muted-foreground">
          Email
        </div>
        <div className="h-5 rounded-md bg-primary/10 border border-primary/20 text-[8px] px-2 flex items-center justify-center text-primary font-medium">
          Envoyer
        </div>
      </div>
    );
  }

  if (
    block.type === "video" ||
    block.type === "music" ||
    block.type === "podcast"
  ) {
    const url = c.url as string;
    // YouTube thumbnail preview
    if (block.type === "video" && url) {
      const ytMatch = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
      );
      if (ytMatch) {
        return (
          <div className="rounded-xl overflow-hidden border border-border/40">
            <div className="relative aspect-video">
              <img
                src={`https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-t-transparent border-b-transparent border-l-white ml-0.5" />
                </div>
              </div>
            </div>
            <div className="p-2">
              <p className="text-[10px] font-medium text-foreground truncate">
                {block.title || "Vidéo"}
              </p>
            </div>
          </div>
        );
      }
    }
    // Spotify embed preview
    if ((block.type === "music" || block.type === "podcast") && url) {
      const spMatch = url.match(
        /spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/,
      );
      if (spMatch) {
        return (
          <div className="rounded-xl overflow-hidden border border-border/40">
            <iframe
              src={`https://open.spotify.com/embed/${spMatch[1]}/${spMatch[2]}?utm_source=generator&theme=0`}
              width="100%"
              height="80"
              allow="encrypted-media"
              loading="lazy"
              className="block"
              style={{ border: 0 }}
            />
          </div>
        );
      }
    }
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-xl border border-border/40 bg-secondary/20">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${def?.iconBg || "bg-muted"}`}
        >
          {def && <def.Icon className={`w-4 h-4 ${def.iconColor}`} />}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-foreground truncate">
            {block.title || def?.label}
          </p>
          <p className="text-[9px] text-muted-foreground truncate">
            {(url as string) || "Non configuré"}
          </p>
        </div>
      </div>
    );
  }

  if (block.type === "youtube_sub") {
    return (
      <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-border/40 bg-red-50 dark:bg-red-500/10">
        <Youtube className="w-4 h-4 text-red-500" />
        <span className="text-[10px] font-semibold text-red-600 dark:text-red-400">
          S'abonner — {(c.channelName as string) || "YouTube"}
        </span>
      </div>
    );
  }

  if (block.type === "tiktok" || block.type === "instagram") {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-xl border border-border/40 bg-secondary/20">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${def?.iconBg || "bg-muted"}`}
        >
          {def && <def.Icon className={`w-4 h-4 ${def.iconColor}`} />}
        </div>
        <div>
          <p className="text-[10px] font-medium text-foreground">
            {def?.label}
          </p>
          <p className="text-[9px] text-muted-foreground">
            @{(c.username as string) || "..."}
          </p>
        </div>
      </div>
    );
  }

  if (block.type === "shop_item") {
    const clientPrice = c.price ? Math.round((c.price as number) * 1.07) : 0;
    const TypeIcon =
      c.item_type === "service"
        ? Briefcase
        : c.item_type === "appointment"
          ? Calendar
          : Tag;
    return (
      <div className="rounded-xl overflow-hidden border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20">
        {c.image_url ? (
          <img
            src={c.image_url as string}
            alt=""
            className="w-full h-16 object-cover"
          />
        ) : null}
        <div className="p-2 space-y-1">
          <div className="flex items-center gap-1">
            <TypeIcon className="w-2.5 h-2.5 text-emerald-600" />
            <span className="text-[8px] font-semibold text-emerald-700 uppercase">
              {(c.item_type as string) || "article"}
            </span>
          </div>
          {c.header_text && (
            <p className="text-[8px] text-muted-foreground truncate">
              {c.header_text as string}
            </p>
          )}
          <p className="text-[10px] font-bold text-foreground truncate">
            {(c.name as string) || "Article"}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-primary">
              {clientPrice.toLocaleString("fr-FR")} XAF
            </span>
            <span className="px-2 py-0.5 rounded-md gradient-cta text-primary-foreground text-[8px] font-bold">
              {c.item_type === "appointment" ? "Réserver" : "Acheter"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex items-center gap-2 p-2 rounded-xl border border-border/40 bg-secondary/20">
      {def && <def.Icon className={`w-3.5 h-3.5 ${def.iconColor}`} />}
      <span className="text-[10px] text-muted-foreground">
        {block.title || def?.label || "Bloc"}
      </span>
    </div>
  );
}

export default function DashboardPage({ profile, onUpdate }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    display_name: profile?.display_name || "",
    username: profile?.username || "",
    bio: profile?.bio || "",
    website: profile?.website || "",
    avatar_url: profile?.avatar_url || "",
    cover_url:
      ((profile as Record<string, unknown>)?.cover_url as string) || "",
  });

  // Keep form in sync when profile changes
  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        website: profile.website || "",
        avatar_url: profile.avatar_url || "",
        cover_url: ((profile as any)?.cover_url as string) || "",
      });
    }
  }, [
    profile?.id,
    profile?.display_name,
    profile?.username,
    profile?.bio,
    profile?.website,
    profile?.avatar_url,
    (profile as any)?.cover_url,
  ]);

  // Blocks state
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [blocksLoading, setBlocksLoading] = useState(true);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Partial<PageBlock> | null>(
    null,
  );
  const [deletingBlockId, setDeletingBlockId] = useState<string | null>(null);

  // Links state for live phone preview
  const [links, setLinks] = useState<any[]>([]);
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

  const profileUrl = profile?.username
    ? `${window.location.origin}/u/${profile.username}`
    : null;

  useEffect(() => {
    if (!profile) return;
    const loadBlocks = () => {
      supabase
        .from("page_blocks")
        .select("*")
        .eq("profile_id", profile.id)
        .order("position", { ascending: true })
        .then(({ data }) => {
          if (data && Array.isArray(data)) {
            setBlocks(data as PageBlock[]);
          }
          setBlocksLoading(false);
        });
    };
    loadBlocks();

    const loadLinks = () => {
      supabase
        .from("profile_links")
        .select("*")
        .eq("profile_id", profile.id)
        .eq("is_active", true)
        .order("position", { ascending: true })
        .then(({ data }) => {
          if (data && Array.isArray(data)) {
            setLinks(data);
          }
        });
    };
    loadLinks();

    // Realtime subscription for instant updates
    const channel = supabase
      .channel(`page_blocks_${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "page_blocks",
          filter: `profile_id=eq.${profile.id}`,
        },
        () => {
          loadBlocks();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profile_links",
          filter: `profile_id=eq.${profile.id}`,
        },
        () => {
          loadLinks();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const updates = {
        display_name: form.display_name,
        username: form.username,
        bio: form.bio,
        website: form.website,
        avatar_url: form.avatar_url,
        cover_url: form.cover_url,
      };
      await onUpdate(updates as Partial<Profile>);
      await supabase.from("profiles").update(updates).eq("id", profile.id);
      toast({ title: "✅ Profil mis à jour et enregistré !" });
    } catch (err: any) {
      toast({
        title: "Erreur sauvegarde",
        description: err?.message || "Impossible d'enregistrer",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const copyUrl = () => {
    if (!profileUrl) return;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${profile.user_id}/avatar.${ext}`;
    const { data: uploadRes, error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (error) {
      toast({
        title: "Erreur upload",
        description: error.message,
        variant: "destructive",
      });
      setUploading(false);
      return;
    }
    const publicUrl = (uploadRes as any)?.publicUrl || supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    const avatarUrl = publicUrl + (publicUrl.includes("?") ? "" : `?t=${Date.now()}`);
    setForm((f) => ({ ...f, avatar_url: avatarUrl }));
    await onUpdate({ avatar_url: avatarUrl });
    await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", profile.id);
    toast({ title: "✅ Photo de profil mise à jour !" });
    setUploading(false);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploadingCover(true);
    const ext = file.name.split(".").pop();
    const path = `${profile.user_id}/cover.${ext}`;
    const { data: uploadRes, error } = await supabase.storage
      .from("covers")
      .upload(path, file, { upsert: true });
    if (error) {
      toast({
        title: "Erreur upload",
        description: error.message,
        variant: "destructive",
      });
      setUploadingCover(false);
      return;
    }
    const publicUrl = (uploadRes as any)?.publicUrl || supabase.storage.from("covers").getPublicUrl(path).data.publicUrl;
    const coverUrl = publicUrl + (publicUrl.includes("?") ? "" : `?t=${Date.now()}`);
    setForm((f) => ({ ...f, cover_url: coverUrl }));
    await onUpdate({ cover_url: coverUrl } as Partial<Profile>);
    await supabase.from("profiles").update({ cover_url: coverUrl }).eq("id", profile.id);
    toast({ title: "✅ Photo de couverture mise à jour !" });
    setUploadingCover(false);
  };

  const addBlock = (type: string) => {
    const blockDef = BLOCK_TYPES.find((b) => b.type === type);
    if ((blockDef as any)?.businessOnly && profile?.plan !== "business") {
      toast({
        title: "Plan Business Requis (5 850 FCFA) 💼",
        description: "L'e-commerce, les packs de formation et les fichiers lourds sont réservés au Plan Business.",
        variant: "destructive",
      });
      navigate("/dashboard/abonnement");
      return;
    }
    if (blockDef?.premium && profile?.plan === "free") {
      toast({
        title: "Fonctionnalité Premium 👑",
        description: "Passe au plan Premium pour utiliser ce bloc.",
        variant: "destructive",
      });
      return;
    }
    setEditingBlock({
      type,
      title: "",
      content: {},
      position: blocks.length,
      is_active: true,
    });
    setShowBlockModal(false);
  };

  const syncShopItem = async (
    content: Record<string, unknown>,
    existingId?: string | null,
  ) => {
    if (!profile) return content;
    const payload: any = {
      profile_id: profile.id,
      name: (content.name as string) || "Article",
      description: (content.description as string) || null,
      price: (content.price as number) || 0,
      currency: "XAF",
      image_url: (content.image_url as string) || null,
      item_type: (content.item_type as string) || "article",
      redirect_url: (content.redirect_url as string) || null,
      seller_name:
        (content.seller_name as string) || profile.display_name || null,
      seller_phone: (content.seller_phone as string) || null,
      seller_email: (content.seller_email as string) || null,
      header_text: (content.header_text as string) || null,
      download_url: (content.download_url as string) || null,
      file_size: (content.file_size as string) || null,
      is_active: true,
    };
    if (existingId) {
      const { data } = await supabase
        .from("store_items")
        .update(payload)
        .eq("id", existingId)
        .select()
        .single();
      return { ...content, store_item_id: data?.id || existingId };
    }
    const { data } = await supabase
      .from("store_items")
      .insert(payload)
      .select()
      .single();
    return { ...content, store_item_id: data?.id };
  };

  const saveBlock = async (data: Partial<PageBlock>) => {
    if (!profile) return;
    let content = (data.content || {}) as Record<string, unknown>;
    if (data.type === "shop_item") {
      content = await syncShopItem(
        content,
        content.store_item_id as string | undefined,
      );
    }

    if (data.type === "social_icons") {
      const normalized: Record<string, unknown> = { ...content };
      for (const [key, val] of Object.entries(content)) {
        if (typeof val === "string" && val.trim()) {
          normalized[key] = formatSocialUrl(key, val.trim());
        }
      }
      content = normalized;
    }

    if (data.id) {
      // Optimistic update so it immediately reflects in the mockup and blocks list
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === data.id
            ? ({
                ...b,
                title: data.title !== undefined ? data.title : b.title,
                content: content as Record<string, string | number | boolean | null>,
                is_active: data.is_active !== undefined ? data.is_active : b.is_active,
              } as PageBlock)
            : b,
        ),
      );
      setEditingBlock(null);
      toast({ title: "✅ Bloc mis à jour !" });

      try {
        const { data: updated } = await supabase
          .from("page_blocks")
          .update({
            title: data.title,
            content: content as Record<string, string | number | boolean | null>,
            is_active: data.is_active,
          })
          .eq("id", data.id)
          .select()
          .single();
        if (updated) {
          setBlocks((prev) =>
            prev.map((b) => (b.id === data.id ? (updated as PageBlock) : b)),
          );
        }
      } catch (err) {
        console.error("Error saving block update:", err);
      }
    } else {
      // Optimistic insert so the block is immediately visible in the live preview
      const tempId =
        "block_" +
        Date.now() +
        "_" +
        Math.random().toString(36).substring(2, 7);
      const newBlock: PageBlock = {
        id: tempId,
        profile_id: profile.id,
        type: data.type!,
        title: data.title || null,
        content: content as Record<string, string | number | boolean | null>,
        position: blocks.length,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      setBlocks((prev) => [...prev, newBlock]);
      setEditingBlock(null);
      toast({ title: "✅ Bloc ajouté avec succès !" });

      try {
        const { data: created } = await supabase
          .from("page_blocks")
          .insert([
            {
              profile_id: profile.id,
              type: data.type!,
              title: data.title || null,
              content: content as Record<
                string,
                string | number | boolean | null
              >,
              position: blocks.length,
              is_active: true,
            },
          ])
          .select()
          .single();

        if (created) {
          const item = Array.isArray(created) ? created[0] : created;
          if (item && item.id) {
            setBlocks((prev) =>
              prev.map((b) => (b.id === tempId ? (item as PageBlock) : b)),
            );
          }
        }
      } catch (err) {
        console.error("Error inserting block into DB:", err);
      }
    }
  };

  const deleteBlock = async (id: string) => {
    setDeletingBlockId(id);
    const blk = blocks.find((b) => b.id === id);
    const storeItemId = (blk?.content as Record<string, unknown> | undefined)
      ?.store_item_id as string | undefined;

    // Optimistically remove from state immediately
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    toast({ title: "🗑️ Bloc supprimé" });

    try {
      await supabase.from("page_blocks").delete().eq("id", id);
      if (storeItemId) {
        await supabase.from("store_items").delete().eq("id", storeItemId);
      }
    } catch (err) {
      console.error("Error deleting block:", err);
    } finally {
      setDeletingBlockId(null);
    }
  };

  const toggleBlock = async (block: PageBlock) => {
    const newVal = !block.is_active;
    // Optimistic toggle
    setBlocks((prev) =>
      prev.map((b) => (b.id === block.id ? { ...b, is_active: newVal } : b)),
    );
    try {
      await supabase
        .from("page_blocks")
        .update({ is_active: newVal })
        .eq("id", block.id);
    } catch (err) {
      console.error("Error toggling block:", err);
    }
  };

  const moveBlock = async (id: string, dir: "up" | "down") => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (dir === "up" && idx === 0) return;
    if (dir === "down" && idx === blocks.length - 1) return;
    const newBlocks = [...blocks];
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    [newBlocks[idx], newBlocks[swapIdx]] = [newBlocks[swapIdx], newBlocks[idx]];
    const updated = newBlocks.map((b, i) => ({ ...b, position: i }));
    setBlocks(updated);
    await Promise.all(
      updated.map((b) =>
        supabase
          .from("page_blocks")
          .update({ position: b.position })
          .eq("id", b.id),
      ),
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      {/* PWA in-app installation banner */}
      <PWAInstallButton variant="banner" />

      {/* Mobile view toggle (Édition vs Aperçu en direct) */}
      <div className="flex md:hidden items-center p-1 bg-secondary/70 rounded-2xl border border-border/60 shadow-xs">
        <button
          onClick={() => setMobileTab("editor")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === "editor"
              ? "bg-card text-foreground shadow-xs border border-border/40"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="w-4 h-4 text-primary" />
          <span>Édition ({blocks.length} blocs)</span>
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === "preview"
              ? "gradient-cta text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Aperçu live</span>
        </button>
      </div>

      <div className={mobileTab === "preview" ? "hidden md:block space-y-6" : "space-y-6"}>
        {/* Quick actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate("/dashboard/liens")}
          className="flex-1 flex items-center gap-3 p-3.5 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Link2 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">
              Ajouter un lien
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
        <button
          onClick={() => navigate("/dashboard/apparence")}
          className="flex-1 flex items-center gap-3 p-3.5 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Palette className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">Apparence</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      </div>
      {/* Block type modal */}
      {showBlockModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4 animate-fade-in"
          onClick={() => setShowBlockModal(false)}
        >
          <div
            className="bg-card rounded-2xl w-full max-w-md shadow-2xl flex flex-col my-auto animate-scale-in"
            style={{ maxHeight: "calc(100vh - 2rem)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
              <h3 className="font-dm font-bold text-lg">Ajouter un bloc</h3>
              <button
                onClick={() => setShowBlockModal(false)}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto flex-1">
              {BLOCK_TYPES.map((bt, i) => (
                <button
                  key={bt.type}
                  onClick={() => addBlock(bt.type)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border/60 bg-background hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 text-center group opacity-0 animate-fade-in relative"
                  style={{
                    animationDelay: `${i * 40}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  {(bt as any).businessOnly ? (
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-xs">
                      💼 Business
                    </span>
                  ) : bt.premium ? (
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950">
                      👑
                    </span>
                  ) : null}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center ${bt.iconBg} group-hover:shadow-md group-hover:scale-110 transition-all duration-200`}
                  >
                    <bt.Icon
                      className={`w-5 h-5 ${bt.iconColor}`}
                      strokeWidth={1.8}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-foreground leading-tight">
                    {bt.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                    {bt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Block editor */}
      {editingBlock && (
        <BlockEditor
          block={editingBlock}
          onSave={saveBlock}
          onClose={() => setEditingBlock(null)}
        />
      )}

      {/* Profile URL */}
      {profileUrl && (
        <div className="glass-blue rounded-2xl p-4 flex items-center gap-3">
          <Globe className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-sm font-medium text-foreground flex-1 truncate">
            {profileUrl}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="text-primary gap-1 flex-shrink-0"
            onClick={copyUrl}
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copié !" : "Copier"}
          </Button>
        </div>
      )}

      {/* Cover photo + Avatar section */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden">
        {/* Cover photo */}
        <div className="relative h-36 bg-gradient-to-br from-primary/20 to-primary/5 group">
          {form.cover_url ? (
            <img
              src={form.cover_url}
              alt="Couverture"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-xs text-muted-foreground">
                Aucune photo de couverture
              </p>
            </div>
          )}
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all opacity-0 group-hover:opacity-100"
          >
            <div className="flex items-center gap-2 bg-white/90 text-foreground px-4 py-2 rounded-xl text-sm font-semibold shadow">
              {uploadingCover ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              {uploadingCover ? "Upload..." : "Modifier la couverture"}
            </div>
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverUpload}
          />
        </div>

        {/* Avatar */}
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className="relative flex-shrink-0">
              {form.avatar_url ? (
                <img
                  src={form.avatar_url}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover shadow-blue border-4 border-card"
                />
              ) : (
                <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-blue border-4 border-card">
                  {(form.display_name || form.username || "U")[0].toUpperCase()}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm hover:bg-primary/90 transition-colors"
              >
                {uploading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div className="pb-1">
              <p className="font-dm font-bold text-base text-foreground">
                {form.display_name || "Ton nom"}
              </p>
              {form.username && (
                <p className="text-xs text-muted-foreground">
                  @{form.username}
                </p>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Photo de profil : JPG, PNG. Max 5MB. &nbsp;|&nbsp; Couverture :
            recommandé 1200×400px.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-card p-6 space-y-4">
        <h3 className="font-dm font-bold text-base text-foreground">
          Informations du profil
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Nom affiché
            </label>
            <Input
              value={form.display_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, display_name: e.target.value }))
              }
              placeholder="Kofi Asante"
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Nom d'utilisateur{" "}
              <span className="text-muted-foreground">(URL)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                @
              </span>
              <Input
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    username: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9_]/g, ""),
                  }))
                }
                placeholder="kofi"
                className="pl-8 rounded-xl"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              avylink.app/u/{form.username || "..."}
            </p>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Bio
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="Parle de toi en quelques mots..."
            rows={3}
            maxLength={160}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <p className="text-xs text-muted-foreground text-right">
            {form.bio.length}/160
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Site web
          </label>
          <Input
            value={form.website}
            onChange={(e) =>
              setForm((f) => ({ ...f, website: e.target.value }))
            }
            placeholder="https://tonsite.com"
            type="url"
            className="rounded-xl"
          />
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full gradient-cta text-primary-foreground rounded-xl font-semibold shadow-blue"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
        </Button>
      </div>

      {/* Content Blocks */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-dm font-bold text-base text-foreground">
            🧩 Blocs de contenu
          </h3>
          <Button
            size="sm"
            onClick={() => setShowBlockModal(true)}
            className="gradient-cta text-primary-foreground rounded-xl gap-1"
          >
            <Plus className="w-4 h-4" /> Ajouter
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Enrichis ta page avec des blocs multimédia : vidéos, musique,
          formulaires, réseaux sociaux...
        </p>

        {blocksLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : blocks.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl">
            <div className="text-3xl mb-2">🧩</div>
            <p className="font-medium text-foreground text-sm">
              Aucun bloc pour l'instant
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Clique sur "Ajouter" pour enrichir ta page
            </p>
            <Button
              size="sm"
              onClick={() => setShowBlockModal(true)}
              className="mt-3 gradient-cta text-primary-foreground rounded-xl gap-1"
            >
              <Plus className="w-4 h-4" /> Ajouter un bloc
            </Button>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1 rounded-xl">
            {blocks.map((block, idx) => {
              const def = BLOCK_TYPES.find((b) => b.type === block.type);
              return (
                <div
                  key={block.id}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-xl border transition-all ${block.is_active ? "bg-secondary/30 border-border/50" : "bg-muted/20 border-border/30 opacity-60"}`}
                >
                  <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
                  <div className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center flex-shrink-0">
                    <BlockPreviewIcon type={block.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {block.title || def?.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => moveBlock(block.id, "up")}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-secondary text-muted-foreground disabled:opacity-30"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveBlock(block.id, "down")}
                      disabled={idx === blocks.length - 1}
                      className="p-1 rounded hover:bg-secondary text-muted-foreground disabled:opacity-30"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => toggleBlock(block)}
                      className={`relative rounded-full transition-colors ${block.is_active ? "bg-primary" : "bg-muted"}`}
                      style={{ width: 26, height: 14 }}
                    >
                      <span
                        className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all"
                        style={{ left: block.is_active ? 11 : 2 }}
                      />
                    </button>
                    <button
                      onClick={() => setEditingBlock(block)}
                      className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteBlock(block.id)}
                      disabled={deletingBlockId === block.id}
                      className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      {deletingBlockId === block.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Badge Vérifié */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <BadgeCheck className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-dm font-bold text-base text-foreground">
            Badge Vérifié
          </h3>
          {profile?.plan === "free" && (
            <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Premium
            </span>
          )}
        </div>
        {profile?.plan !== "free" ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Affiche un badge certifié à côté de ton nom sur ta page publique.
            </p>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <VerifiedBadge
                  style={(profile as any)?.verified_badge_style}
                  size="lg"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Activer le badge vérifié
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {profile?.is_verified
                      ? "Visible sur votre profil"
                      : "Masqué"}
                  </p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={async () => {
                  const newVal = !profile?.is_verified;
                  await onUpdate({ is_verified: newVal } as any);
                  if (profile) {
                    await supabase
                      .from("profiles")
                      .update({ is_verified: newVal } as never)
                      .eq("id", profile.id);
                  }
                  toast({ title: newVal ? "✅ Badge vérifié activé !" : "Badge vérifié masqué" });
                }}
                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${profile?.is_verified ? "bg-primary" : "bg-muted"}`}
              >
                <motion.span
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md ${profile?.is_verified ? "left-6" : "left-1"}`}
                />
              </motion.button>
            </div>
            {profile?.is_verified && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Choisis ton style de badge
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {BADGE_STYLES.map((badge) => (
                    <motion.button
                      key={badge.id}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        await onUpdate({ verified_badge_style: badge.id } as any);
                        if (profile) {
                          await supabase
                            .from("profiles")
                            .update({ verified_badge_style: badge.id } as never)
                            .eq("id", profile.id);
                        }
                        toast({ title: `Style de badge "${badge.label}" activé !` });
                      }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                        (profile as any)?.verified_badge_style === badge.id ||
                        (!(profile as any)?.verified_badge_style &&
                          badge.id === "star")
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border/50 hover:border-primary/30 bg-card/50"
                      }`}
                    >
                      <img
                        src={badge.src}
                        alt={badge.label}
                        className="w-8 h-8 object-contain"
                      />
                      <span className="text-[10px] font-medium text-foreground">
                        {badge.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Le badge vérifié est réservé aux utilisateurs Premium.
            </p>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/20 opacity-60">
              <BadgeCheck
                className="w-6 h-6 text-muted-foreground"
                strokeWidth={2.5}
              />
              <p className="text-sm text-muted-foreground">
                Badge vérifié — disponible avec le Plan Premium
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Masquer le pied de page AvyLink */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <EyeOff className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-dm font-bold text-base text-foreground">
            Pied de page AvyLink
          </h3>
          {profile?.plan === "free" && (
            <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Payant
            </span>
          )}
        </div>
        {profile?.plan !== "free" ? (
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">
                Masquer "Créé avec AvyLink"
              </p>
              <p className="text-xs text-muted-foreground">
                Supprime le branding AvyLink en bas de ta page publique
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={async () => {
                const newVal = !(profile as any)?.hide_branding;
                await onUpdate({ hide_branding: newVal } as any);
                if (profile) {
                  await supabase
                    .from("profiles")
                    .update({ hide_branding: newVal } as never)
                    .eq("id", profile.id);
                }
              }}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${(profile as any)?.hide_branding ? "bg-primary" : "bg-muted"}`}
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md ${(profile as any)?.hide_branding ? "left-6" : "left-1"}`}
              />
            </motion.button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Passe à un plan payant pour masquer le branding AvyLink sur ta page
            publique.
          </p>
        )}
      </div>
      </div>

      {/* 📱 Live Preview (Aperçu en direct haute fidélité) */}
      <div className={`bg-card rounded-2xl border border-border/50 shadow-card p-5 space-y-4 ${mobileTab === "editor" ? "hidden md:block" : "block"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-dm font-bold text-base text-foreground flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary" /> Aperçu en direct
            </h3>
            <p className="text-xs text-muted-foreground">
              Visualisation en temps réel de ton portfolio tel qu'il apparaît aux visiteurs.
            </p>
          </div>
          {profileUrl && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={copyUrl}
                className="text-xs font-semibold rounded-xl gap-1.5 h-8"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copié !" : "Partager"}
              </Button>
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl gradient-cta text-primary-foreground text-xs font-semibold shadow-sm hover:opacity-95 transition-opacity h-8"
              >
                Ouvrir ma page <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Phone mockup */}
        <div className="mx-auto w-full max-w-[340px] pt-2">
          <div className="rounded-[2.5rem] border-[8px] border-foreground/15 dark:border-foreground/25 bg-background shadow-2xl overflow-hidden ring-1 ring-border">
            {/* Phone notch / status bar */}
            <div className="h-7 bg-foreground/5 flex items-center justify-center relative">
              <div className="w-20 h-3 rounded-full bg-foreground/15" />
            </div>

            {/* Scrollable live screen */}
            {(() => {
              const currentTheme = PAGE_THEMES.find((t) => t.id === profile?.theme) || PAGE_THEMES[0];
              const phoneBg = profile?.background_color || currentTheme.preview;
              const isAvatarLeft = (profile as any)?.avatar_position === "left";
              const btnRadius = profile?.button_style === "pill"
                ? "rounded-full"
                : profile?.button_style === "square"
                ? "rounded-none"
                : profile?.button_style === "soft"
                ? "rounded-2xl"
                : "rounded-xl";

              return (
                <div
                  className="h-[520px] overflow-y-auto overflow-x-hidden flex flex-col justify-between"
                  style={{
                    background: phoneBg,
                    scrollbarWidth: "none",
                  }}
                >
                  <div>
                    {/* Cover photo */}
                    <div className="relative">
                      <div className="h-28 w-full bg-gradient-to-br from-primary/30 to-primary/10 overflow-hidden">
                        {form.cover_url ? (
                          <img
                            src={form.cover_url}
                            alt="Cover"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/30" />
                        )}
                      </div>

                      {/* Avatar */}
                      <div className={`flex ${isAvatarLeft ? "justify-start pl-4" : "justify-center"} -mt-9 relative z-10`}>
                        <div className="relative">
                          {form.avatar_url ? (
                            <img
                              src={form.avatar_url}
                              alt="Avatar"
                              className="w-18 h-18 rounded-full object-cover border-[3px] border-background shadow-md"
                              style={{ width: 72, height: 72 }}
                            />
                          ) : (
                            <div
                              className="rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold border-[3px] border-background shadow-md"
                              style={{ width: 72, height: 72 }}
                            >
                              {(form.display_name || form.username || "?")[0].toUpperCase()}
                            </div>
                          )}
                          {profile?.is_verified && (
                            <span className="absolute -bottom-0.5 -right-0.5">
                              <VerifiedBadge
                                style={(profile as any)?.verified_badge_style}
                                size="sm"
                              />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Profile info */}
                    <div className={`px-4 mt-2 mb-3 ${isAvatarLeft ? "text-left" : "text-center"}`}>
                      <div className={`flex items-center gap-1.5 ${isAvatarLeft ? "justify-start" : "justify-center"}`}>
                        <p className="font-dm font-bold text-sm text-foreground">
                          {form.display_name || "Ton nom"}
                        </p>
                      </div>
                      {form.username && (
                        <p className="text-[11px] text-muted-foreground font-medium">
                          @{form.username}
                        </p>
                      )}
                      {form.bio && (
                        <p className="text-[11px] text-foreground/80 mt-1 leading-snug">
                          {form.bio}
                        </p>
                      )}
                      {form.website && (
                        <div className={`flex ${isAvatarLeft ? "justify-start" : "justify-center"} mt-1.5`}>
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-border/50 bg-secondary/40 text-[10px] text-muted-foreground">
                            <Globe className="w-2.5 h-2.5" />
                            {form.website.replace(/^https?:\/\//, "").slice(0, 25)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Active Links */}
                    {links.length > 0 && (
                      <div className="px-3 space-y-2 mb-3">
                        {links.map((link) => (
                          <div
                            key={link.id}
                            className={`p-3 text-center text-xs font-semibold shadow-xs border border-border/50 bg-card/90 backdrop-blur-xs flex items-center justify-center gap-2 transition-all ${btnRadius}`}
                          >
                            <Link2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span className="truncate">{link.title}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Live blocks */}
                    <div className="px-3 pb-4 space-y-2">
                      {blocks
                        .filter((b) => b.is_active)
                        .map((block) => (
                          <LivePreviewBlock key={block.id} block={block} />
                        ))}

                      {blocks.filter((b) => b.is_active).length === 0 && links.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground px-4">
                          <p className="text-xs font-medium">
                            Ton portfolio est prêt !
                          </p>
                          <p className="text-[10px] mt-1">
                            Ajoute des blocs multimédias et tes liens pour enrichir ta page.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Public branding preview */}
                  {!(profile as any)?.hide_branding && (
                    <div className="py-3 text-center">
                      <p className="text-[9px] text-muted-foreground font-semibold flex items-center justify-center gap-1">
                        ⚡ Créé avec <span className="text-primary font-bold">AvyLink</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Phone bottom bar */}
            <div className="h-6 bg-foreground/5 flex items-center justify-center">
              <div className="w-28 h-1 rounded-full bg-foreground/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile quick toggle pill */}
      {mobileTab === "editor" ? (
        <div className="md:hidden fixed bottom-20 right-4 z-40">
          <Button
            size="sm"
            onClick={() => setMobileTab("preview")}
            className="rounded-full shadow-xl gradient-cta text-primary-foreground font-bold text-xs gap-1.5 px-4 h-10 border border-white/20"
          >
            <Smartphone className="w-4 h-4" />
            <span>Aperçu live</span>
          </Button>
        </div>
      ) : (
        <div className="md:hidden fixed bottom-20 right-4 z-40">
          <Button
            size="sm"
            onClick={() => setMobileTab("editor")}
            className="rounded-full shadow-xl bg-card border border-border text-foreground font-bold text-xs gap-1.5 px-4 h-10"
          >
            <Layers className="w-4 h-4 text-primary" />
            <span>Éditer ma page</span>
          </Button>
        </div>
      )}
    </div>
  );
}
