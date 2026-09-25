import { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  ShoppingBag,
  Calendar,
  Briefcase,
  Tag,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { firestoreDB as supabase } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Tables } from "@/lib/types";

type Profile = Tables<"profiles">;

interface Props {
  profile: Profile | null;
}

interface StoreItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  is_active: boolean;
  stock: number | null;
  category: string | null;
  item_type: string;
  redirect_url: string | null;
  seller_name: string | null;
  seller_phone: string | null;
  seller_email: string | null;
  header_text: string | null;
}

const ITEM_TYPES = [
  {
    id: "article",
    label: "Article",
    Icon: Tag,
    desc: "Produit physique ou digital",
  },
  {
    id: "service",
    label: "Service",
    Icon: Briefcase,
    desc: "Prestation de service",
  },
  {
    id: "appointment",
    label: "Rendez-vous",
    Icon: Calendar,
    desc: "Consultation / Honoraires",
  },
];

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

export default function DashboardStore({ profile }: Props) {
  const { toast } = useToast();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    stock: "",
    category: "",
    item_type: "article",
    redirect_url: "",
    seller_name: "",
    seller_phone: "",
    seller_email: "",
    header_text: "",
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const isPremiumOrBusiness =
    profile?.plan === "premium" || profile?.plan === "business";

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("store_items")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems((data as unknown as StoreItem[]) || []);
        setLoading(false);
      });
  }, [profile]);

  const handleAdd = async () => {
    if (!profile || !form.name || !form.price) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("store_items")
      .insert({
        profile_id: profile.id,
        name: form.name,
        description: form.description || null,
        price: parseInt(form.price),
        image_url: form.image_url || null,
        stock: form.stock ? parseInt(form.stock) : null,
        category: form.category || null,
        item_type: form.item_type,
        redirect_url: form.redirect_url || null,
        seller_name: form.seller_name || profile.display_name || null,
        seller_phone: form.seller_phone || null,
        seller_email: form.seller_email || null,
        header_text: form.header_text || null,
      } as any)
      .select()
      .single();

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setItems((prev) => [data as unknown as StoreItem, ...prev]);
      setAddOpen(false);
      setForm({
        name: "",
        description: "",
        price: "",
        image_url: "",
        stock: "",
        category: "",
        item_type: "article",
        redirect_url: "",
        seller_name: "",
        seller_phone: "",
        seller_email: "",
        header_text: "",
      });
      toast({ title: "✅ Élément ajouté !" });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await supabase.from("store_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDeletingId(null);
    toast({ title: "Élément supprimé" });
  };

  const handleToggle = async (item: StoreItem) => {
    const updated = !item.is_active;
    await supabase
      .from("store_items")
      .update({ is_active: updated })
      .eq("id", item.id);
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_active: updated } : i)),
    );
  };

  const getTypeLabel = (type: string) =>
    ITEM_TYPES.find((t) => t.id === type)?.label || "Article";
  const getTypeIcon = (type: string) => {
    if (type === "service") return <Briefcase className="w-3 h-3" />;
    if (type === "appointment") return <Calendar className="w-3 h-3" />;
    return <Tag className="w-3 h-3" />;
  };

  const filteredItems =
    filterType === "all"
      ? items
      : items.filter((i) => i.item_type === filterType);

  // Gate: Premium/Business only
  if (!isPremiumOrBusiness) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-dm font-bold text-xl text-foreground">
            Boutique Premium
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            La vente d'articles, services et rendez-vous est disponible
            uniquement avec les plans Premium et Business.
          </p>
          <Button
            onClick={() => (window.location.hash = "#subscription")}
            className="gradient-cta text-primary-foreground rounded-xl"
          >
            Passer à Premium
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="font-dm font-bold text-xl text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Ma Boutique
          </h2>
          <p className="text-sm text-muted-foreground">
            Articles, services et rendez-vous
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="gradient-cta text-primary-foreground rounded-xl"
        >
          <Plus className="w-4 h-4 mr-1" /> Ajouter
        </Button>
      </motion.div>

      {/* Filter tabs */}
      <motion.div
        custom={0.5}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="flex gap-2 flex-wrap"
      >
        {[{ id: "all", label: "Tout" }, ...ITEM_TYPES].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilterType(t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              filterType === t.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/40 text-muted-foreground hover:border-border"
            }`}
          >
            {t.label}
          </button>
        ))}
      </motion.div>

      {/* Items list */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl border border-border/40 shadow-card p-5"
        style={{ background: "hsl(var(--card))" }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border/40 rounded-2xl">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">Aucun élément</p>
            <p className="text-xs text-muted-foreground mt-1">
              Ajoutez votre premier article, service ou rendez-vous
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnimatePresence>
              {filteredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className={`rounded-xl border p-4 transition-all ${item.is_active ? "border-border/40 bg-secondary/20" : "border-border/20 opacity-50"}`}
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {getTypeIcon(item.item_type)}{" "}
                      {getTypeLabel(item.item_type)}
                    </span>
                  </div>
                  {item.header_text && (
                    <p className="text-[11px] text-muted-foreground font-medium mb-1">
                      {item.header_text}
                    </p>
                  )}
                  <h4 className="font-dm font-bold text-sm text-foreground truncate">
                    {item.name}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="text-lg font-bold text-primary">
                        {item.price.toLocaleString("fr-FR")} {item.currency}
                      </span>
                      <p className="text-[10px] text-muted-foreground">
                        Client paie:{" "}
                        {Math.round(item.price * 1.07).toLocaleString("fr-FR")}{" "}
                        {item.currency}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggle(item)}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                        title={item.is_active ? "Désactiver" : "Activer"}
                      >
                        {item.is_active ? (
                          <Eye className="w-4 h-4 text-green-500" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {item.stock !== null && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Stock : {item.stock}
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Add item dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-dm">Nouvel élément</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Type selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Type *</label>
              <div className="grid grid-cols-3 gap-2">
                {ITEM_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setForm((f) => ({ ...f, item_type: t.id }))}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      form.item_type === t.id
                        ? "border-primary bg-primary/5"
                        : "border-border/40"
                    }`}
                  >
                    <t.Icon
                      className={`w-5 h-5 mx-auto mb-1 ${form.item_type === t.id ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <p className="text-xs font-medium">{t.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Header */}
            <div>
              <label className="text-sm font-medium">En-tête / Header</label>
              <Input
                value={form.header_text}
                onChange={(e) =>
                  setForm((f) => ({ ...f, header_text: e.target.value }))
                }
                placeholder="Ex: 🔥 Offre limitée"
                className="rounded-xl"
              />
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-medium">Nom *</label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder={
                  form.item_type === "service"
                    ? "Consultation Marketing"
                    : form.item_type === "appointment"
                      ? "Rendez-vous 30min"
                      : "T-shirt Premium"
                }
                className="rounded-xl"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Description détaillée..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Prix (XAF) *</label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="5000"
                  className="rounded-xl"
                />
                {form.price && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Client paiera:{" "}
                    {Math.round(parseInt(form.price) * 1.07).toLocaleString(
                      "fr-FR",
                    )}{" "}
                    XAF (frais 7% inclus)
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Stock</label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stock: e.target.value }))
                  }
                  placeholder="Illimité"
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="text-sm font-medium">
                Image / Créative (URL)
              </label>
              <Input
                value={form.image_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, image_url: e.target.value }))
                }
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="text-sm font-medium">Catégorie</label>
              <Input
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                placeholder="Vêtements, Digital, Consulting..."
                className="rounded-xl"
              />
            </div>

            {/* Redirect URL after payment */}
            <div>
              <label className="text-sm font-medium">
                Lien de redirection après paiement
              </label>
              <Input
                value={form.redirect_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, redirect_url: e.target.value }))
                }
                placeholder="https://mon-site.com/merci"
                className="rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Le client sera redirigé ici après un paiement réussi
              </p>
            </div>

            {/* Seller contact info */}
            <div className="rounded-xl border border-border/40 p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">
                Coordonnées du vendeur
              </p>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Nom
                </label>
                <Input
                  value={form.seller_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, seller_name: e.target.value }))
                  }
                  placeholder={profile?.display_name || "Votre nom"}
                  className="rounded-xl h-9"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Téléphone
                  </label>
                  <Input
                    value={form.seller_phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, seller_phone: e.target.value }))
                    }
                    placeholder="6XXXXXXXX"
                    className="rounded-xl h-9"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Email
                  </label>
                  <Input
                    value={form.seller_email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, seller_email: e.target.value }))
                    }
                    placeholder="email@..."
                    className="rounded-xl h-9"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleAdd}
              disabled={saving || !form.name || !form.price}
              className="w-full gradient-cta text-primary-foreground rounded-xl"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Ajouter {getTypeLabel(form.item_type).toLowerCase()}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
