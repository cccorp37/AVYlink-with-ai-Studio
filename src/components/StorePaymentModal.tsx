import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Phone,
  CheckCircle2,
  XCircle,
  Shield,
  ExternalLink,
} from "lucide-react";
import { firestoreDB as supabase } from "@/lib/db";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const PLATFORM_FEE_RATE = 0.03;

interface StoreItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  item_type: string;
  redirect_url: string | null;
  seller_name: string | null;
  seller_phone: string | null;
  seller_email: string | null;
  header_text: string | null;
  profile_id: string;
}

interface StorePaymentModalProps {
  open: boolean;
  onClose: () => void;
  item: StoreItem;
  sellerProfileId: string;
}

type Step = "form" | "processing" | "success" | "error";

const OPERATORS = [
  { id: "MTN", label: "MTN MoMo", color: "#FFCC00", textColor: "#000" },
  { id: "ORANGE", label: "Orange Money", color: "#FF6600", textColor: "#fff" },
];

const COUNTRIES = [
  { code: "CM", label: "🇨🇲 Cameroun", prefix: "+237" },
  { code: "CI", label: "🇨🇮 Côte d'Ivoire", prefix: "+225" },
  { code: "BJ", label: "🇧🇯 Bénin", prefix: "+229" },
];

export function StorePaymentModal({
  open,
  onClose,
  item,
  sellerProfileId,
}: StorePaymentModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("form");
  const [service, setService] = useState("MTN");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("CM");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Client pays price + 7% fee
  const clientAmount = Math.round(item.price * (1 + PLATFORM_FEE_RATE));
  const selectedCountry = COUNTRIES.find((c) => c.code === country);

  const typeLabel =
    item.item_type === "service"
      ? "service"
      : item.item_type === "appointment"
        ? "rendez-vous"
        : "article";

  const handlePay = async () => {
    if (!phone || phone.length < 9) {
      toast({ title: "Numéro invalide", variant: "destructive" });
      return;
    }

    setStep("processing");
    try {
      const { data, error } = await supabase.functions.invoke(
        "mesomb-collect",
        {
          body: {
            amount: clientAmount,
            service,
            phone,
            country,
            currency: item.currency,
            type: "order",
            userId: auth.currentUser?.uid,
            metadata: {
              item_id: item.id,
              item_name: item.name,
              seller_profile_id: sellerProfileId,
              buyer_name: buyerName,
              buyer_email: buyerEmail,
              redirect_url: item.redirect_url,
              quantity: 1,
              description: `Achat: ${item.name}`,
            },
          },
        },
      );

      if (error) throw error;

      if (data?.success) {
        setRedirectUrl(data.redirect_url || item.redirect_url);
        setStep("success");
        if (!data.redirect_url && !item.redirect_url) {
          setTimeout(() => {
            onClose();
            setStep("form");
            setPhone("");
          }, 3000);
        }
      } else {
        setErrorMsg(data?.error || "Le paiement a échoué");
        setStep("error");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Erreur de connexion");
      setStep("error");
    }
  };

  const reset = () => {
    setStep("form");
    setErrorMsg("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        if (step !== "processing") {
          onClose();
          setStep("form");
        }
      }}
    >
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-dm text-lg">
            Payer {typeLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs">
          <Shield className="w-4 h-4" />
          <span className="font-medium">Paiement sécurisé via AVYLINK</span>
        </div>

        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Item preview */}
              <div className="rounded-xl border border-border/40 p-3 flex gap-3">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-dm font-bold text-sm text-foreground truncate">
                    {item.name}
                  </p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div className="text-center py-3 rounded-xl bg-secondary/50 border border-border/40">
                <p className="text-xs text-muted-foreground">Montant à payer</p>
                <p className="text-3xl font-dm font-bold text-foreground">
                  {clientAmount.toLocaleString("fr-FR")}{" "}
                  <span className="text-lg">{item.currency}</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Inclut les frais de service AvyLink de 3%
                </p>
              </div>

              {/* Buyer info */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Votre nom
                  </label>
                  <Input
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Nom complet"
                    className="rounded-xl h-9 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Email (optionnel)
                  </label>
                  <Input
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="email@..."
                    className="rounded-xl h-9 text-sm"
                  />
                </div>
              </div>

              {/* Operator */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Opérateur
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {OPERATORS.map((op) => (
                    <button
                      key={op.id}
                      onClick={() => setService(op.id)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${service === op.id ? "border-primary shadow-sm" : "border-border/40"}`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{
                          backgroundColor: op.color,
                          color: op.textColor,
                        }}
                      >
                        {op.id[0]}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {op.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Pays
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => setCountry(c.code)}
                      className={`px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all ${country === c.code ? "border-primary bg-primary/5" : "border-border/40"}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Numéro Mobile Money
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 px-3 rounded-xl border border-border/40 bg-secondary/30 text-sm font-medium text-muted-foreground">
                    {selectedCountry?.prefix}
                  </div>
                  <Input
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="6XXXXXXXX"
                    className="flex-1 rounded-xl"
                    maxLength={15}
                  />
                </div>
              </div>

              <Button
                onClick={handlePay}
                disabled={!phone || phone.length < 9}
                className="w-full gradient-cta text-primary-foreground rounded-xl h-12 text-base font-bold"
              >
                <Phone className="w-5 h-5 mr-2" />
                Payer {clientAmount.toLocaleString("fr-FR")} {item.currency}
              </Button>

              <p className="text-[11px] text-center text-muted-foreground">
                Confirmez le paiement sur votre téléphone avec votre code PIN
                Mobile Money.
              </p>

              {/* Seller contact */}
              {(item.seller_name || item.seller_phone || item.seller_email) && (
                <div className="rounded-xl border border-border/40 p-3 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">
                    Contact vendeur
                  </p>
                  {item.seller_name && <p>{item.seller_name}</p>}
                  {item.seller_phone && <p>📞 {item.seller_phone}</p>}
                  {item.seller_email && <p>✉️ {item.seller_email}</p>}
                </div>
              )}
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-10 flex flex-col items-center gap-4"
            >
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-dm font-bold text-foreground">
                  Traitement en cours...
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Confirmez le paiement sur votre téléphone.
                </p>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 flex flex-col items-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </motion.div>
              <div className="text-center">
                <p className="font-dm font-bold text-lg text-foreground">
                  Paiement réussi ! 🎉
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {clientAmount.toLocaleString("fr-FR")} {item.currency} débités
                  avec succès.
                </p>
              </div>
              {redirectUrl && (
                <a
                  href={redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  <ExternalLink className="w-4 h-4" /> Continuer
                </a>
              )}
            </motion.div>
          )}

          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 flex flex-col items-center gap-4"
            >
              <XCircle className="w-14 h-14 text-destructive" />
              <div className="text-center">
                <p className="font-dm font-bold text-foreground">
                  Paiement échoué
                </p>
                <p className="text-sm text-destructive mt-1">{errorMsg}</p>
              </div>
              <Button onClick={reset} variant="outline" className="rounded-xl">
                Réessayer
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
