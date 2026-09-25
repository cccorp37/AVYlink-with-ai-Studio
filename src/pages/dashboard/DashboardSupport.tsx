import { useState, useEffect } from "react";
import {
  Loader2,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Shield,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

const STATUS_MAP: Record<
  string,
  { label: string; icon: typeof Clock; color: string }
> = {
  open: {
    label: "Ouvert",
    icon: Clock,
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  in_progress: {
    label: "En cours",
    icon: AlertCircle,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  resolved: {
    label: "Résolu",
    icon: CheckCircle2,
    color: "text-green-600 bg-green-50 border-green-200",
  },
  closed: {
    label: "Fermé",
    icon: CheckCircle2,
    color: "text-muted-foreground bg-muted border-border",
  },
};

interface Reply {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

export default function DashboardSupport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);
  const [loadingReplies, setLoadingReplies] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadTickets();
  }, [user]);

  // Realtime replies
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("user-ticket-replies")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ticket_replies" },
        (payload) => {
          const newReply = payload.new as Reply;
          setReplies((prev) => ({
            ...prev,
            [newReply.ticket_id]: [
              ...(prev[newReply.ticket_id] || []),
              newReply,
            ],
          }));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadTickets = async () => {
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });
    setTickets(data || []);
    setLoading(false);
  };

  const loadReplies = async (ticketId: string) => {
    if (replies[ticketId]) return;
    setLoadingReplies(ticketId);
    const { data } = await supabase
      .from("ticket_replies")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    setReplies((prev) => ({ ...prev, [ticketId]: (data as Reply[]) || [] }));
    setLoadingReplies(null);
  };

  const toggleExpand = (ticketId: string) => {
    if (expandedTicket === ticketId) {
      setExpandedTicket(null);
    } else {
      setExpandedTicket(ticketId);
      loadReplies(ticketId);
    }
  };

  const sendReplyMsg = async (ticketId: string) => {
    const text = replyText[ticketId]?.trim();
    if (!text || !user) return;
    setSendingReply(ticketId);
    const { error } = await supabase.from("ticket_replies").insert({
      ticket_id: ticketId,
      user_id: user.id,
      message: text,
      is_admin: false,
    } as never);
    if (!error) {
      setReplyText((prev) => ({ ...prev, [ticketId]: "" }));
      toast({ title: "✅ Réponse envoyée" });
    } else {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
    setSendingReply(null);
  };

  const handleSubmit = async () => {
    if (!user || !subject.trim() || !message.trim()) return;
    setSending(true);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      subject: subject.trim(),
      message: message.trim(),
      priority,
    });
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le ticket.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "✅ Ticket envoyé !",
        description: "Notre équipe vous répondra sous 24h.",
      });
      setSubject("");
      setMessage("");
      loadTickets();
    }
    setSending(false);
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
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-dm font-bold text-lg text-foreground">
              Support 24h
            </h2>
            <p className="text-sm text-muted-foreground">
              Envoyez un ticket et suivez vos conversations
            </p>
          </div>
        </div>
      </motion.div>

      {/* New ticket form */}
      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm p-5 space-y-4"
      >
        <h3 className="font-dm font-bold text-base text-foreground">
          Nouveau ticket
        </h3>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Sujet du ticket"
          className="rounded-xl"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Décrivez votre problème en détail..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="flex items-center gap-3">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm"
          >
            <option value="low">Basse priorité</option>
            <option value="normal">Normale</option>
            <option value="high">Haute priorité</option>
            <option value="urgent">Urgente</option>
          </select>
          <Button
            onClick={handleSubmit}
            disabled={sending || !subject.trim() || !message.trim()}
            className="ml-auto bg-primary text-primary-foreground rounded-xl"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Envoyer
          </Button>
        </div>
      </motion.div>

      {/* Tickets list */}
      <motion.div
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-3 border-b border-border/50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Mes tickets ({tickets.length})
          </p>
        </div>
        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun ticket pour le moment
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {tickets.map((ticket, i) => {
              const status = STATUS_MAP[ticket.status] || STATUS_MAP.open;
              const StatusIcon = status.icon;
              const isExpanded = expandedTicket === ticket.id;
              const ticketReplies = replies[ticket.id] || [];
              const hasAdminReply = ticketReplies.some((r) => r.is_admin);

              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border/30 last:border-0"
                >
                  {/* Ticket header */}
                  <div
                    className="px-5 py-4 hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => toggleExpand(ticket.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            {ticket.subject}
                          </p>
                          {hasAdminReply && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary">
                              Répondu
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {ticket.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(ticket.created_at).toLocaleDateString(
                            "fr-FR",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                          {ticketReplies.length > 0 && (
                            <span className="ml-2 text-primary font-medium">
                              {ticketReplies.length} message(s)
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded conversation */}
                  {isExpanded && (
                    <div className="border-t border-border/30">
                      {/* Original message */}
                      <div className="px-5 py-3 bg-secondary/20">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                            V
                          </div>
                          <span className="text-xs font-medium text-foreground">
                            Vous
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(ticket.created_at).toLocaleString(
                              "fr-FR",
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-foreground ml-8 whitespace-pre-wrap">
                          {ticket.message}
                        </p>
                      </div>

                      {/* Replies */}
                      {loadingReplies === ticket.id ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        ticketReplies.map((reply) => (
                          <div
                            key={reply.id}
                            className={`px-5 py-3 ${reply.is_admin ? "bg-primary/5" : "bg-secondary/20"}`}
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              {reply.is_admin ? (
                                <>
                                  <div className="w-6 h-6 rounded-full gradient-cta flex items-center justify-center">
                                    <Shield className="w-3 h-3 text-primary-foreground" />
                                  </div>
                                  <span className="text-xs font-bold text-primary">
                                    Support AvyLink
                                  </span>
                                </>
                              ) : (
                                <>
                                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                                    V
                                  </div>
                                  <span className="text-xs font-medium text-foreground">
                                    Vous
                                  </span>
                                </>
                              )}
                              <span className="text-[11px] text-muted-foreground">
                                {new Date(reply.created_at).toLocaleString(
                                  "fr-FR",
                                )}
                              </span>
                            </div>
                            <p className="text-sm text-foreground ml-8 whitespace-pre-wrap">
                              {reply.message}
                            </p>
                          </div>
                        ))
                      )}

                      {/* Reply input (only if ticket not closed) */}
                      {ticket.status !== "closed" && (
                        <div className="p-4 border-t border-border/30 bg-card">
                          <div className="flex gap-2">
                            <Textarea
                              value={replyText[ticket.id] || ""}
                              onChange={(e) =>
                                setReplyText((prev) => ({
                                  ...prev,
                                  [ticket.id]: e.target.value,
                                }))
                              }
                              placeholder="Répondre..."
                              className="rounded-xl text-sm min-h-[50px]"
                              rows={2}
                            />
                            <button
                              onClick={() => sendReplyMsg(ticket.id)}
                              disabled={
                                sendingReply === ticket.id ||
                                !replyText[ticket.id]?.trim()
                              }
                              className="self-end px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 disabled:opacity-50 flex-shrink-0"
                            >
                              {sendingReply === ticket.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
