import { useState, useEffect } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  Phone,
  TrendingUp,
  History,
  Info,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { firestoreDB as supabase } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AVYLINK_FEE_RATE = 0.03; // 3%
const MESOMB_FEE_RATE = 0.02; // ~2% estimated

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

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  payment_method: string | null;
  created_at: string;
}

export default function DashboardWallet() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState("XAF");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPhone, setWithdrawPhone] = useState("");
  const [withdrawService, setWithdrawService] = useState("MTN");
  const [withdrawRecipientName, setWithdrawRecipientName] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance, currency")
      .eq("user_id", user.id)
      .single();

    if (wallet) {
      setBalance(wallet.balance);
      setCurrency(wallet.currency);
    }

    const { data: txns } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    setTransactions((txns as Transaction[]) || []);
    setLoading(false);
  };

  const withdrawAmountNum = parseInt(withdrawAmount) || 0;
  const avylinkFee = Math.round(withdrawAmountNum * AVYLINK_FEE_RATE);
  const mesombFee = Math.round(withdrawAmountNum * MESOMB_FEE_RATE);
  const feeAmount = avylinkFee + mesombFee;
  const netAmount = withdrawAmountNum - feeAmount;

  const handleWithdraw = async () => {
    if (withdrawAmountNum < 500) {
      toast({ title: "Montant minimum : 500 XAF", variant: "destructive" });
      return;
    }
    if (withdrawAmountNum > balance) {
      toast({ title: "Solde insuffisant", variant: "destructive" });
      return;
    }
    if (!withdrawPhone || withdrawPhone.length < 9) {
      toast({ title: "Numéro invalide", variant: "destructive" });
      return;
    }
    if (!withdrawRecipientName.trim()) {
      toast({ title: "Nom du destinataire requis", variant: "destructive" });
      return;
    }

    setWithdrawing(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "mesomb-deposit",
        {
          body: { userId: user?.id,
            amount: withdrawAmountNum,
            service: withdrawService,
            phone: withdrawPhone,
            recipient_name: withdrawRecipientName.trim(),
          },
        },
      );

      if (error) throw error;

      if (data?.success) {
        toast({ title: `✅ ${data.message}` });
        setWithdrawOpen(false);
        setWithdrawAmount("");
        setWithdrawPhone("");
        setWithdrawRecipientName("");
        loadData();
      } else {
        toast({
          title: "Retrait échoué",
          description: data?.error,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setWithdrawing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      success: "bg-green-50 text-green-700 border-green-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      processing: "bg-blue-50 text-blue-700 border-blue-200",
      refunded: "bg-purple-50 text-purple-700 border-purple-200",
      failed: "bg-red-50 text-red-700 border-red-200",
    };
    const labels: Record<string, string> = {
      success: "Terminé",
      pending: "En attente",
      processing: "En cours",
      refunded: "Remboursé",
      failed: "Échoué",
    };
    return (
      <span
        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${styles[status] || styles.pending}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    if (type === "withdrawal")
      return <ArrowUpRight className="w-4 h-4 text-red-500" />;
    if (type === "sale_credit")
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    return <ArrowDownLeft className="w-4 h-4 text-primary" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      {/* Balance card */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="relative rounded-2xl p-6 overflow-hidden shadow-card border border-border/40"
        style={{ background: "var(--gradient-cta)" }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-primary-foreground/80" />
            <span className="text-sm font-medium text-primary-foreground/80">
              Mon portefeuille
            </span>
          </div>
          <motion.p
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="text-4xl font-dm font-bold text-primary-foreground"
          >
            {balance.toLocaleString("fr-FR")}{" "}
            <span className="text-xl">{currency}</span>
          </motion.p>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => setWithdrawOpen(true)}
              disabled={balance < 500}
              className="bg-white/20 hover:bg-white/30 text-primary-foreground rounded-xl border-0"
            >
              <ArrowUpRight className="w-4 h-4 mr-1" /> Retirer
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Info */}
      <motion.div
        custom={0.5}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 text-xs text-primary"
      >
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>
          Commission AvyLink sur les ventes : <strong>3%</strong>. Frais de
          retrait : <strong>3% AvyLink + ~2% MeSomb</strong>. Ex : retrait de 5
          000 XAF → vous recevez ~4 750 XAF.
        </span>
      </motion.div>

      {/* Transactions */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl border border-border/40 shadow-card p-5"
        style={{ background: "hsl(var(--card))" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-primary" />
          <h3 className="font-dm font-bold text-base text-foreground">
            Historique des transactions
          </h3>
          <span className="text-xs text-muted-foreground font-normal px-2 py-0.5 rounded-full bg-secondary border border-border/40">
            {transactions.length}
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border/40 rounded-2xl">
            <Wallet className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">
              Aucune transaction
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Vos transactions apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {transactions.map((txn, i) => (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-secondary/50 flex items-center justify-center flex-shrink-0">
                  {getTypeIcon(txn.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {txn.description || txn.type}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(txn.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {txn.payment_method && ` · ${txn.payment_method}`}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-sm font-bold ${txn.amount < 0 ? "text-red-500" : "text-green-600"}`}
                  >
                    {txn.amount > 0 ? "+" : ""}
                    {txn.amount.toLocaleString("fr-FR")} {txn.currency}
                  </p>
                  {getStatusBadge(txn.status)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Withdraw modal */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-dm">Retirer des fonds</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-3 rounded-xl bg-secondary/50 border border-border/40">
              <p className="text-xs text-muted-foreground">Solde disponible</p>
              <p className="text-2xl font-dm font-bold text-foreground">
                {balance.toLocaleString("fr-FR")} {currency}
              </p>
            </div>

            {/* Recipient name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nom du propriétaire du compte *
              </label>
              <Input
                value={withdrawRecipientName}
                onChange={(e) => setWithdrawRecipientName(e.target.value)}
                placeholder="Nom complet du titulaire"
                className="rounded-xl"
              />
            </div>

            {/* Operator */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Réseau Mobile Money *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "MTN", label: "MTN MoMo", color: "#FFCC00" },
                  { id: "ORANGE", label: "Orange Money", color: "#FF6600" },
                ].map((op) => (
                  <button
                    key={op.id}
                    onClick={() => setWithdrawService(op.id)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      withdrawService === op.id
                        ? "border-primary"
                        : "border-border/40"
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Numéro de téléphone du compte *
              </label>
              <Input
                value={withdrawPhone}
                onChange={(e) =>
                  setWithdrawPhone(e.target.value.replace(/\D/g, ""))
                }
                placeholder="6XXXXXXXX"
                className="rounded-xl"
                maxLength={15}
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Montant à retirer *</label>
              <Input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Montant en XAF (min. 500)"
                className="rounded-xl"
              />
            </div>

            {/* Fee breakdown */}
            {withdrawAmountNum >= 500 && (
              <div className="rounded-xl bg-secondary/30 border border-border/40 p-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Montant demandé</span>
                  <span className="font-medium text-foreground">
                    {withdrawAmountNum.toLocaleString("fr-FR")} {currency}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Frais AvyLink (3%)
                  </span>
                  <span className="font-medium text-red-500">
                    -{avylinkFee.toLocaleString("fr-FR")} {currency}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Frais MeSomb (~2%)
                  </span>
                  <span className="font-medium text-red-500">
                    -{mesombFee.toLocaleString("fr-FR")} {currency}
                  </span>
                </div>
                <div className="border-t border-border/40 pt-1.5 flex justify-between text-sm">
                  <span className="font-semibold text-foreground">
                    Vous recevrez
                  </span>
                  <span className="font-bold text-green-600">
                    {netAmount.toLocaleString("fr-FR")} {currency}
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={handleWithdraw}
              disabled={
                withdrawing ||
                withdrawAmountNum < 500 ||
                !withdrawPhone ||
                !withdrawRecipientName.trim()
              }
              className="w-full gradient-cta text-primary-foreground rounded-xl h-11"
            >
              {withdrawing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ArrowUpRight className="w-4 h-4 mr-2" />
              )}
              Retirer{" "}
              {withdrawAmountNum >= 500
                ? `${withdrawAmountNum.toLocaleString("fr-FR")} ${currency}`
                : ""}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
