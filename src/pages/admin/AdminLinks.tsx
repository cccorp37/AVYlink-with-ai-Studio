import { useEffect, useState } from "react";
import { firestoreDB as supabase } from "@/lib/db";
import { ExternalLink, Trash2, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getPlatformIcon } from "@/lib/metadata";

interface AdminLink {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  is_active: boolean;
  click_count: number;
  created_at: string;
  profile_id: string;
}

export default function AdminLinks() {
  const { toast } = useToast();
  const [links, setLinks] = useState<AdminLink[]>([]);
  const [filtered, setFiltered] = useState<AdminLink[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("profile_links")
      .select("*")
      .order("click_count", { ascending: false })
      .then(({ data }) => {
        setLinks((data as AdminLink[]) || []);
        setFiltered((data as AdminLink[]) || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? links.filter(
            (l) =>
              l.title.toLowerCase().includes(q) ||
              l.url.toLowerCase().includes(q),
          )
        : links,
    );
  }, [search, links]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await supabase.from("profile_links").delete().eq("id", id);
    setLinks((prev) => prev.filter((l) => l.id !== id));
    setDeletingId(null);
    toast({ title: "Lien supprimé" });
  };

  const totalClicks = links.reduce((s, l) => s + (l.click_count || 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <div>
          <h2 className="font-dm font-bold text-2xl text-foreground">
            Gestion des liens
          </h2>
          <p className="text-sm text-muted-foreground">
            {links.length} lien(s) · {totalClicks} clics au total
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="pl-9 rounded-xl"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            Aucun lien trouvé
          </p>
        ) : (
          <div className="divide-y divide-border/40">
            {filtered.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/40 transition-colors"
              >
                <span className="text-xl flex-shrink-0">
                  {getPlatformIcon(link.icon || "website")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {link.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {link.url}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`w-2 h-2 rounded-full ${link.is_active ? "bg-success" : "bg-muted-foreground"}`}
                  />
                  <span className="text-sm font-semibold text-primary min-w-[40px] text-right">
                    {link.click_count}
                  </span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleDelete(link.id)}
                    disabled={deletingId === link.id}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    {deletingId === link.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
