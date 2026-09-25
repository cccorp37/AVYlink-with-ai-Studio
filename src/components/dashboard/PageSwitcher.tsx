import { useState } from "react";
import {
  Plus,
  ChevronDown,
  FileText,
  Check,
  Crown,
  Trash2,
  Loader2,
  Copy,
  Sparkles,
  Palette,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { firestoreDB as supabase } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Tables } from "@/lib/types";

type Profile = Tables<"profiles">;
type DuplicateMode = "design" | "all";

const PLAN_LIMITS: Record<string, number> = {
  free: 1,
  starter: 3,
  premium: 999,
  business: 999,
};

const PLAN_LABELS: Record<string, string> = {
  free: "Gratuit",
  starter: "Starter",
  premium: "Premium",
  business: "Business",
};

interface Props {
  profiles: Profile[];
  activeProfile: Profile | null;
  onSwitch: (profile: Profile) => void;
  onCreated: (profile: Profile) => void;
  onDeleted: (profileId: string) => void;
  collapsed?: boolean;
}

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

function PagePreviewCard({
  profile,
  isActive,
}: {
  profile: Profile;
  isActive: boolean;
}) {
  const bg = profile.background_color || "hsl(var(--secondary))";
  const cover = profile.cover_url;
  return (
    <div
      className={`relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 ring-1 ${
        isActive ? "ring-primary/60" : "ring-border/60"
      }`}
      style={{ background: cover ? undefined : bg }}
    >
      {cover && (
        <img
          src={cover}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* mini layout hint */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt=""
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full object-cover ring-1 ring-white/70"
        />
      ) : (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center text-[8px] font-bold text-primary">
          {getInitials(profile.display_name)}
        </div>
      )}
      {/* fake links */}
      <div className="absolute left-1 right-1 bottom-1 space-y-0.5">
        <div className="h-1 rounded-sm bg-white/70" />
        <div className="h-1 rounded-sm bg-white/50 w-3/4" />
      </div>
    </div>
  );
}

