import { useEffect, useState } from "react";
import { firestoreDB as supabase } from "@/lib/db";
import {
  Search,
  Star,
  Shield,
  Loader2,
  BadgeCheck,
  Ban,
  PauseCircle,
  PlayCircle,
  Pencil,
  X,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  bio: string | null;
  plan: string;
  created_at: string;
  website: string | null;
  is_verified: boolean;
  status: string;
}

export default function AdminUsers() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [filtered, setFiltered] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editProfile, setEditProfile] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({
    display_name: "",
    username: "",
    bio: "",
    plan: "free",
  });
  const [filterStatus, setFilterStatus] = useState("all");

  const loadProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select(
        "id, user_id, display_name, username, bio, plan, created_at, website, is_verified, status",
      )
      .order("created_at", { ascending: false });
    setProfiles((data as UserProfile[]) || []);
    setFiltered((data as UserProfile[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    let result = profiles;
    if (filterStatus !== "all") {
      result = result.filter((p) => p.status === filterStatus);
    }
    if (q) {
      result = result.filter(
        (p) =>
          p.display_name?.toLowerCase().includes(q) ||
          p.username?.toLowerCase().includes(q) ||
          p.bio?.toLowerCase().includes(q),
      );
    }
    setFiltered(result);
  }, [search, profiles, filterStatus]);

  const updateStatus = async (profile: UserProfile, newStatus: string) => {
    setUpdatingId(profile.id + "-status");
    const { error } = await supabase
      .from("profiles")
      .update({ status: newStatus } as never)
      .eq("id", profile.id);
    if (!error) {
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === profile.id ? { ...p, status: newStatus } : p,
        ),
      );
      const labels: Record<string, string> = {
        active: "✅ Compte réactivé",
        suspended: "⏸️ Compte suspendu",
        banned: "🚫 Compte banni",
      };
      toast({ title: labels[newStatus] || "Statut mis à jour" });
    } else {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
    setUpdatingId(null);
  };

  const upgradeToPremium = async (profile: UserProfile) => {
    setUpdatingId(profile.id);
    const newPlan = profile.plan === "premium" ? "free" : "premium";
    const { error } = await supabase
      .from("profiles")
      .update({ plan: newPlan })
      .eq("id", profile.id);
    if (!error) {
      setProfiles((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, plan: newPlan } : p)),
      );
      toast({
        title:
          newPlan === "premium"
            ? "✅ Compte passé en Premium"
            : "Plan remis en Free",
      });
    }
    setUpdatingId(null);
  };

  const toggleVerified = async (profile: UserProfile) => {
    setUpdatingId(profile.id + "-verified");
    const newVal = !profile.is_verified;
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: newVal } as never)
      .eq("id", profile.id);
    if (!error) {
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === profile.id ? { ...p, is_verified: newVal } : p,
        ),
      );
      toast({
        title: newVal ? "✅ Badge Vérifié accordé" : "Badge Vérifié retiré",
      });
    }
    setUpdatingId(null);
  };

  const openEdit = (profile: UserProfile) => {
    setEditProfile(profile);
    setEditForm({
      display_name: profile.display_name || "",
      username: profile.username || "",
      bio: profile.bio || "",
      plan: profile.plan,
    });
  };

  const saveEdit = async () => {
    if (!editProfile) return;
    setUpdatingId(editProfile.id + "-edit");
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: editForm.display_name || null,
        username: editForm.username || null,
        bio: editForm.bio || null,
        plan: editForm.plan,
      } as never)
      .eq("id", editProfile.id);
    if (!error) {
      setProfiles((prev) =>
        prev.map((p) => (p.id === editProfile.id ? { ...p, ...editForm } : p)),
      );
      toast({ title: "✅ Profil mis à jour" });
      setEditProfile(null);
    } else {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
    setUpdatingId(null);
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-500/10 text-green-600",
      suspended: "bg-yellow-500/10 text-yellow-600",
      banned: "bg-destructive/10 text-destructive",
    };
    const labels: Record<string, string> = {
      active: "Actif",
      suspended: "Suspendu",
      banned: "Banni",
    };
    return (
      <span
        className={`px-2 py-0.5 text-xs font-bold rounded-full ${styles[status] || styles.active}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <div>
          <h2 className="font-dm font-bold text-2xl text-foreground">
            Gestion des utilisateurs
          </h2>
          <p className="text-sm text-muted-foreground">
            {profiles.length} compte(s) —{" "}
            {profiles.filter((p) => p.status === "banned").length} banni(s),{" "}
            {profiles.filter((p) => p.status === "suspended").length}{" "}
            suspendu(s)
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="active">Actifs</SelectItem>
              <SelectItem value="suspended">Suspendus</SelectItem>
              <SelectItem value="banned">Bannis</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="pl-9 rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            Aucun utilisateur trouvé
          </p>
        ) : (
          <div className="divide-y divide-border/40">
            {filtered.map((profile) => (
              <div
                key={profile.id}
                className={`flex items-center gap-3 px-5 py-4 hover:bg-secondary/40 transition-colors ${profile.status === "banned" ? "opacity-50" : ""}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0 ${profile.status === "banned" ? "bg-destructive" : profile.status === "suspended" ? "bg-yellow-500" : "gradient-primary"}`}
                >
                  {(profile.display_name ||
                    profile.username ||
                    "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {profile.display_name || "Sans nom"}
                    </p>
                    {profile.is_verified && (
                      <BadgeCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    @{profile.username || "—"} ·{" "}
                    {new Date(profile.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {statusBadge(profile.status)}
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-full ${profile.plan !== "free" ? "gradient-cta text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {profile.plan}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(profile)}
                    title="Modifier"
                    className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleVerified(profile)}
                    disabled={updatingId === profile.id + "-verified"}
                    title={profile.is_verified ? "Retirer vérifié" : "Vérifier"}
                    className={`p-2 rounded-xl transition-colors ${profile.is_verified ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/10"}`}
                  >
                    {updatingId === profile.id + "-verified" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <BadgeCheck className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => upgradeToPremium(profile)}
                    disabled={updatingId === profile.id}
                    title={profile.plan === "premium" ? "Free" : "Premium"}
                    className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    {updatingId === profile.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Star className="w-4 h-4" />
                    )}
                  </button>
                  {profile.status === "active" && (
                    <>
                      <button
                        onClick={() => updateStatus(profile, "suspended")}
                        disabled={updatingId === profile.id + "-status"}
                        title="Suspendre"
                        className="p-2 rounded-xl text-muted-foreground hover:text-yellow-600 hover:bg-yellow-500/10 transition-colors"
                      >
                        <PauseCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateStatus(profile, "banned")}
                        disabled={updatingId === profile.id + "-status"}
                        title="Bannir"
                        className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {(profile.status === "suspended" ||
                    profile.status === "banned") && (
                    <button
                      onClick={() => updateStatus(profile, "active")}
                      disabled={updatingId === profile.id + "-status"}
                      title="Réactiver"
                      className="p-2 rounded-xl text-muted-foreground hover:text-green-600 hover:bg-green-500/10 transition-colors"
                    >
                      {updatingId === profile.id + "-status" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <PlayCircle className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editProfile} onOpenChange={() => setEditProfile(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-dm">Modifier le profil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Nom d'affichage</Label>
              <Input
                value={editForm.display_name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, display_name: e.target.value }))
                }
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <Label>Nom d'utilisateur</Label>
              <Input
                value={editForm.username}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, username: e.target.value }))
                }
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, bio: e.target.value }))
                }
                className="rounded-xl mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label>Plan</Label>
              <Select
                value={editForm.plan}
                onValueChange={(v) => setEditForm((f) => ({ ...f, plan: v }))}
              >
                <SelectTrigger className="rounded-xl mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <button
              onClick={saveEdit}
              disabled={updatingId === editProfile?.id + "-edit"}
              className="w-full py-2.5 rounded-xl gradient-cta text-primary-foreground font-bold text-sm flex items-center justify-center gap-2"
            >
              {updatingId === editProfile?.id + "-edit" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Enregistrer
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
