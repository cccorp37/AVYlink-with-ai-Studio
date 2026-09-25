import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  Mail,
  Calendar,
} from "lucide-react";
import { firestoreDB as supabase } from "@/lib/db";
import type { Tables } from "@/lib/types";

type Profile = Tables<"profiles">;

interface Props {
  profile: Profile | null;
  onBack: () => void;
}

interface FormSubmission {
  id: string;
  full_name: string | null;
  email: string | null;
  message: string | null;
  submitted_at: string;
}

export default function DashboardFormMessages({ profile, onBack }: Props) {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("form_submissions")
      .select("*")
      .eq("profile_id", profile.id)
      .order("submitted_at", { ascending: false })
      .then(({ data }) => {
        setSubmissions((data as FormSubmission[]) || []);
        setLoading(false);
      });
  }, [profile]);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Mes messages de formulaire
      </button>

      <div className="bg-card rounded-2xl border border-border/50 shadow-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-dm font-bold text-base text-foreground">
              Messages reçus
            </h3>
            <p className="text-xs text-muted-foreground">
              Soumissions de tes formulaires de contact
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📬</div>
            <p className="font-medium text-foreground">
              Aucun message pour l'instant
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Ajoute un bloc formulaire à ta page pour recevoir des messages
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-2xl border border-border/50 bg-secondary/20 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {sub.full_name || "Anonyme"}
                    </p>
                    {sub.email && (
                      <a
                        href={`mailto:${sub.email}`}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" /> {sub.email}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                    <Calendar className="w-3 h-3" />
                    {new Date(sub.submitted_at).toLocaleDateString("fr-FR")}
                  </div>
                </div>
                {sub.message && (
                  <p className="text-sm text-foreground/80 bg-card p-3 rounded-xl border border-border/30">
                    {sub.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
