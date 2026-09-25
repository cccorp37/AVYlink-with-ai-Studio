import { useState, useEffect, useRef } from "react";
import {
  Check,
  Loader2,
  Save,
  Palette,
  Type,
  MousePointer2,
  Eye,
  Sparkles,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Plus,
  Trash2,
  BookmarkPlus,
  ImageIcon,
  Lock,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TEMPLATES } from "./DashboardTemplates";
import { firestoreDB as supabase } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/lib/types";

type Profile = Tables<"profiles">;

interface Props {
  profile: Profile | null;
  onUpdate: (updates: Partial<Profile>) => Promise<void>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
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

const THEMES = [
  {
    id: "default",
    name: "Classique",
    preview: "linear-gradient(135deg,#fff 60%,#e6f4fd)",
    emoji: "☀️",
  },
  {
    id: "dark",
    name: "Sombre",
    preview: "linear-gradient(135deg,#1a1a1a,#2d2d2d)",
    emoji: "🌙",
  },
  {
    id: "rose",
    name: "Rose",
    preview: "linear-gradient(135deg,#fff0f6,#ffccdd)",
    emoji: "🌸",
  },
  {
    id: "ocean",
    name: "Océan",
    preview: "linear-gradient(135deg,#f0f8ff,#cce5ff)",
    emoji: "🌊",
  },
  {
    id: "forest",
    name: "Forêt",
    preview: "linear-gradient(135deg,#f0fff4,#ccf0d4)",
    emoji: "🌲",
  },
  {
    id: "sunset",
    name: "Coucher",
    preview: "linear-gradient(135deg,#fff8f0,#ffddbb)",
    emoji: "🌅",
  },
  {
    id: "grape",
    name: "Raisin",
    preview: "linear-gradient(135deg,#f3e8ff,#ddd6fe)",
    emoji: "🍇",
  },
  {
    id: "cherry",
    name: "Cerise",
    preview: "linear-gradient(135deg,#fef2f2,#fecaca)",
    emoji: "🍒",
  },
];

const BUTTON_STYLES = [
  { id: "rounded", label: "Arrondi", cls: "rounded-xl" },
  { id: "pill", label: "Pilule", cls: "rounded-full" },
  { id: "square", label: "Carré", cls: "rounded-md" },
  { id: "sharp", label: "Sharp", cls: "rounded-none" },
  { id: "outline", label: "Contour", cls: "rounded-xl border-2" },
];

const FONT_STYLES = [
  {
    id: "inter",
    label: "Inter",
    style: { fontFamily: "Inter, sans-serif" },
    desc: "Moderne",
  },
  {
    id: "dm",
    label: "DM Sans",
    style: { fontFamily: "DM Sans, sans-serif" },
    desc: "Élégant",
  },
  {
    id: "mono",
    label: "Mono",
    style: { fontFamily: "JetBrains Mono, monospace" },
    desc: "Technique",
  },
  {
    id: "serif",
    label: "Serif",
    style: { fontFamily: "Georgia, serif" },
    desc: "Classique",
  },
  {
    id: "playfair",
    label: "Playfair",
    style: { fontFamily: "Playfair Display, serif" },
    desc: "Éditorial",
  },
  {
    id: "poppins",
    label: "Poppins",
    style: { fontFamily: "Poppins, sans-serif" },
    desc: "Arrondi",
  },
  {
    id: "space",
    label: "Space",
    style: { fontFamily: "Space Grotesk, sans-serif" },
    desc: "Futuriste",
  },
  {
    id: "cabinet",
    label: "Cabinet",
    style: { fontFamily: "Cabinet Grotesk, sans-serif" },
    desc: "Bold",
  },
  {
    id: "lora",
    label: "Lora",
    style: { fontFamily: "Lora, serif" },
    desc: "Littéraire",
  },
];

const AVATAR_POSITIONS = [
  { id: "left", label: "Gauche", icon: AlignLeft },
  { id: "center", label: "Centre", icon: AlignCenter },
  { id: "right", label: "Droite", icon: AlignRight },
];

const BG_COLORS = [
  "#ffffff",
  "#f8fafc",
  "#f1f5f9",
  "#0f172a",
  "#1e293b",
  "#18181b",
  "#fef2f2",
  "#fff7ed",
  "#fefce8",
  "#f0fdf4",
  "#ecfeff",
  "#eff6ff",
  "#f5f3ff",
  "#fdf2f8",
  "#020617",
  "#7c3aed",
  "#dc2626",
  "#059669",
  "#0ea5e9",
  "#f97316",
  "#ec4899",
  "#14b8a6",
];

interface CustomTemplate {
  id: string;
  name: string;
  theme: string;
  button_style: string;
  font_style: string;
  background_color: string | null;
  avatar_position: string;
}

export default function DashboardAppearance({ profile, onUpdate }: Props) {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(
    profile?.theme || "default",
  );
  const [selectedButton, setSelectedButton] = useState(
    profile?.button_style || "rounded",
  );
  const [selectedFont, setSelectedFont] = useState(
    profile?.font_style || "inter",
  );
  const [selectedAvatarPos, setSelectedAvatarPos] = useState(
    (profile as any)?.avatar_position || "center",
  );
  const [selectedBgColor, setSelectedBgColor] = useState(
    profile?.background_color || "#ffffff",
  );
  const [customBgColor, setCustomBgColor] = useState("");
  const [bgImageUrl, setBgImageUrl] = useState(
    (profile as any)?.background_image_url || "",
  );
  const [uploadingBg, setUploadingBg] = useState(false);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // Custom templates
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("custom_templates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setCustomTemplates(data as CustomTemplate[]);
      });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate({
      theme: selectedTheme,
      button_style: selectedButton,
      font_style: selectedFont,
      background_color: selectedBgColor,
    } as any);
    // Save avatar_position and background_image_url via direct update
    if (profile) {
      await supabase
        .from("profiles")
        .update({
          avatar_position: selectedAvatarPos,
          background_image_url: bgImageUrl || null,
        } as any)
        .eq("id", profile.id);
    }
    setSaving(false);
    toast({ title: "✅ Apparence sauvegardée !" });
  };

  const handleBgImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingBg(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/background.${ext}`;
    const { error } = await supabase.storage
      .from("backgrounds")
      .upload(path, file, { upsert: true });
    if (error) {
      toast({
        title: "Erreur upload",
        description: error.message,
        variant: "destructive",
      });
      setUploadingBg(false);
      return;
    }
    const { data } = supabase.storage.from("backgrounds").getPublicUrl(path);
    const url = data.publicUrl + `?t=${Date.now()}`;
    setBgImageUrl(url);
    toast({ title: "✅ Image de fond ajoutée — pense à sauvegarder !" });
    setUploadingBg(false);
  };

  const removeBgImage = () => {
    setBgImageUrl("");
    toast({ title: "Image de fond supprimée — pense à sauvegarder !" });
  };

  const handleSaveCustomTemplate = async () => {
    if (!user || !templateName.trim()) return;
    setSavingTemplate(true);
    const { data, error } = await supabase
      .from("custom_templates")
      .insert({
        user_id: user.id,
        name: templateName.trim(),
        theme: selectedTheme,
        button_style: selectedButton,
        font_style: selectedFont,
        background_color: selectedBgColor,
        avatar_position: selectedAvatarPos,
      } as any)
      .select()
      .single();
    if (data && !error) {
      setCustomTemplates((prev) => [data as CustomTemplate, ...prev]);
      toast({ title: "✅ Modèle personnalisé sauvegardé !" });
      setTemplateName("");
      setShowSaveForm(false);
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder.",
        variant: "destructive",
      });
    }
    setSavingTemplate(false);
  };

  const handleLoadCustomTemplate = (tpl: CustomTemplate) => {
    setSelectedTheme(tpl.theme);
    setSelectedButton(tpl.button_style);
    setSelectedFont(tpl.font_style);
    setSelectedBgColor(tpl.background_color || "#ffffff");
    setSelectedAvatarPos(tpl.avatar_position);
    toast({ title: `🎨 Modèle "${tpl.name}" chargé — pense à sauvegarder !` });
  };

  const handleDeleteCustomTemplate = async (id: string) => {
    await supabase.from("custom_templates").delete().eq("id", id);
    setCustomTemplates((prev) => prev.filter((t) => t.id !== id));
    toast({ title: "🗑️ Modèle supprimé" });
  };

  const currentFont = FONT_STYLES.find((f) => f.id === selectedFont);
  const currentBtnCls =
    BUTTON_STYLES.find((b) => b.id === selectedButton)?.cls || "rounded-xl";

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      {/* Active template */}
      {(() => {
        const active = TEMPLATES.find(
          (t) =>
            t.background_color === profile?.background_color &&
            t.theme === profile?.theme &&
            t.button_style === profile?.button_style &&
            t.font_style === profile?.font_style,
        );
        if (!active) return null;
        return (
          <motion.div
            custom={-1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden"
              style={{ background: active.preview.coverBg }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Modèle actif</p>
              <p className="text-sm font-bold text-foreground truncate">
                {active.name}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {active.category}
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard/modeles")}
              className="px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> Changer
            </button>
          </motion.div>
        );
      })()}

      {/* Theme */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl border border-border/40 shadow-card p-5 relative overflow-hidden"
        style={{ background: "hsl(var(--card))" }}
      >
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.03] -translate-y-1/2 translate-x-1/4"
          style={{ background: "var(--gradient-primary)" }}
        />
        <div className="flex items-center gap-2.5 mb-5 relative">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
            <Palette className="w-4 h-4 text-primary-foreground" />
          </div>
          <h3 className="font-dm font-bold text-base text-foreground">
            Thème de couleur
          </h3>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {THEMES.map((theme, i) => (
            <motion.button
              key={theme.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 + 0.1 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedTheme(theme.id)}
              className={`relative group rounded-2xl overflow-hidden border-2 transition-all ${
                selectedTheme === theme.id
                  ? "border-primary shadow-blue ring-2 ring-primary/10"
                  : "border-border/40 hover:border-primary/30"
              }`}
            >
              <div
                className="h-12 w-full relative"
                style={{ background: theme.preview }}
              >
                <span className="absolute top-1.5 left-1.5 text-sm">
                  {theme.emoji}
                </span>
              </div>
              <div className="py-1.5 bg-card">
                <p className="text-[10px] font-semibold text-foreground text-center">
                  {theme.name}
                </p>
              </div>
              {selectedTheme === theme.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full gradient-cta flex items-center justify-center shadow-sm"
                >
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Background color */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl border border-border/40 shadow-card p-5"
        style={{ background: "hsl(var(--card))" }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, hsl(280, 70%, 55%), hsl(280, 70%, 45%))",
            }}
          >
            <Palette className="w-4 h-4 text-primary-foreground" />
          </div>
          <h3 className="font-dm font-bold text-base text-foreground">
            Couleur de fond
          </h3>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {BG_COLORS.map((color) => (
            <motion.button
              key={color}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedBgColor(color)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                selectedBgColor === color
                  ? "border-primary ring-2 ring-primary/20 scale-110"
                  : "border-border/40"
              }`}
              style={{ background: color }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">
            Personnalisé :
          </label>
          <input
            type="color"
            value={selectedBgColor}
            onChange={(e) => setSelectedBgColor(e.target.value)}
            className="w-8 h-8 rounded-lg border border-border/40 cursor-pointer"
          />
          <Input
            value={customBgColor}
            onChange={(e) => {
              setCustomBgColor(e.target.value);
              if (/^#[0-9a-fA-F]{6}$/.test(e.target.value))
                setSelectedBgColor(e.target.value);
            }}
            placeholder="#ff5500"
            className="w-28 h-8 text-xs rounded-lg"
          />
        </div>
      </motion.div>

      {/* Background image (Premium) */}
      <motion.div
        custom={1.5}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl border border-border/40 shadow-card p-5"
        style={{ background: "hsl(var(--card))" }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, hsl(330, 70%, 55%), hsl(330, 70%, 45%))",
            }}
          >
            <ImageIcon className="w-4 h-4 text-primary-foreground" />
          </div>
          <h3 className="font-dm font-bold text-base text-foreground">
            Image d'arrière-plan
          </h3>
          {profile?.plan === "free" && (
            <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Premium
            </span>
          )}
        </div>
        {profile?.plan !== "free" ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Choisis une photo de ta galerie comme arrière-plan de ta page
              portfolio.
            </p>
            {bgImageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-border/50">
                <img
                  src={bgImageUrl}
                  alt="Arrière-plan"
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => bgInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white/90 text-foreground rounded-lg text-xs font-semibold shadow"
                  >
                    {uploadingBg ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Changer"
                    )}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={removeBgImage}
                    className="px-3 py-1.5 bg-destructive/90 text-white rounded-lg text-xs font-semibold shadow"
                  >
                    Supprimer
                  </motion.button>
                </div>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => bgInputRef.current?.click()}
                disabled={uploadingBg}
                className="w-full py-8 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/40 transition-colors flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                {uploadingBg ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
                <span className="text-sm font-medium">
                  {uploadingBg ? "Upload en cours..." : "Choisir une image"}
                </span>
                <span className="text-xs">
                  JPG, PNG. Recommandé : 1080×1920px
                </span>
              </motion.button>
            )}
            <input
              ref={bgInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBgImageUpload}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              L'image d'arrière-plan personnalisée est réservée aux utilisateurs
              Premium.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-sm font-bold flex items-center justify-center gap-1 shadow-lg"
              onClick={() => toast({ title: "Bientôt disponible 🔜" })}
            >
              Passer en Premium 👑
            </motion.button>
          </div>
        )}
      </motion.div>

      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl border border-border/40 shadow-card p-5"
        style={{ background: "hsl(var(--card))" }}
      >
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl gradient-rose flex items-center justify-center shadow-sm">
            <MousePointer2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <h3 className="font-dm font-bold text-base text-foreground">
            Style des boutons
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {BUTTON_STYLES.map((style, i) => (
            <motion.button
              key={style.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 + 0.15 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedButton(style.id)}
              className={`flex flex-col items-center gap-2 p-3 border-2 rounded-2xl transition-all ${
                selectedButton === style.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border/40 hover:border-primary/30"
              }`}
            >
              <div
                className={`w-full py-2 px-2 gradient-cta text-primary-foreground text-[10px] font-semibold text-center shadow-sm ${style.cls}`}
              >
                Mon lien
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">
                {style.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Font */}
      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl border border-border/40 shadow-card p-5"
        style={{ background: "hsl(var(--card))" }}
      >
        <div className="flex items-center gap-2.5 mb-5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, hsl(43, 96%, 56%), hsl(43, 96%, 46%))",
            }}
          >
            <Type className="w-4 h-4 text-primary-foreground" />
          </div>
          <h3 className="font-dm font-bold text-base text-foreground">
            Police de caractères
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {FONT_STYLES.map((font, i) => (
            <motion.button
              key={font.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 + 0.2 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedFont(font.id)}
              className={`p-3 border-2 rounded-2xl text-center transition-all ${
                selectedFont === font.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border/40 hover:border-primary/30"
              }`}
            >
              <p
                className="text-xl font-bold text-foreground mb-0.5"
                style={font.style}
              >
                Aa
              </p>
              <p className="text-[10px] font-semibold text-foreground">
                {font.label}
              </p>
              <p className="text-[9px] text-muted-foreground">{font.desc}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Avatar position */}
      <motion.div
        custom={4}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl border border-border/40 shadow-card p-5"
        style={{ background: "hsl(var(--card))" }}
      >
        <div className="flex items-center gap-2.5 mb-5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, hsl(200, 80%, 50%), hsl(200, 80%, 40%))",
            }}
          >
            <AlignCenter className="w-4 h-4 text-primary-foreground" />
          </div>
          <h3 className="font-dm font-bold text-base text-foreground">
            Position de l'avatar
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {AVATAR_POSITIONS.map((pos) => {
            const Icon = pos.icon;
            return (
              <motion.button
                key={pos.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedAvatarPos(pos.id)}
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-2xl transition-all ${
                  selectedAvatarPos === pos.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/40 hover:border-primary/30"
                }`}
              >
                <div className="w-full h-16 rounded-lg bg-muted/30 border border-border/30 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-r from-primary/20 to-primary/10" />
                  <div
                    className={`absolute top-3 w-6 h-6 rounded-full bg-primary/40 ${
                      pos.id === "left"
                        ? "left-2"
                        : pos.id === "right"
                          ? "right-2"
                          : "left-1/2 -translate-x-1/2"
                    }`}
                  />
                  <div
                    className={`absolute bottom-1.5 flex flex-col gap-0.5 ${
                      pos.id === "left"
                        ? "left-2 items-start"
                        : pos.id === "right"
                          ? "right-2 items-end"
                          : "left-1/2 -translate-x-1/2 items-center"
                    }`}
                  >
                    <div className="w-10 h-1 rounded-full bg-foreground/20" />
                    <div className="w-6 h-1 rounded-full bg-foreground/10" />
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {pos.label}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Preview */}
      <motion.div
        custom={5}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl border border-border/40 shadow-card p-5"
        style={{ background: "hsl(var(--card))" }}
      >
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl gradient-cta flex items-center justify-center shadow-sm">
            <Eye className="w-4 h-4 text-primary-foreground" />
          </div>
          <h3 className="font-dm font-bold text-base text-foreground">
            Aperçu en direct
          </h3>
        </div>
        <div
          className="rounded-2xl overflow-hidden border border-border/40 shadow-sm"
          style={{
            background:
              selectedBgColor ||
              THEMES.find((t) => t.id === selectedTheme)?.preview ||
              "#fff",
          }}
        >
          <div
            className={`flex flex-col gap-3 py-8 px-6 ${
              selectedAvatarPos === "left"
                ? "items-start"
                : selectedAvatarPos === "right"
                  ? "items-end"
                  : "items-center"
            }`}
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-blue"
            >
              {(profile?.display_name || "A")[0].toUpperCase()}
            </motion.div>
            <div
              className={
                selectedAvatarPos === "left"
                  ? "text-left"
                  : selectedAvatarPos === "right"
                    ? "text-right"
                    : "text-center"
              }
            >
              <p className="font-bold text-lg" style={currentFont?.style}>
                {profile?.display_name || "Ton nom"}
              </p>
              <p className="text-sm text-muted-foreground">
                {profile?.bio || "Ta bio ici"}
              </p>
            </div>
            <div className="w-full space-y-2.5 mt-2 max-w-[280px]">
              {["Mon Instagram", "Ma chaîne YouTube", "Mon site"].map(
                (label, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    whileHover={{ scale: 1.03, y: -1 }}
                    className={`w-full py-3 px-4 gradient-cta text-primary-foreground text-sm font-semibold text-center shadow-sm ${currentBtnCls}`}
                    style={currentFont?.style}
                  >
                    {label}
                  </motion.div>
                ),
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Custom templates */}
      <motion.div
        custom={6}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl border border-border/40 shadow-card p-5"
        style={{ background: "hsl(var(--card))" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg, hsl(150, 70%, 45%), hsl(150, 70%, 35%))",
              }}
            >
              <BookmarkPlus className="w-4 h-4 text-primary-foreground" />
            </div>
            <h3 className="font-dm font-bold text-base text-foreground">
              Mes modèles personnalisés
            </h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSaveForm(!showSaveForm)}
            className="px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Sauvegarder
          </motion.button>
        </div>

        <AnimatePresence>
          {showSaveForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="flex gap-2 p-3 rounded-xl bg-muted/30 border border-border/30">
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Nom du modèle..."
                  className="flex-1 h-9 text-sm rounded-lg"
                />
                <Button
                  onClick={handleSaveCustomTemplate}
                  disabled={savingTemplate || !templateName.trim()}
                  size="sm"
                  className="gradient-cta text-primary-foreground rounded-lg h-9 px-4"
                >
                  {savingTemplate ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {customTemplates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun modèle sauvegardé. Configure l'apparence puis clique sur
            "Sauvegarder" !
          </p>
        ) : (
          <div className="space-y-2">
            {customTemplates.map((tpl, i) => (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-background/50 hover:bg-primary/5 transition-colors group"
              >
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 border border-border/30"
                  style={{ background: tpl.background_color || "#fff" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {tpl.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {tpl.font_style} · {tpl.button_style} · {tpl.theme}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLoadCustomTemplate(tpl)}
                  className="px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                >
                  Charger
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteCustomTemplate(tpl.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Save button */}
      <motion.div
        custom={7}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full gradient-cta text-primary-foreground rounded-xl font-semibold shadow-blue h-12 text-sm"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? "Sauvegarde..." : "Sauvegarder l'apparence"}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
