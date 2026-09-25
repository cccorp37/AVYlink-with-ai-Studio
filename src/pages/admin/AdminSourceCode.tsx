import { useState, useMemo, useEffect, useRef } from "react";
import { Download, FileCode, Loader2, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 40;

// Include every source file we can statically resolve at build time.
const modules = import.meta.glob(
  [
    "/index.html",
    "/README.md",
    "/package.json",
    "/vite.config.ts",
    "/tailwind.config.ts",
    "/tsconfig.json",
    "/tsconfig.app.json",
    "/tsconfig.node.json",
    "/components.json",
    "/postcss.config.js",
    "/eslint.config.js",
    "/vitest.config.ts",
    "/src/**/*.{tsx,ts,jsx,js,css,html,md,json}",
    "/supabase-legacy-reference/**/*.{ts,tsx,js,sql,json,toml,md}",
    "/public/robots.txt",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/build/**",
    "!**/*.test.ts",
    "!**/*.test.tsx",
  ],
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;

const APP_VERSION = "2.0.0";

function categoryOf(path: string): string {
  if (path.startsWith("/src/pages/admin/")) return "Admin — Pages";
  if (path.startsWith("/src/pages/dashboard/")) return "Dashboard — Pages";
  if (path.startsWith("/src/pages/")) return "Pages publiques";
  if (path.startsWith("/src/components/dashboard/"))
    return "Composants — Dashboard";
  if (path.startsWith("/src/components/ui/")) return "Composants — UI (shadcn)";
  if (path.startsWith("/src/components/")) return "Composants";
  if (path.startsWith("/src/hooks/")) return "Hooks React";
  if (path.startsWith("/src/lib/")) return "Utilitaires";
  if (path.startsWith("/src/integrations/")) return "Intégrations";
  if (path.startsWith("/src/")) return "Source (racine)";
  if (path.startsWith("/supabase-legacy-reference/functions/"))
    return "Edge Functions (backend historique)";
  if (path.startsWith("/supabase-legacy-reference/migrations/")) return "Migrations SQL (historique)";
  if (path.startsWith("/supabase-legacy-reference/")) return "Configuration Supabase (historique)";
  if (path.startsWith("/public/")) return "Public";
  return "Configuration projet";
}

const CATEGORY_ORDER = [
  "Configuration projet",
  "Source (racine)",
  "Pages publiques",
  "Dashboard — Pages",
  "Admin — Pages",
  "Composants",
  "Composants — Dashboard",
  "Composants — UI (shadcn)",
  "Hooks React",
  "Utilitaires",
  "Intégrations",
  "Configuration Supabase",
  "Edge Functions (backend)",
  "Migrations SQL",
  "Public",
];

export default function AdminSourceCode() {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [search, setSearch] = useState("");

  const files = useMemo(() => {
    return Object.entries(modules)
      .map(([path, content]) => {
        const text = typeof content === "string" ? content : "";
        return {
          path,
          content: text,
          lines: text.split("\n").length,
          bytes: new Blob([text]).size,
          category: categoryOf(path),
        };
      })
      .sort((a, b) => {
        const ai = CATEGORY_ORDER.indexOf(a.category);
        const bi = CATEGORY_ORDER.indexOf(b.category);
        return ai - bi || a.path.localeCompare(b.path);
      });
  }, []);

  const totalFiles = files.length;
  const totalLines = files.reduce((n, f) => n + f.lines, 0);
  const totalBytes = files.reduce((n, f) => n + f.bytes, 0);

  const byCategory = useMemo(() => {
    const map = new Map<string, typeof files>();
    for (const f of files) {
      if (!map.has(f.category)) map.set(f.category, []);
      map.get(f.category)!.push(f);
    }
    return map;
  }, [files]);

  const filtered = useMemo(() => {
    if (!search.trim()) return files;
    const q = search.toLowerCase();
    return files.filter((f) => f.path.toLowerCase().includes(q));
  }, [files, search]);

  const humanBytes = (n: number) => {
    if (n < 1024) return `${n} o`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} Ko`;
    return `${(n / (1024 * 1024)).toFixed(2)} Mo`;
  };

  const handleDownload = () => {
    setDownloading(true);
    const now = new Date();
    const bar = "═".repeat(80);
    const thin = "─".repeat(80);
    const lines: string[] = [];

    // Header cover
    lines.push(bar);
    lines.push("  AVYLINK — CODE SOURCE COMPLET DE L'APPLICATION");
    lines.push(bar);
    lines.push(`  Version         : ${APP_VERSION}`);
    lines.push(
      `  Généré le       : ${now.toLocaleDateString("fr-FR")} à ${now.toLocaleTimeString("fr-FR")}`,
    );
    lines.push(`  Fichiers        : ${totalFiles}`);
    lines.push(`  Lignes de code  : ${totalLines.toLocaleString("fr-FR")}`);
    lines.push(`  Taille totale   : ${humanBytes(totalBytes)}`);
    lines.push(
      `  Stack technique : React 18 · Vite · TypeScript · Tailwind · shadcn/ui · Supabase`,
    );
    lines.push(
      `  Backend         : Supabase (Auth, DB, RLS, Storage, Edge Functions)`,
    );
    lines.push(`  Paiements       : MeSomb (Mobile Money — Orange, MTN)`);
    lines.push(bar);
    lines.push("");

    // Summary per category
    lines.push("SOMMAIRE PAR CATÉGORIE");
    lines.push(thin);
    for (const cat of CATEGORY_ORDER) {
      const list = byCategory.get(cat);
      if (!list?.length) continue;
      const catLines = list.reduce((n, f) => n + f.lines, 0);
      lines.push(
        `  • ${cat.padEnd(38, " ")} ${String(list.length).padStart(4)} fichier(s)  ${String(catLines).padStart(7)} lignes`,
      );
    }
    lines.push("");

    // Full file index
    lines.push("TABLE COMPLÈTE DES FICHIERS");
    lines.push(thin);
    files.forEach((f, i) => {
      const idx = String(i + 1).padStart(3, " ");
      lines.push(
        `  ${idx}. ${f.path.replace(/^\//, "").padEnd(60, " ")} ${String(f.lines).padStart(5)} l.  ${humanBytes(f.bytes).padStart(9)}`,
      );
    });
    lines.push("");
    lines.push(bar);
    lines.push("");

    // File contents grouped by category
    for (const cat of CATEGORY_ORDER) {
      const list = byCategory.get(cat);
      if (!list?.length) continue;
      lines.push("");
      lines.push(bar);
      lines.push(
        `  SECTION : ${cat.toUpperCase()}  (${list.length} fichier(s))`,
      );
      lines.push(bar);
      for (const f of list) {
        lines.push("");
        lines.push(thin);
        lines.push(`  FICHIER  : ${f.path.replace(/^\//, "")}`);
        lines.push(
          `  LIGNES   : ${f.lines}   TAILLE : ${humanBytes(f.bytes)}   CATÉGORIE : ${f.category}`,
        );
        lines.push(thin);
        lines.push("");
        lines.push(f.content);
        lines.push("");
      }
    }

    lines.push("");
    lines.push(bar);
    lines.push(
      `  FIN DU DOCUMENT — © ${now.getFullYear()} AvyLink. Tous droits réservés.`,
    );
    lines.push(bar);

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `avylink-code-source-v${APP_VERSION}-${now.toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloading(false);
    toast({
      title: "Document généré",
      description: `${totalFiles} fichiers · ${totalLines.toLocaleString("fr-FR")} lignes · ${humanBytes(totalBytes)}`,
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="font-dm font-bold text-2xl text-foreground flex items-center gap-2">
          <FileCode className="w-6 h-6 text-primary" />
          Code Source Complet
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Export complet, à jour et détaillé de tout le code de l'application
          AvyLink — frontend, backend, configuration.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Fichiers", value: totalFiles.toString(), emoji: "📄" },
          {
            label: "Lignes de code",
            value: totalLines.toLocaleString("fr-FR"),
            emoji: "📝",
          },
          { label: "Taille", value: humanBytes(totalBytes), emoji: "💾" },
          { label: "Version", value: `v${APP_VERSION}`, emoji: "🏷️" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card rounded-2xl border border-border/50 shadow-card p-4 text-center"
          >
            <div className="text-2xl mb-1">{s.emoji}</div>
            <div className="font-dm font-bold text-xl text-foreground">
              {s.value}
            </div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20 p-8 text-center space-y-4">
        <div className="text-5xl">📥</div>
        <h3 className="font-dm font-bold text-xl text-foreground">
          Télécharger tout le code source
        </h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Un seul fichier .txt structuré par sections (frontend, dashboard,
          admin, backend, migrations SQL, edge functions…), avec sommaire, index
          et contenu complet de chaque fichier.
        </p>
        <Button
          onClick={handleDownload}
          disabled={downloading}
          size="lg"
          className="gradient-cta text-primary-foreground rounded-2xl font-bold text-base px-10 py-6 shadow-blue hover:shadow-blue-lg transition-all"
        >
          {downloading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Download className="w-5 h-5 mr-2" />
          )}
          Télécharger le document complet
        </Button>
      </div>

      <FileList
        files={filtered}
        totalFiles={totalFiles}
        search={search}
        setSearch={setSearch}
      />
    </div>
  );
}

function FileList({
  files,
  totalFiles,
  search,
  setSearch,
}: {
  files: { path: string; lines: number; bytes: number; category: string }[];
  totalFiles: number;
  search: string;
  setSearch: (v: string) => void;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset pagination when the filter changes.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [search]);

  // Progressive rendering — auto-load next page when sentinel is in view.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible((v) => Math.min(v + PAGE_SIZE, files.length));
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [files.length]);

  const shown = files.slice(0, visible);
  const hasMore = visible < files.length;

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex-1">
          Contenu inclus ({shown.length} affichés / {files.length} filtrés ·{" "}
          {totalFiles} au total)
        </p>
        <div className="relative w-56">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un fichier…"
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>
      <div className="max-h-[55vh] overflow-y-auto divide-y divide-border/20">
        {shown.map((f) => {
          const ext = f.path.split(".").pop();
          const extColor =
            ext === "tsx"
              ? "text-primary"
              : ext === "ts"
                ? "text-emerald-500"
                : ext === "sql"
                  ? "text-orange-500"
                  : ext === "css"
                    ? "text-violet-500"
                    : ext === "json"
                      ? "text-yellow-600"
                      : ext === "toml"
                        ? "text-pink-500"
                        : ext === "html"
                          ? "text-orange-500"
                          : "text-muted-foreground";
          return (
            <div
              key={f.path}
              className="flex items-center gap-3 px-5 py-2 hover:bg-secondary/20 transition-colors"
            >
              <FileCode className={"w-4 h-4 flex-shrink-0 " + extColor} />
              <span className="text-sm font-mono text-foreground flex-1 truncate">
                {f.path.replace(/^\//, "")}
              </span>
              <span className="hidden md:inline text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex-shrink-0">
                {f.category}
              </span>
              <span className="text-xs text-muted-foreground flex-shrink-0 tabular-nums w-14 text-right">
                {f.lines} l.
              </span>
            </div>
          );
        })}
        {!files.length && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Aucun fichier ne correspond à votre recherche.
          </div>
        )}
        {hasMore && (
          <>
            <div ref={sentinelRef} className="h-1" aria-hidden />
            <div className="p-3 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setVisible((v) => Math.min(v + PAGE_SIZE, files.length))
                }
                className="text-xs gap-1"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                Charger {Math.min(PAGE_SIZE, files.length - visible)} de plus
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
