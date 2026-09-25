import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  ExternalLink,
  GripVertical,
  Loader2,
  ArrowRight,
  Check,
  Link2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { firestoreDB as supabase } from "@/lib/db";
import {
  extractMetadata,
  getPlatformIcon,
  getPlatformLabel,
  getPlatformColor,
} from "@/lib/metadata";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import type { Tables } from "@/lib/types";

type Profile = Tables<"profiles">;
type ProfileLink = Tables<"profile_links">;

interface Props {
  profile: Profile | null;
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

export default function DashboardLinks({ profile }: Props) {
  const { toast } = useToast();
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [url, setUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [preview, setPreview] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("profile_links")
      .select("*")
      .eq("profile_id", profile.id)
      .order("position", { ascending: true })
      .then(({ data }) => {
        setLinks(data || []);
        setLoading(false);
      });
  }, [profile]);

  const handleExtract = async () => {
    if (!url.trim()) return;
    setIsExtracting(true);
    setPreview(null);
    try {
      const meta = await extractMetadata(url.trim());
      if (meta.success) setPreview(meta as unknown as Record<string, unknown>);
      else
        toast({
          title: "Impossible d'extraire",
          description: meta.error || "URL invalide",
          variant: "destructive",
        });
    } catch {
      toast({
        title: "Erreur",
        description: "Vérifie l'URL et réessaie",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddLink = async () => {
    if (!preview || !profile) return;
    const meta = preview as { url: string; title: string; platform: string };
    const { data, error } = await supabase
      .from("profile_links")
      .insert({
        profile_id: profile.id,
        url: meta.url,
        title: meta.title || "Lien",
        icon: meta.platform || "website",
        position: links.length,
        is_active: true,
      })
      .select()
      .single();
    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    if (data) {
      setLinks((prev) => [...prev, data]);
      setUrl("");
      setPreview(null);
      toast({ title: "✅ Lien ajouté !" });
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await supabase.from("profile_links").delete().eq("id", id);
    setLinks((prev) => prev.filter((l) => l.id !== id));
    setDeletingId(null);
    toast({ title: "Lien supprimé" });
  };

  const handleToggle = async (link: ProfileLink) => {
    const updated = !link.is_active;
    await supabase
      .from("profile_links")
      .update({ is_active: updated })
      .eq("id", link.id);
    setLinks((prev) =>
      prev.map((l) => (l.id === link.id ? { ...l, is_active: updated } : l)),
    );
  };

  const handleEditSave = async (id: string) => {
    await supabase
      .from("profile_links")
      .update({ title: editTitle })
      .eq("id", id);
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, title: editTitle } : l)),
    );
    setEditingId(null);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      {/* Add link */}
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
          style={{ background: "var(--gradient-cta)" }}
        />

        <h3 className="font-dm font-bold text-base text-foreground mb-1 flex items-center gap-2 relative">
          <div className="w-8 h-8 rounded-xl gradient-cta flex items-center justify-center shadow-sm">
            <Plus className="w-4 h-4 text-primary-foreground" />
          </div>
          Ajouter un lien
        </h3>
        <p className="text-xs text-muted-foreground mb-4 ml-10">
          Colle n'importe quel lien — YouTube, Spotify, Instagram, site web...
        </p>

        <div className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1 rounded-xl border-border/60 focus:border-primary/40"
            onKeyDown={(e) => e.key === "Enter" && handleExtract()}
          />
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={handleExtract}
              disabled={isExtracting || !url.trim()}
              className="gradient-cta text-primary-foreground rounded-xl px-5 gap-1.5 flex-shrink-0 shadow-sm"
            >
              {isExtracting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isExtracting ? "..." : "Analyser"}
            </Button>
          </motion.div>
        </div>

        {/* Preview */}
        <AnimatePresence>
          {preview &&
            (() => {
              const meta = preview as {
                url: string;
                title: string;
                description: string;
                image: string;
                platform: string;
                siteName: string;
              };
              const platform = meta.platform || "website";
              const icon = getPlatformIcon(platform);
              const color = getPlatformColor(platform);
              const label = getPlatformLabel(platform);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="mt-4 rounded-2xl border border-primary/20 overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(204 94% 52% / 0.04), hsl(204 94% 52% / 0.08))",
                  }}
                >
                  {meta.image && (
                    <img
                      src={meta.image}
                      alt={meta.title}
                      className="w-full h-36 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{icon}</span>
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        {label}
                      </span>
                    </div>
                    <p className="font-dm font-bold text-sm text-foreground mb-1 line-clamp-2">
                      {meta.title || "Sans titre"}
                    </p>
                    {meta.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {meta.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                      >
                        <Button
                          size="sm"
                          className="w-full gradient-cta text-primary-foreground rounded-xl shadow-sm"
                          onClick={handleAddLink}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
                        </Button>
                      </motion.div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-xl"
                        onClick={() => {
                          setPreview(null);
                          setUrl("");
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
        </AnimatePresence>
      </motion.div>

      {/* Links list */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl border border-border/40 shadow-card p-5"
        style={{ background: "hsl(var(--card))" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-dm font-bold text-base text-foreground flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" />
            Mes liens
            <span className="text-xs text-muted-foreground font-normal ml-1 px-2 py-0.5 rounded-full bg-secondary border border-border/40">
              {links.length}
            </span>
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : links.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 border-2 border-dashed border-border/40 rounded-2xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-3">
              <Link2 className="w-7 h-7 text-primary/30" />
            </div>
            <p className="font-medium text-foreground text-sm">
              Aucun lien pour l'instant
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Ajoute ton premier lien en collant une URL ci-dessus
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {links.map((link, i) => {
                const platform = link.icon || "website";
                const icon = getPlatformIcon(platform);
                const color = getPlatformColor(platform);
                const isEditing = editingId === link.id;

                return (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    whileHover={{ scale: 1.01 }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      link.is_active
                        ? "bg-secondary/30 border-border/40 hover:border-primary/20 hover:shadow-sm"
                        : "bg-muted/10 border-border/20 opacity-50"
                    }`}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground/30 flex-shrink-0 cursor-grab" />
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg shadow-sm border border-border/20"
                      style={{ backgroundColor: `${color}10` }}
                    >
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="h-8 text-xs rounded-xl"
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleEditSave(link.id)
                            }
                            autoFocus
                          />
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditSave(link.id)}
                            className="p-1.5 text-primary rounded-lg hover:bg-primary/10"
                          >
                            <Check className="w-4 h-4" />
                          </motion.button>
                        </div>
                      ) : (
                        <>
                          <p
                            className="text-sm font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                            onClick={() => {
                              setEditingId(link.id);
                              setEditTitle(link.title);
                            }}
                          >
                            {link.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {link.url}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Toggle */}
                      <button
                        onClick={() => handleToggle(link)}
                        className={`w-9 h-5 rounded-full transition-all relative ${link.is_active ? "bg-primary shadow-sm" : "bg-muted"}`}
                      >
                        <motion.span
                          animate={{ left: link.is_active ? 16 : 2 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                          style={{ position: "absolute" }}
                        />
                      </button>
                      {/* Click count */}
                      <span className="text-[11px] font-semibold text-muted-foreground min-w-[24px] text-center tabular-nums">
                        {link.click_count}
                      </span>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(link.id)}
                        disabled={deletingId === link.id}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        {deletingId === link.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
