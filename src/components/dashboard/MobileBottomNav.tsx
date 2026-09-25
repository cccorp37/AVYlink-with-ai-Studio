import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  LayoutTemplate,
  Plug,
  Settings,
  Check,
  FileText,
  Layers,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Tables } from "@/lib/types";
import { firestoreDB as supabase } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";

type Profile = Tables<"profiles">;

const mobileNav = [
  { to: "/dashboard", label: "Accueil", icon: LayoutDashboard, end: true },
  { to: "/dashboard/page", label: "Ma Page", icon: User },
  { to: "/dashboard/modeles", label: "Modèles", icon: LayoutTemplate },
  { to: "/dashboard/integrations", label: "Intégré", icon: Plug },
  { to: "/dashboard/parametres", label: "Réglages", icon: Settings },
];

interface Props {
  profiles: Profile[];
  activeProfile: Profile | null;
  onSwitchProfile: (profile: Profile) => void;
  onProfileCreated: (profile: Profile) => void;
}

export function MobileBottomNav({
  profiles,
  activeProfile,
  onSwitchProfile,
  onProfileCreated,
}: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const currentPlan = activeProfile?.plan || "free";
  const isPaid = currentPlan !== "free";
  const limit = currentPlan === "starter" ? 3 : isPaid ? 999 : 1;
  const canCreate = profiles.length < limit;

  const createPage = async () => {
    if (!isPaid) {
      setShowSwitcher(false);
      navigate("/dashboard/abonnement");
      return;
    }
    if (!canCreate) {
      toast({
        title: `Limite de ${limit} pages atteinte`,
        variant: "destructive",
      });
      return;
    }
    setCreating(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setCreating(false);
      return;
    }
    const base = `${activeProfile?.username || "page"}-${profiles.length + 1}`
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");
    let username = base.length >= 3 ? base : `page-${Date.now().toString(36)}`;
    for (let i = 2; i < 50; i += 1) {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();
      if (!data) break;
      username = `${base}-${i}`;
    }
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        display_name: `Nouvelle page ${profiles.length + 1}`,
        username,
        plan: currentPlan,
      })
      .select()
      .single();
    if (error) {
      toast({
        title: "Impossible d'ajouter la page",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      onProfileCreated(data);
      setShowSwitcher(false);
      navigate("/dashboard/page");
      toast({ title: "Nouvelle page créée ✨", description: `/${username}` });
    }
    setCreating(false);
  };

  return (
    <>
      {/* Page switcher overlay */}
      <AnimatePresence>
        {showSwitcher && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-[55] bg-black/30 backdrop-blur-sm"
              onClick={() => setShowSwitcher(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              className="md:hidden fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-3 right-3 z-[56] rounded-2xl border border-border/60 shadow-xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="px-4 py-3 border-b border-border/40">
                <p className="text-xs font-semibold text-foreground">
                  Mes pages
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {profiles.length} page{profiles.length > 1 ? "s" : ""}
                </p>
              </div>
              <div className="py-1.5 max-h-48 overflow-y-auto">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSwitchProfile(p);
                      setShowSwitcher(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      p.id === activeProfile?.id
                        ? "bg-primary/8 text-primary"
                        : "text-foreground hover:bg-secondary/60"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {p.display_name || p.username || "Sans nom"}
                      </p>
                      {p.username && (
                        <p className="text-[10px] text-muted-foreground">
                          /{p.username}
                        </p>
                      )}
                    </div>
                    {p.id === activeProfile?.id && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              {/* CTA: créer / gérer pages */}
              <div className="p-2 border-t border-border/40 bg-secondary/30">
                {isPaid ? (
                  <button
                    onClick={createPage}
                    disabled={creating || !canCreate}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-primary border border-dashed border-primary/40 hover:bg-primary/5"
                  >
                    <Plus className="w-3.5 h-3.5" />{" "}
                    {canCreate
                      ? "Ajouter une page"
                      : `Limite ${limit} pages atteinte`}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowSwitcher(false);
                      navigate("/dashboard/abonnement");
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold gradient-cta text-primary-foreground"
                  >
                    <Plus className="w-3.5 h-3.5" /> Débloquer le mode multipage
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          borderTop: "1px solid hsl(210 20% 91% / 0.6)",
        }}
      >
        <div className="flex items-stretch">
          <button
            onClick={() => setShowSwitcher(!showSwitcher)}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative text-primary"
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] font-medium">Pages</span>
            <span className="absolute top-1 right-1/2 translate-x-5 min-w-4 h-4 px-1 rounded-full bg-primary/10 text-[9px] font-bold flex items-center justify-center">
              {profiles.length}
            </span>
          </button>
          {mobileNav.map((item) => {
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-tab"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full gradient-cta"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <motion.div
                  animate={
                    isActive ? { scale: 1.15, y: -1 } : { scale: 1, y: 0 }
                  }
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <item.icon
                    className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
                  />
                </motion.div>
                <span
                  className={`text-[10px] font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