export function PageSwitcher({
  profiles,
  activeProfile,
  onSwitch,
  onCreated,
  onDeleted,
  collapsed,
}: Props) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [duplicateTarget, setDuplicateTarget] = useState<Profile | null>(null);
  const { toast } = useToast();

  const currentPlan = activeProfile?.plan || "free";
  const limit = PLAN_LIMITS[currentPlan] || 1;
  const canCreate = profiles.length < limit;
  const isPaidPlan = currentPlan !== "free";

  const normalizeSlug = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");

  const checkUsername = async (slug: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", slug)
      .maybeSingle();
    return !data;
  };

  const getAvailableSlug = async (baseValue: string) => {
    const base = normalizeSlug(baseValue) || `page-${Date.now().toString(36)}`;
    let candidate = base.length >= 3 ? base : `${base}-page`;
    let i = 2;
    while (!(await checkUsername(candidate))) {
      candidate = `${base}-${i}`;
      i += 1;
      if (i > 80) candidate = `${base}-${Date.now().toString(36)}`;
    }
    return candidate;
  };

  const handleCreate = async (quick = false) => {
    if (!canCreate) {
      toast({
        title: `Limite de ${limit} pages atteinte`,
        variant: "destructive",
      });
      return;
    }

    const name = quick
      ? `Nouvelle page ${profiles.length + 1}`
      : newName.trim();
    if (!name || (!quick && !newUsername.trim())) {
      toast({
        title: "Remplis le nom et le nom d'utilisateur",
        variant: "destructive",
      });
      return;
    }
    const slug = quick
      ? await getAvailableSlug(
          `${activeProfile?.username || "page"}-${profiles.length + 1}`,
        )
      : normalizeSlug(newUsername);
    if (slug.length < 3) {
      toast({
        title: "Le nom d'utilisateur doit faire au moins 3 caractères",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const free = await checkUsername(slug);
    if (!free) {
      toast({
        title: "Ce nom d'utilisateur est déjà pris",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        display_name: name,
        username: slug,
        plan: currentPlan,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Erreur lors de la création",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      onCreated(data);
      setCreating(false);
      setOpen(false);
      setNewName("");
      setNewUsername("");
      toast({ title: "Nouvelle page ajoutée ✨", description: `/${slug}` });
    }
    setLoading(false);
  };

  const performDuplicate = async (source: Profile, mode: DuplicateMode) => {
    if (!canCreate) {
      toast({
        title: `Limite de ${limit} pages atteinte`,
        variant: "destructive",
      });
      return;
    }
    setDuplicating(source.id);
    setDuplicateTarget(null);

    const base = (source.username || "page").replace(/-copy(-\d+)?$/, "");
    let candidate = `${base}-copy`;
    let i = 1;
    while (!(await checkUsername(candidate))) {
      i += 1;
      candidate = `${base}-copy-${i}`;
      if (i > 50) break;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setDuplicating(null);
      return;
    }

    const {
      id: _id,
      created_at: _c,
      updated_at: _u,
      username: _un,
      is_verified: _v,
      custom_domain: _cd,
      ...clone
    } = source as any;

    // For "design only" we keep visual fields but drop bio/links data
    const baseInsert: Record<string, any> = {
      user_id: user.id,
      username: candidate,
      display_name: `${source.display_name || "Ma page"} (copie)`,
      is_verified: false,
      custom_domain: null,
      plan: source.plan,
      // visual / design
      theme: clone.theme,
      button_style: clone.button_style,
      font_style: clone.font_style,
      background_color: clone.background_color,
      background_image_url: clone.background_image_url,
      cover_url: clone.cover_url,
      avatar_position: clone.avatar_position,
      avatar_url: clone.avatar_url,
      favicon_url: clone.favicon_url,
      verified_badge_style: clone.verified_badge_style,
      hide_branding: clone.hide_branding,
    };

    if (mode === "all") {
      // also copy bio, seo, social, pixels, etc.
      Object.assign(baseInsert, {
        bio: clone.bio,
        website: clone.website,
        social_links: clone.social_links,
        seo_title: clone.seo_title,
        seo_description: clone.seo_description,
        google_analytics_id: clone.google_analytics_id,
        facebook_pixel_id: clone.facebook_pixel_id,
        tiktok_pixel_id: clone.tiktok_pixel_id,
        snapchat_pixel_id: clone.snapchat_pixel_id,
        pinterest_tag_id: clone.pinterest_tag_id,
        linkedin_insight_tag: clone.linkedin_insight_tag,
      });
    }

    const { data: newProfile, error } = await supabase
      .from("profiles")
      .insert(baseInsert as any)
      .select()
      .single();

    if (error || !newProfile) {
      toast({
        title: "Erreur de duplication",
        description: error?.message,
        variant: "destructive",
      });
      setDuplicating(null);
      return;
    }

    if (mode === "all") {
      const { data: blocks } = await supabase
        .from("page_blocks")
        .select("type,title,content,position,is_active")
        .eq("profile_id", source.id);
      if (blocks?.length) {
        await supabase
          .from("page_blocks")
          .insert(blocks.map((b) => ({ ...b, profile_id: newProfile.id })));
      }

      const { data: links } = await supabase
        .from("profile_links")
        .select("title,url,icon,position,is_active")
        .eq("profile_id", source.id);
      if (links?.length) {
        await supabase
          .from("profile_links")
          .insert(links.map((l) => ({ ...l, profile_id: newProfile.id })));
      }
    }

    onCreated(newProfile);
    toast({
      title: mode === "design" ? "Design dupliqué ✨" : "Page dupliquée ✨",
      description: `Nouvelle page : /${candidate}`,
    });
    setDuplicating(null);
  };

  const handleDelete = async (profileId: string) => {
    if (profiles.length <= 1) {
      toast({
        title: "Tu ne peux pas supprimer ta seule page",
        variant: "destructive",
      });
      return;
    }
    setDeleting(profileId);
    await supabase.from("page_blocks").delete().eq("profile_id", profileId);
    await supabase.from("profile_links").delete().eq("profile_id", profileId);
    await supabase.from("page_views").delete().eq("profile_id", profileId);

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", profileId);
    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      onDeleted(profileId);
      toast({ title: "Page supprimée" });
    }
    setDeleting(null);
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mx-auto hover:scale-105 transition"
        title="Mes pages"
      >
        <FileText className="w-4 h-4 text-primary" />
      </button>
    );
  }

  const planLabel = PLAN_LABELS[currentPlan] || "Gratuit";

  return (
    <div className="px-3 py-2">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
      >
        {activeProfile && <PagePreviewCard profile={activeProfile} isActive />}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">
            {activeProfile?.display_name || "Ma page"}
          </p>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-secondary/70 font-medium">
              {planLabel}
            </span>
            <span>·</span>
            <span>
              {profiles.length}/{limit === 999 ? "∞" : limit}
            </span>
          </p>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2 py-1">
              {/* Pages list */}
              <div className="space-y-1 rounded-xl border border-border/40 bg-secondary/20 p-1.5">
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Mes pages
                </p>
                {profiles.map((p) => {
                  const isActive = p.id === activeProfile?.id;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-1.5 group/item rounded-lg transition-all p-1 ${
                        isActive ? "bg-primary/10" : "hover:bg-secondary/80"
                      }`}
                    >
                      <button
                        onClick={() => {
                          onSwitch(p);
                          setOpen(false);
                        }}
                        className="flex-1 flex items-center gap-2 text-xs text-left min-w-0"
                      >
                        <PagePreviewCard profile={p} isActive={isActive} />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`truncate font-semibold ${isActive ? "text-primary" : "text-foreground"}`}
                          >
                            {p.display_name || "Sans nom"}
                          </p>
                          {p.username && (
                            <p className="text-[10px] text-muted-foreground truncate">
                              /{p.username}
                            </p>
                          )}
                        </div>
                        {isActive && (
                          <Check className="w-3 h-3 text-primary flex-shrink-0" />
                        )}
                      </button>

                      {/* Actions */}
                      <div className="flex items-center pr-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        {isPaidPlan && canCreate && (
                          <button
                            onClick={() => setDuplicateTarget(p)}
                            disabled={duplicating === p.id}
                            title="Dupliquer cette page"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10"
                          >
                            {duplicating === p.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                        {profiles.length > 1 && !isActive && (
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deleting === p.id}
                            title="Supprimer"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            {deleting === p.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Create CTA */}
              {isPaidPlan && canCreate && !creating && (
                <button
                  onClick={() => handleCreate(true)}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-primary border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  Ajouter une page
                </button>
              )}

              {!isPaidPlan && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-foreground">
                      Mode multipage
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-snug">
                      Passe en Starter (3 pages) ou Premium (illimité) pour
                      créer plusieurs portfolios.
                    </p>
                  </div>
                </div>
              )}

              {isPaidPlan && !canCreate && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/50 border border-border/40">
                  <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <p className="text-[10px] text-muted-foreground leading-snug">
                    Limite de <b>{limit} pages</b> atteinte sur ton plan{" "}
                    {planLabel}.
                  </p>
                </div>
              )}

              {/* Create form */}
              <AnimatePresence>
                {creating && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 space-y-2 border border-primary/20 rounded-xl bg-primary/5">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nom de la page"
                        className="h-8 text-xs rounded-lg"
                      />
                      <Input
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="nom-utilisateur (URL)"
                        className="h-8 text-xs rounded-lg"
                      />
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleCreate()}
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium gradient-cta text-primary-foreground"
                        >
                          {loading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Créer la page"
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setCreating(false);
                            setNewName("");
                            setNewUsername("");
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-secondary"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duplicate mode dialog */}
      <Dialog
        open={!!duplicateTarget}
        onOpenChange={(o) => !o && setDuplicateTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Dupliquer la page</DialogTitle>
            <DialogDescription>
              Que veux-tu copier depuis{" "}
              <b>
                {duplicateTarget?.display_name || duplicateTarget?.username}
              </b>{" "}
              ?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            <button
              onClick={() =>
                duplicateTarget && performDuplicate(duplicateTarget, "design")
              }
              className="w-full flex items-start gap-3 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Palette className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">
                  Copier seulement le design
                </p>
                <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                  Thème, couleurs, polices, bannière et avatar. Blocs et liens
                  vides.
                </p>
              </div>
            </button>
            <button
              onClick={() =>
                duplicateTarget && performDuplicate(duplicateTarget, "all")
              }
              className="w-full flex items-start gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Layers className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Copier tout</p>
                <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                  Design + bio, blocs, liens, intégrations et SEO.
                </p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
