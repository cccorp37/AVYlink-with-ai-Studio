import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Phone, CheckCircle2, XCircle, Shield } from "lucide-react";
import { firestoreDB as supabase } from "@/lib/db";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  currency?: string;
  type: "subscription" | "order" | "wallet_topup";
  metadata?: Record<string, unknown>;
  title?: string;
  description?: string;
}

type Step = "form" | "processing" | "success" | "error";

const OPERATORS = [
  {
    id: "MTN",
    label: "MTN MoMo",
    color: "#FFCC00",
    textColor: "#000",
    icon: "📱",
  },
  {
    id: "ORANGE",
    label: "Orange Money",
    color: "#FF6600",
    textColor: "#fff",
    icon: "📱",
  },
];

const COUNTRIES = [
  { code: "CM", label: "🇨🇲 Cameroun", prefix: "+237" },
  { code: "CI", label: "🇨🇮 Côte d'Ivoire", prefix: "+225" },
  { code: "BJ", label: "🇧🇯 Bénin", prefix: "+229" },
];

export function PaymentModal({
  open,
  onClose,
  onSuccess,
  amount,
  currency = "XAF",
  type,
  metadata,
  title,
  description,
}: PaymentModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("form");
  const [service, setService] = useState("MTN");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("CM");
  const [errorMsg, setErrorMsg] = useState("");

  const handlePay = async () => {
    if (!phone || phone.length < 9) {
      toast({
        title: "Numéro invalide",
        description: "Entrez un numéro valide",
        variant: "destructive",
      });
      return;
    }

    setStep("processing");
    try {
      const { data, error } = await supabase.functions.invoke(
        "mesomb-collect",
        {
          body: { 
            amount, 
            service, 
            phone, 
            country, 
            currency, 
            type, 
            metadata,
            userId: auth.currentUser?.uid 
          },
        },
      );

      if (error) throw error;

      if (data?.success) {
        setStep("success");
        setTimeout(() => {
          onSuccess();
          onClose();
          setStep("form");
          setPhone("");
        }, 2000);
      } else {
        setErrorMsg(data?.error || "Le paiement a échoué");
        setStep("error");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setErrorMsg(err?.message || "Erreur de connexion");
      setStep("error");
    }
  };

  const reset = () => {
    setStep("form");
    setErrorMsg("");
  };

  const selectedCountry = COUNTRIES.find((c) => c.code === country);

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
            {title || "Paiement Mobile Money"}
          </DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </DialogHeader>

        {/* Security badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs">
          <Shield className="w-4 h-4" />
          <span className="font-medium">
            Paiement sécurisé — Fonds débités en temps réel
          </span>
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
              {/* Amount */}
              <div className="text-center py-3 rounded-xl bg-secondary/50 border border-border/40">
                <p className="text-xs text-muted-foreground">Montant à payer</p>
                <p className="text-3xl font-dm font-bold text-foreground">
                  {amount.toLocaleString("fr-FR")}{" "}
                  <span className="text-lg">{currency}</span>
                </p>
              </div>

              {/* Operator selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Opérateur
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {OPERATORS.map((op) => (
                    <button
                      key={op.id}
                      onClick={() => setService(op.id)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        service === op.id
                          ? "border-primary shadow-sm"
                          : "border-border/40 hover:border-border"
                      }`}
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
                      className={`px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all ${
                        country === c.code
                          ? "border-primary bg-primary/5"
                          : "border-border/40 hover:border-border"
                      }`}
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
                Payer {amount.toLocaleString("fr-FR")} {currency}
              </Button>

              <p className="text-[11px] text-center text-muted-foreground">
                Une notification USSD sera envoyée sur votre téléphone.
                Confirmez avec votre code PIN.
              </p>
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
                  Confirmez le paiement sur votre téléphone avec votre code PIN
                  Mobile Money.
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
                  {amount.toLocaleString("fr-FR")} {currency} débités avec
                  succès.
                </p>
              </div>
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
