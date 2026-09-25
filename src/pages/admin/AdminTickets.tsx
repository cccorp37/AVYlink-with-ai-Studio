import { useEffect, useState } from "react";
import { firestoreDB as supabase } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Shield,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Reply {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

interface Ticket {
  id: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  created_at: string;
  user_id: string;
}

export default function AdminTickets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);
  const [loadingReplies, setLoadingReplies] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setTickets((data as Ticket[]) || []);
        setLoading(false);
      });
  }, []);

  // Realtime replies
  useEffect(() => {
    const channel = supabase
      .channel("admin-ticket-replies")
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
  }, []);

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

  const sendReply = async (ticketId: string) => {
    const text = replyText[ticketId]?.trim();
    if (!text || !user) return;
    setSendingReply(ticketId);
    const { error } = await supabase.from("ticket_replies").insert({
      ticket_id: ticketId,
      user_id: user.id,
      message: text,
      is_admin: true,
    } as never);
    if (!error) {
      setReplyText((prev) => ({ ...prev, [ticketId]: "" }));
      // Auto set to in_progress if still open
      const ticket = tickets.find((t) => t.id === ticketId);
      if (ticket?.status === "open") {
        await supabase
          .from("support_tickets")
          .update({ status: "in_progress" } as never)
          .eq("id", ticketId);
        setTickets((prev) =>
          prev.map((t) =>
            t.id === ticketId ? { ...t, status: "in_progress" } : t,
          ),
        );
      }
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

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("support_tickets")
      .update({ status } as never)
      .eq("id", id);
    if (!error) {
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t)),
      );
      toast({ title: "Statut mis à jour" });
    }
  };

  const filtered =
    filterStatus === "all"
      ? tickets
      : tickets.filter((t) => t.status === filterStatus);

  const priorityBadge = (p: string) => {
    const styles: Record<string, string> = {
      urgent: "bg-destructive/10 text-destructive",
      high: "bg-yellow-500/10 text-yellow-600",
      normal: "bg-primary/10 text-primary",
      low: "bg-muted text-muted-foreground",
    };
    return (
      <span
        className={`px-2 py-0.5 text-xs font-bold rounded-full ${styles[p] || styles.normal}`}
      >
        {p}
      </span>
    );
  };

  const statusIcon = (s: string) => {
    if (s === "resolved" || s === "closed")
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (s === "in_progress")
      return <Clock className="w-4 h-4 text-yellow-500" />;
    return <AlertCircle className="w-4 h-4 text-primary" />;
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-dm font-bold text-2xl text-foreground">
            Tickets de support
          </h2>
          <p className="text-sm text-muted-foreground">
            {tickets.filter((t) => t.status === "open").length} ticket(s)
            ouvert(s)
          </p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px] rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="open">Ouverts</SelectItem>
            <SelectItem value="in_progress">En cours</SelectItem>
            <SelectItem value="resolved">Résolus</SelectItem>
            <SelectItem value="closed">Fermés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border/50 p-12 text-center">
          <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun ticket</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => {
            const isExpanded = expandedTicket === ticket.id;
            const ticketReplies = replies[ticket.id] || [];
            return (
              <div
                key={ticket.id}
                className="bg-card rounded-2xl border border-border/50 overflow-hidden"
              >
                {/* Ticket header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex items-start gap-3 min-w-0 flex-1"
                      onClick={() => toggleExpand(ticket.id)}
                      role="button"
                    >
                      {statusIcon(ticket.status)}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-foreground">
                          {ticket.subject}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {ticket.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {priorityBadge(ticket.priority)}
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(ticket.created_at).toLocaleString(
                              "fr-FR",
                            )}
                          </span>
                          {ticketReplies.length > 0 && (
                            <span className="text-[11px] text-primary font-medium">
                              {ticketReplies.length} réponse(s)
                            </span>
                          )}
                        </div>
                      </div>
                      <button className="p-1 flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <Select
                      value={ticket.status}
                      onValueChange={(v) => updateStatus(ticket.id, v)}
                    >
                      <SelectTrigger className="w-[130px] rounded-xl text-xs flex-shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Ouvert</SelectItem>
                        <SelectItem value="in_progress">En cours</SelectItem>
                        <SelectItem value="resolved">Résolu</SelectItem>
                        <SelectItem value="closed">Fermé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Expanded conversation */}
                {isExpanded && (
                  <div className="border-t border-border/50">
                    {/* Original message */}
                    <div className="px-5 py-3 bg-secondary/30">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                          U
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          Utilisateur
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleString("fr-FR")}
                        </span>
                      </div>
                      <p className="text-sm text-foreground ml-8">
                        {ticket.message}
                      </p>
                    </div>

                    {/* Replies */}
                    {loadingReplies === ticket.id ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="divide-y divide-border/30">
                        {ticketReplies.map((reply) => (
                          <div
                            key={reply.id}
                            className={`px-5 py-3 ${reply.is_admin ? "bg-primary/5" : "bg-secondary/30"}`}
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              {reply.is_admin ? (
                                <>
                                  <div className="w-6 h-6 rounded-full gradient-cta flex items-center justify-center">
                                    <Shield className="w-3 h-3 text-primary-foreground" />
                                  </div>
                                  <span className="text-xs font-bold text-primary">
                                    Admin
                                  </span>
                                </>
                              ) : (
                                <>
                                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                    U
                                  </div>
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Utilisateur
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
                        ))}
                      </div>
                    )}

                    {/* Reply input */}
                    <div className="p-4 border-t border-border/50 bg-card">
                      <div className="flex gap-2">
                        <Textarea
                          value={replyText[ticket.id] || ""}
                          onChange={(e) =>
                            setReplyText((prev) => ({
                              ...prev,
                              [ticket.id]: e.target.value,
                            }))
                          }
                          placeholder="Répondre au ticket..."
                          className="rounded-xl text-sm min-h-[60px]"
                          rows={2}
                        />
                        <button
                          onClick={() => sendReply(ticket.id)}
                          disabled={
                            sendingReply === ticket.id ||
                            !replyText[ticket.id]?.trim()
                          }
                          className="self-end px-4 py-2.5 rounded-xl gradient-cta text-primary-foreground font-bold text-sm flex items-center gap-2 disabled:opacity-50 flex-shrink-0"
                        >
                          {sendingReply === ticket.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
