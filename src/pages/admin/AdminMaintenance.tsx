import { useEffect, useState } from "react";
import { firestoreDB as supabase } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { Wrench, Loader2, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function AdminMaintenance() {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .single()
      .then(({ data }) => {
        if (data) {
          const val = data.value as { enabled?: boolean; message?: string };
          setEnabled(val.enabled || false);
          setMessage(val.message || "");
        }
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("app_settings")
      .update({
        value: { enabled, message } as never,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("key", "maintenance_mode");
    if (!error) {
      toast({
        title: enabled
          ? "🔧 Mode maintenance activé"
          : "✅ Mode maintenance désactivé",
      });
    } else {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="font-dm font-bold text-2xl text-foreground">
          Mode Maintenance
        </h2>
        <p className="text-sm text-muted-foreground">
          Activez pour bloquer l'accès aux utilisateurs non-admin
        </p>
      </div>

      <div
        className={`rounded-2xl border-2 p-6 space-y-6 transition-colors ${enabled ? "border-yellow-500/50 bg-yellow-500/5" : "border-border/50 bg-card"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${enabled ? "bg-yellow-500/20" : "bg-muted"}`}
            >
              <Wrench
                className={`w-6 h-6 ${enabled ? "text-yellow-600" : "text-muted-foreground"}`}
              />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {enabled ? "Maintenance active" : "Application en ligne"}
              </p>
              <p className="text-xs text-muted-foreground">
                {enabled
                  ? "Les utilisateurs verront le message ci-dessous"
                  : "Tout fonctionne normalement"}
              </p>
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        <div>
          <Label>Message de maintenance</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="rounded-xl mt-2"
            rows={4}
            placeholder="L'application est en maintenance..."
          />
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="w-full py-2.5 rounded-xl gradient-cta text-primary-foreground font-bold text-sm flex items-center justify-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Enregistrer
        </button>
      </div>
    </div>
  );
}
