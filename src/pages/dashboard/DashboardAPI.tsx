import { useState, useEffect } from "react";
import {
  Loader2,
  Key,
  Plus,
  Trash2,
  Copy,
  Webhook,
  Globe,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { firestoreDB as supabase } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
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

const EVENTS = [
  {
    id: "page_view",
    label: "Vue de page",
    desc: "Quand quelqu'un visite votre profil",
  },
  {
    id: "link_click",
    label: "Clic sur lien",
    desc: "Quand un visiteur clique sur un lien",
  },
  {
    id: "form_submit",
    label: "Soumission formulaire",
    desc: "Quand un formulaire est rempli",
  },
  {
    id: "profile_update",
    label: "Mise à jour profil",
    desc: "Quand vous modifiez votre profil",
  },
];

function generateApiKey(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "avl_";
  for (let i = 0; i < 32; i++)
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

export default function DashboardAPI() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([]);
  const [creatingWebhook, setCreatingWebhook] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [justCreatedKey, setJustCreatedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    const [keysRes, webhooksRes] = await Promise.all([
      supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("webhooks")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);
    setApiKeys(keysRes.data || []);
    setWebhooks(webhooksRes.data || []);
    setLoading(false);
  };

  const handleCreateKey = async () => {
    if (!user || !newKeyName.trim()) return;
    setCreatingKey(true);
    const fullKey = generateApiKey();
    const preview = fullKey.slice(0, 8) + "..." + fullKey.slice(-4);
    const { error } = await supabase.from("api_keys").insert({
      user_id: user.id,
      name: newKeyName.trim(),
      key_hash: fullKey,
      key_preview: preview,
    });
    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setJustCreatedKey(fullKey);
      toast({
        title: "✅ Clé API créée !",
        description: "Copiez-la maintenant, elle ne sera plus visible.",
      });
      setNewKeyName("");
      loadData();
    }
    setCreatingKey(false);
  };

  const handleDeleteKey = async (id: string) => {
    await supabase.from("api_keys").delete().eq("id", id);
    toast({ title: "Clé supprimée" });
    loadData();
  };

  const handleCreateWebhook = async () => {
    if (!user || !newWebhookUrl.trim() || newWebhookEvents.length === 0) return;
    setCreatingWebhook(true);
    const { error } = await supabase.from("webhooks").insert({
      user_id: user.id,
      url: newWebhookUrl.trim(),
      events: newWebhookEvents,
    });
    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "✅ Webhook créé !" });
      setNewWebhookUrl("");
      setNewWebhookEvents([]);
      loadData();
    }
    setCreatingWebhook(false);
  };

  const handleDeleteWebhook = async (id: string) => {
    await supabase.from("webhooks").delete().eq("id", id);
    toast({ title: "Webhook supprimé" });
    loadData();
  };

  const toggleEvent = (eventId: string) => {
    setNewWebhookEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((e) => e !== eventId)
        : [...prev, eventId],
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm p-5 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-dm font-bold text-lg text-foreground">
              API & Webhooks
            </h2>
            <p className="text-sm text-muted-foreground">
              Gère tes clés API et configure des webhooks
            </p>
          </div>
        </div>
      </motion.div>

      {/* Just created key alert */}
      <AnimatePresence>
        {justCreatedKey && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
          >
            <p className="text-sm font-semibold text-amber-800 mb-2">
              ⚠️ Copiez votre clé API maintenant !
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-amber-100 rounded-lg px-3 py-2 text-amber-900 font-mono break-all">
                {justCreatedKey}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(justCreatedKey);
                  toast({ title: "Copié !" });
                }}
              >
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 text-amber-700"
              onClick={() => setJustCreatedKey(null)}
            >
              Fermer
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Keys */}
      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" />
          <h3 className="font-dm font-bold text-base text-foreground">
            Clés API
          </h3>
        </div>
        <div className="flex gap-3">
          <Input
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Nom de la clé (ex: Production)"
            className="rounded-xl flex-1"
          />
          <Button
            onClick={handleCreateKey}
            disabled={creatingKey || !newKeyName.trim()}
            className="bg-primary text-primary-foreground rounded-xl"
          >
            {creatingKey ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Créer
          </Button>
        </div>
        {loading ? (
          <div className="p-6 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : apiKeys.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune clé API
          </p>
        ) : (
          <div className="space-y-2">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/10"
              >
                <Key className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {key.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {key.key_preview}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${key.is_active ? "bg-green-50 text-green-600 border border-green-200" : "bg-muted text-muted-foreground"}`}
                >
                  {key.is_active ? "Actif" : "Inactif"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteKey(key.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Webhooks */}
      <motion.div
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Webhook className="w-4 h-4 text-primary" />
          <h3 className="font-dm font-bold text-base text-foreground">
            Webhooks
          </h3>
        </div>
        <Input
          value={newWebhookUrl}
          onChange={(e) => setNewWebhookUrl(e.target.value)}
          placeholder="https://votre-serveur.com/webhook"
          className="rounded-xl"
        />
        <div className="grid grid-cols-2 gap-2">
          {EVENTS.map((event) => (
            <motion.button
              key={event.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggleEvent(event.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                newWebhookEvents.includes(event.id)
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border/50 text-muted-foreground hover:border-primary/40"
              }`}
            >
              <p className="text-xs font-semibold">{event.label}</p>
              <p className="text-xs opacity-60 mt-0.5">{event.desc}</p>
            </motion.button>
          ))}
        </div>
        <Button
          onClick={handleCreateWebhook}
          disabled={
            creatingWebhook ||
            !newWebhookUrl.trim() ||
            newWebhookEvents.length === 0
          }
          className="w-full bg-primary text-primary-foreground rounded-xl"
        >
          {creatingWebhook ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Globe className="w-4 h-4 mr-2" />
          )}
          Ajouter le webhook
        </Button>

        {webhooks.length > 0 && (
          <div className="space-y-2 pt-2">
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/10"
              >
                <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {wh.url}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {wh.events?.join(", ")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteWebhook(wh.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
