import { useEffect, useState } from "react";
import { firestoreDB as supabase } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  Plus,
  Trash2,
  Loader2,
  Send,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

export default function AdminNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", type: "info" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false });
    setNotifications((data as Notification[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("admin_notifications").insert({
      title: form.title,
      message: form.message,
      type: form.type,
      created_by: user?.id,
    } as never);
    if (!error) {
      toast({ title: "✅ Notification créée" });
      setShowCreate(false);
      setForm({ title: "", message: "", type: "info" });
      load();
    } else {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const toggleActive = async (n: Notification) => {
    await supabase
      .from("admin_notifications")
      .update({ is_active: !n.is_active } as never)
      .eq("id", n.id);
    setNotifications((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, is_active: !x.is_active } : x)),
    );
  };

  const remove = async (id: string) => {
    await supabase.from("admin_notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((x) => x.id !== id));
    toast({ title: "Notification supprimée" });
  };

  const typeColors: Record<string, string> = {
    info: "bg-primary/10 text-primary",
    warning: "bg-yellow-500/10 text-yellow-600",
    success: "bg-green-500/10 text-green-600",
    error: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-dm font-bold text-2xl text-foreground">
            Notifications
          </h2>
          <p className="text-sm text-muted-foreground">
            Créez des messages visibles par tous les utilisateurs
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-cta text-primary-foreground font-bold text-sm"
        >
          <Plus className="w-4 h-4" /> Nouvelle
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border/50 p-12 text-center">
          <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Aucune notification créée
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-card rounded-2xl border border-border/50 p-4 flex items-start gap-4 ${!n.is_active ? "opacity-50" : ""}`}
            >
              <div
                className={`px-2.5 py-1 text-xs font-bold rounded-full mt-0.5 ${typeColors[n.type] || typeColors.info}`}
              >
                {n.type}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">
                  {n.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {n.message}
                </p>
                <p className="text-[11px] text-muted-foreground mt-2">
                  {new Date(n.created_at).toLocaleString("fr-FR")}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => toggleActive(n)}
                  title={n.is_active ? "Désactiver" : "Activer"}
                  className="p-2 rounded-xl hover:bg-secondary transition-colors"
                >
                  {n.is_active ? (
                    <ToggleRight className="w-5 h-5 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                <button
                  onClick={() => remove(n.id)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-dm">
              Créer une notification
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Titre</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="rounded-xl mt-1"
                placeholder="Ex: Mise à jour disponible"
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                className="rounded-xl mt-1"
                rows={3}
                placeholder="Contenu de la notification..."
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
              >
                <SelectTrigger className="rounded-xl mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">ℹ️ Info</SelectItem>
                  <SelectItem value="warning">⚠️ Avertissement</SelectItem>
                  <SelectItem value="success">✅ Succès</SelectItem>
                  <SelectItem value="error">🚨 Erreur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <button
              onClick={create}
              disabled={saving || !form.title.trim()}
              className="w-full py-2.5 rounded-xl gradient-cta text-primary-foreground font-bold text-sm flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Publier la notification
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
