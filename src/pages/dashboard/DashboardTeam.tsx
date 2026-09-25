import { useState, useEffect } from "react";
import {
  Loader2,
  UserPlus,
  Users,
  Trash2,
  Crown,
  Eye,
  Edit3,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { firestoreDB as supabase } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";
import type { Tables } from "@/lib/types";

type Profile = Tables<"profiles">;
interface Props {
  profile: Profile | null;
}

const ROLES = [
  {
    value: "admin",
    label: "Admin",
    icon: Crown,
    desc: "Accès complet à toutes les fonctionnalités",
  },
  {
    value: "editor",
    label: "Éditeur",
    icon: Edit3,
    desc: "Peut modifier les liens et le contenu",
  },
  {
    value: "viewer",
    label: "Lecteur",
    icon: Eye,
    desc: "Peut seulement consulter les données",
  },
];

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

export default function DashboardTeam({ profile }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!profile) return;
    loadMembers();
  }, [profile]);

  const loadMembers = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });
    setMembers(data || []);
    setLoading(false);
  };

  const handleInvite = async () => {
    if (!user || !profile || !inviteEmail.trim()) return;
    setSending(true);
    const { error } = await supabase.from("team_members").insert({
      profile_id: profile.id,
      email: inviteEmail.trim(),
      role: inviteRole,
      invited_by: user.id,
    });
    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "✅ Invitation envoyée !",
        description: `${inviteEmail} a été invité en tant que ${inviteRole}.`,
      });
      setInviteEmail("");
      loadMembers();
    }
    setSending(false);
  };

  const handleRemove = async (id: string) => {
    await supabase.from("team_members").delete().eq("id", id);
    toast({ title: "Membre retiré" });
    loadMembers();
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
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-dm font-bold text-lg text-foreground">
              Multi-utilisateurs
            </h2>
            <p className="text-sm text-muted-foreground">
              Invite des collaborateurs à gérer ton profil
            </p>
          </div>
          <div className="ml-auto px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {members.length} membre{members.length > 1 ? "s" : ""}
          </div>
        </div>
      </motion.div>

      {/* Invite form */}
      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm p-5 space-y-4"
      >
        <h3 className="font-dm font-bold text-base text-foreground flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-primary" /> Inviter un membre
        </h3>
        <div className="flex gap-3 flex-wrap">
          <Input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="email@exemple.com"
            className="rounded-xl flex-1 min-w-[200px]"
            type="email"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <Button
            onClick={handleInvite}
            disabled={sending || !inviteEmail.trim()}
            className="bg-primary text-primary-foreground rounded-xl"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            Inviter
          </Button>
        </div>

        {/* Roles explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
          {ROLES.map((role) => (
            <div
              key={role.value}
              className="p-3 rounded-xl border border-border/50 bg-muted/20"
            >
              <div className="flex items-center gap-2 mb-1">
                <role.icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  {role.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{role.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Members list */}
      <motion.div
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-3 border-b border-border/50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Membres de l'équipe
          </p>
        </div>
        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Aucun membre invité pour le moment
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {members.map((member, i) => {
              const role =
                ROLES.find((r) => r.value === member.role) || ROLES[2];
              const RoleIcon = role.icon;
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-5 py-4 border-b border-border/30 last:border-0"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {member.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {member.email}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <RoleIcon className="w-3 h-3" /> {role.label}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${member.status === "pending" ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-green-50 text-green-600 border border-green-200"}`}
                      >
                        {member.status === "pending" ? "En attente" : "Actif"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(member.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
