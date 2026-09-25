import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  ExternalLink,
  Loader2,
  AlertCircle,
  Globe,
  BadgeCheck,
  ShoppingBag,
  Tag,
  Briefcase,
  Calendar,
} from "lucide-react";
import { firestoreDB as supabase } from "@/lib/db";
import SocialIcon, {
  getPlatformColor,
  getPlatformLabel,
  PLATFORM_COLORS,
} from "@/components/SocialIcon";
import type { Tables } from "@/lib/types";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { StorePaymentModal } from "@/components/StorePaymentModal";

type ProfileLink = Tables<"profile_links">;
type Profile = Tables<"profiles"> & {
  cover_url?: string | null;
  is_verified?: boolean | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

function extractSpotifyData(url: string): { type: string; id: string } | null {
  const match = url.match(
    /spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/,
  );
  return match ? { type: match[1], id: match[2] } : null;
}

function extractTikTokId(url: string): string | null {
  const match = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  return match ? match[1] : null;
}

function getLinkDisplayType(link: ProfileLink): string {
  const platform = link.icon || "website";
  if (platform === "youtube" || extractYouTubeId(link.url)) return "youtube";
  if (platform === "spotify" || link.url.includes("spotify.com"))
    return "spotify";
  if (platform === "tiktok" || link.url.includes("tiktok.com")) return "tiktok";
  return "standard";
}

async function incrementClick(linkId: string) {
  try {
    const { data } = await supabase
      .from("profile_links")
      .select("click_count")
      .eq("id", linkId)
      .single();
    if (data)
      await supabase
        .from("profile_links")
        .update({ click_count: (data.click_count || 0) + 1 })
        .eq("id", linkId);
  } catch (_) {
    /* silent */
  }
}

// ─── Rich Link Blocks ─────────────────────────────────────────────────────────

function YouTubeBlock({ link }: { link: ProfileLink }) {
  const videoId = extractYouTubeId(link.url);
  const [expanded, setExpanded] = useState(false);
  if (!videoId) return <StandardLinkBlock link={link} />;

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-border/50 bg-card">
      {expanded ? (
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title={link.title}
          />
        </div>
      ) : (
        <button
          className="relative w-full aspect-video group cursor-pointer block"
          onClick={() => setExpanded(true)}
        >
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={link.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <div className="w-0 h-0 border-t-[12px] border-b-[12px] border-l-[20px] border-t-transparent border-b-transparent border-l-white ml-1.5" />
            </div>
          </div>
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            ▶ YouTube
          </div>
        </button>
      )}
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <SocialIcon platform="youtube" size={18} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {link.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {link.click_count} vues
            </p>
          </div>
        </div>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground"
          onClick={() => incrementClick(link.id)}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

function SpotifyBlock({ link }: { link: ProfileLink }) {
  const spotifyData = extractSpotifyData(link.url);
  if (!spotifyData) return <StandardLinkBlock link={link} />;
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-border/50 bg-card">
      <iframe
        src={`https://open.spotify.com/embed/${spotifyData.type}/${spotifyData.id}?utm_source=generator&theme=0`}
        width="100%"
        height="152"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="block"
        title={link.title}
      />
      <div className="px-3 pb-3 pt-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SocialIcon platform="spotify" size={18} />
          <p className="text-sm font-semibold text-foreground">{link.title}</p>
        </div>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          onClick={() => incrementClick(link.id)}
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

function TikTokBlock({ link }: { link: ProfileLink }) {
  const videoId = extractTikTokId(link.url);
  if (!videoId) return <StandardLinkBlock link={link} />;
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-border/50 bg-card">
      <div className="flex justify-center bg-black/5 py-2">
        <iframe
          src={`https://www.tiktok.com/embed/v2/${videoId}`}
          className="w-full max-w-sm"
          height="580"
          allow="encrypted-media"
          loading="lazy"
          title={link.title}
        />
      </div>
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SocialIcon platform="tiktok" size={18} />
          <p className="text-sm font-semibold text-foreground">{link.title}</p>
        </div>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          onClick={() => incrementClick(link.id)}
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

function StandardLinkBlock({ link }: { link: ProfileLink }) {
  const platform = link.icon || "website";
  const color = getPlatformColor(platform);
  const label = getPlatformLabel(platform);
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => incrementClick(link.id)}
      className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}18` }}
      >
        <SocialIcon platform={platform} size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {link.title}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <ExternalLink className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0" />
    </a>
  );
}

// ─── Page Block Components ────────────────────────────────────────────────────

function SocialIconsBlock({ content }: { content: Record<string, unknown> }) {
  const networks = [
    "facebook",
    "instagram",
    "twitter",
    "tiktok",
    "youtube",
    "linkedin",
    "whatsapp",
    "snapchat",
    "discord",
    "telegram",
    "pinterest",
    "github",
  ];
  const filled = networks.filter((n) => content[n]);
  if (filled.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-3 py-2">
      {filled.map((n) => (
        <a
          key={n}
          href={content[n] as string}
          target="_blank"
          rel="noopener noreferrer"
          className="w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
          style={{
            backgroundColor: `${(PLATFORM_COLORS as Record<string, string>)[n] || "#999"}18`,
          }}
        >
          <SocialIcon platform={n} size={22} />
        </a>
      ))}
    </div>
  );
}

function ContactFormBlock({
  block,
  profilePlan,
}: {
  block: PageBlock;
  profilePlan?: string;
}) {
  const includeMessage =
    ((block.content as Record<string, unknown>)?.includeMessage as boolean) ??
    true;
  const isFree = profilePlan === "free";
  // Free plan: only name + email. Premium: name + email + message
  const showMessage = includeMessage && !isFree;

  const [form, setForm] = useState({ full_name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const c = block.content as Record<string, unknown>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await supabase.from("form_submissions").insert({
        profile_id: block.profile_id,
        block_id: block.id,
        full_name: form.full_name,
        email: form.email,
        message: showMessage ? form.message : null,
      });
      setSubmitted(true);
    } catch {
      /* silent */
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="bg-card rounded-2xl border border-border/50 p-6 text-center">
        <span className="text-4xl">✅</span>
        <p className="font-dm font-semibold text-foreground mt-3">
          {(c.successMessage as string) || "Merci pour votre message !"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-5">
      <p className="font-dm font-semibold text-base text-foreground mb-4">
        {(c.formTitle as string) || block.title || "Contactez-moi"}
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          required
          placeholder="Nom complet"
          value={form.full_name}
          onChange={(e) =>
            setForm((f) => ({ ...f, full_name: e.target.value }))
          }
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        {showMessage && (
          <textarea
            rows={3}
            placeholder="Message (optionnel)"
            value={form.message}
            onChange={(e) =>
              setForm((f) => ({ ...f, message: e.target.value }))
            }
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
          />
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 gradient-cta text-primary-foreground rounded-xl font-semibold text-sm transition-opacity disabled:opacity-70"
        >
          {submitting ? "Envoi en cours..." : "Envoyer le message"}
        </button>
      </form>
    </div>
  );
}

interface PageBlock {
  id: string;
  type: string;
  title: string | null;
  content: Record<string, unknown>;
  position: number;
  is_active: boolean;
  profile_id: string;
}

function PageBlockRenderer({
  block,
  profilePlan,
  onBuy,
}: {
  block: PageBlock;
  profilePlan?: string;
  onBuy?: (item: any) => void;
}) {
  if (!block.is_active) return null;
  const c = block.content;

  switch (block.type) {
    case "heading":
      return (
        <div className="text-center py-2">
          {c.text && (
            <p className="font-dm font-bold text-xl text-foreground">
              {c.text as string}
            </p>
          )}
          {c.subtitle && (
            <p className="text-sm text-muted-foreground mt-1">
              {c.subtitle as string}
            </p>
          )}
        </div>
      );

    case "social_icons":
      return <SocialIconsBlock content={c} />;

    case "divider": {
      const style = (c.style as string) || "solid";
      return (
        <div
          className={`my-1 border-t border-border/40 ${style === "dashed" ? "border-dashed" : style === "dotted" ? "border-dotted" : ""}`}
        />
      );
    }

    case "text":
      return (
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          {block.title && (
            <p className="font-dm font-semibold text-sm text-foreground mb-2">
              {block.title}
            </p>
          )}
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {c.text as string}
          </p>
        </div>
      );

    case "form":
      return <ContactFormBlock block={block} profilePlan={profilePlan} />;

    case "video": {
      const url = c.url as string;
      if (!url) return null;
      const fakeLink = {
        id: block.id,
        url,
        title: block.title || "Vidéo",
        icon: "youtube",
        click_count: 0,
      } as ProfileLink;
      const ytId = extractYouTubeId(url);
      if (ytId) return <YouTubeBlock link={fakeLink} />;
      const tkId = extractTikTokId(url);
      if (tkId) return <TikTokBlock link={fakeLink} />;
      return null;
    }

    case "music": {
      const url = c.url as string;
      if (!url) return null;
      const fakeLink = {
        id: block.id,
        url,
        title: block.title || "Musique",
        icon: "spotify",
        click_count: 0,
      } as ProfileLink;
      const spData = extractSpotifyData(url);
      if (spData) return <SpotifyBlock link={fakeLink} />;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card hover:shadow-card hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#1DB95418" }}
          >
            <SocialIcon platform="spotify" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {block.title || "Écouter"}
            </p>
            <p className="text-xs text-muted-foreground">Musique</p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground/50" />
        </a>
      );
    }

    case "podcast": {
      const url = c.url as string;
      if (!url) return null;
      const spData = extractSpotifyData(url);
      if (spData) {
        const fakeLink = {
          id: block.id,
          url,
          title: block.title || "Podcast",
          icon: "spotify",
          click_count: 0,
        } as ProfileLink;
        return <SpotifyBlock link={fakeLink} />;
      }
      return null;
    }

    case "group": {
      const links = (c.links as Array<{ title: string; url: string }>) || [];
      const description = c.description as string;
      if (links.length === 0) return null;
      return (
        <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
          {block.title && (
            <p className="font-dm font-semibold text-base text-foreground">
              {block.title}
            </p>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <div className="space-y-2">
            {links.map((link, i) =>
              link.url ? (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-background hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {link.title || link.url}
                    </p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0" />
                </a>
              ) : null,
            )}
          </div>
        </div>
      );
    }

    case "tiktok": {
      const url = c.url as string;
      if (!url) return null;
      const tkId = extractTikTokId(url);
      if (!tkId) return null;
      const fakeLink = {
        id: block.id,
        url,
        title: block.title || "TikTok",
        icon: "tiktok",
        click_count: 0,
      } as ProfileLink;
      return <TikTokBlock link={fakeLink} />;
    }

    case "instagram": {
      const url = c.url as string;
      if (!url) return null;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card hover:shadow-card hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#E4405F18" }}
          >
            <SocialIcon platform="instagram" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {block.title || "Instagram"}
            </p>
            <p className="text-xs text-muted-foreground">Instagram</p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground/50" />
        </a>
      );
    }

    case "youtube_sub": {
      const channelId = c.channelId as string;
      const channelUrl = c.url as string;
      return (
        <a
          href={channelUrl || `https://youtube.com/channel/${channelId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card hover:shadow-card hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#FF000018" }}
          >
            <SocialIcon platform="youtube" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {block.title || "S'abonner"}
            </p>
            <p className="text-xs text-muted-foreground">YouTube</p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground/50" />
        </a>
      );
    }

    case "social_embed": {
      const url = c.url as string;
      if (!url) return null;
      // Detect platform and render embed
      if (
        url.includes("instagram.com/p/") ||
        url.includes("instagram.com/reel/")
      ) {
        const match = url.match(/instagram\.com\/(p|reel)\/([A-Za-z0-9_-]+)/);
        if (match) {
          return (
            <div className="rounded-2xl overflow-hidden border border-border/50 bg-card">
              <iframe
                src={`https://www.instagram.com/${match[1]}/${match[2]}/embed/`}
                width="100%"
                height="480"
                frameBorder="0"
                scrolling="no"
                allowTransparency
                loading="lazy"
                className="block"
                title={block.title || "Instagram"}
              />
              {block.title && (
                <p className="px-4 py-2 text-sm font-semibold text-foreground">
                  {block.title}
                </p>
              )}
            </div>
          );
        }
      }
      if (url.includes("twitter.com/") || url.includes("x.com/")) {
        return (
          <div className="rounded-2xl overflow-hidden border border-border/50 bg-card p-4">
            <blockquote className="twitter-tweet" data-dnt="true">
              <a href={url}>{block.title || "Tweet"}</a>
            </blockquote>
            <script async src="https://platform.twitter.com/widgets.js" />
            {block.title && (
              <p className="text-sm font-semibold text-foreground mt-2">
                {block.title}
              </p>
            )}
          </div>
        );
      }
      if (url.includes("tiktok.com/") && url.includes("/video/")) {
        const tkId = extractTikTokId(url);
        if (tkId) {
          const fakeLink = {
            id: block.id,
            url,
            title: block.title || "TikTok",
            icon: "tiktok",
            click_count: 0,
          } as ProfileLink;
          return <TikTokBlock link={fakeLink} />;
        }
      }
      if (url.includes("facebook.com/")) {
        return (
          <div className="rounded-2xl overflow-hidden border border-border/50 bg-card">
            <iframe
              src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500`}
              width="100%"
              height="400"
              style={{ border: "none", overflow: "hidden" }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              title={block.title || "Facebook"}
            />
            {block.title && (
              <p className="px-4 py-2 text-sm font-semibold text-foreground">
                {block.title}
              </p>
            )}
          </div>
        );
      }
      // Fallback - just show a link
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card hover:shadow-card hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-pink-100 dark:bg-pink-500/20">
            <SocialIcon platform="instagram" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {block.title || "Publication"}
            </p>
            <p className="text-xs text-muted-foreground">Publication sociale</p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground/50" />
        </a>
      );
    }

    case "shop_item": {
      const c = block.content as Record<string, unknown>;
      const itemType = (c.item_type as string) || "article";
      const price = (c.price as number) || 0;
      const clientPrice = Math.round(price * 1.07);
      const TypeIcon =
        itemType === "service"
          ? Briefcase
          : itemType === "appointment"
            ? Calendar
            : Tag;
      const typeLabel =
        itemType === "service"
          ? "Service"
          : itemType === "appointment"
            ? "Rendez-vous"
            : "Article";
      const ctaLabel = itemType === "appointment" ? "Réserver" : "Acheter";
      return (
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          {c.image_url ? (
            <img
              src={c.image_url as string}
              alt=""
              className="w-full h-40 object-cover"
              onError={(e) =>
                ((e.target as HTMLImageElement).style.display = "none")
              }
            />
          ) : null}
          <div className="p-4 space-y-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              <TypeIcon className="w-3 h-3" /> {typeLabel}
            </span>
            {c.header_text ? (
              <p className="text-xs font-medium text-muted-foreground">
                {c.header_text as string}
              </p>
            ) : null}
            <h4 className="font-dm font-bold text-foreground">
              {(c.name as string) || block.title || "Article"}
            </h4>
            {c.description ? (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {c.description as string}
              </p>
            ) : null}
            <div className="flex items-center justify-between pt-1">
              <p className="text-xl font-bold text-primary">
                {clientPrice.toLocaleString("fr-FR")} XAF
              </p>
              <button
                onClick={() =>
                  onBuy?.({
                    id: c.store_item_id || block.id,
                    name: (c.name as string) || "Article",
                    description: (c.description as string) || null,
                    price,
                    currency: "XAF",
                    image_url: (c.image_url as string) || null,
                    item_type: itemType,
                    redirect_url: (c.redirect_url as string) || null,
                    seller_name: (c.seller_name as string) || null,
                    seller_phone: (c.seller_phone as string) || null,
                    seller_email: (c.seller_email as string) || null,
                    header_text: (c.header_text as string) || null,
                  })
                }
                className="px-4 py-2 gradient-cta text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
              >
                {ctaLabel}
              </button>
            </div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

// ─── Font mapping ─────────────────────────────────────────────────────────────

const FONT_MAP: Record<string, string> = {
  inter: "'Inter', sans-serif",
  "dm-sans": "'DM Sans', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  playfair: "'Playfair Display', serif",
  poppins: "'Poppins', sans-serif",
  "space-grotesk": "'Space Grotesk', sans-serif",
  cabinet: "'Cabinet Grotesk', 'DM Sans', sans-serif",
  lora: "'Lora', serif",
  satoshi: "'Satoshi', 'DM Sans', sans-serif",
};

const BUTTON_STYLES: Record<string, string> = {
  rounded: "rounded-2xl",
  pill: "rounded-full",
  square: "rounded-lg",
  outline: "rounded-2xl border-2 bg-transparent",
  shadow: "rounded-2xl shadow-lg",
};

// ─── Main Public Profile ──────────────────────────────────────────────────────

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedBlockItem, setSelectedBlockItem] = useState<any | null>(null);

  useEffect(() => {
    if (!username) return;
    let profileId: string | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const loadData = async (pid: string) => {
      const [linksRes, blocksRes, storeRes] = await Promise.all([
        supabase
          .from("profile_links")
          .select("*")
          .eq("profile_id", pid)
          .eq("is_active", true)
          .order("position"),
        supabase
          .from("page_blocks")
          .select("*")
          .eq("profile_id", pid)
          .eq("is_active", true)
          .order("position"),
        supabase
          .from("store_items")
          .select("*")
          .eq("profile_id", pid)
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
      ]);
      setLinks(linksRes.data || []);
      setBlocks(
        (blocksRes.data || []).map((b) => ({
          ...b,
          profile_id: pid,
          content: (b.content as Record<string, unknown>) || {},
        })),
      );
      setStoreItems(storeRes.data || []);
    };

    const loadProfile = async () => {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();
      if (error || !profileData) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setProfile(profileData as Profile);
      profileId = profileData.id;
      await loadData(profileId);
      setLoading(false);

      // Realtime subscriptions for instant updates
      channel = supabase
        .channel(`public_profile_${profileId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "page_blocks",
            filter: `profile_id=eq.${profileId}`,
          },
          () => {
            if (profileId) loadData(profileId);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "profile_links",
            filter: `profile_id=eq.${profileId}`,
          },
          () => {
            if (profileId) loadData(profileId);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${profileId}`,
          },
          (payload) => {
            if (payload.new) setProfile(payload.new as Profile);
          },
        )
        .subscribe();
    };
    loadProfile();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [username]);

  // Record page view
  useEffect(() => {
    if (!profile) return;
    const device = /Mobi|Android/i.test(navigator.userAgent)
      ? "mobile"
      : "desktop";
    supabase
      .from("page_views")
      .insert({
        profile_id: profile.id,
        device,
        referrer: document.referrer || null,
      })
      .then(() => {});
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    const scripts: HTMLScriptElement[] = [];
    const addScript = (id: string, src?: string, inline?: string) => {
      if (document.getElementById(id)) return;
      const s = document.createElement("script");
      s.id = id;
      s.async = true;
      if (src) s.src = src;
      if (inline) s.textContent = inline;
      document.head.appendChild(s);
      scripts.push(s);
    };

    // Google Analytics
    if (profile.google_analytics_id) {
      addScript(
        "ga-loader",
        `https://www.googletagmanager.com/gtag/js?id=${profile.google_analytics_id}`,
      );
      addScript(
        "ga-config",
        undefined,
        `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${profile.google_analytics_id}');`,
      );
    }

    // Facebook Pixel
    if (profile.facebook_pixel_id) {
      addScript(
        "fb-pixel",
        undefined,
        `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${profile.facebook_pixel_id}');fbq('track','PageView');`,
      );
    }

    // TikTok Pixel
    if (profile.tiktok_pixel_id) {
      addScript(
        "tt-pixel",
        undefined,
        `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${profile.tiktok_pixel_id}');ttq.page();}(window,document,'ttq');`,
      );
    }

    // Snapchat Pixel
    if (profile.snapchat_pixel_id) {
      addScript(
        "snap-pixel",
        undefined,
        `(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script';r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u);})(window,document,'https://sc-static.net/scevent.min.js');snaptr('init','${profile.snapchat_pixel_id}',{});snaptr('track','PAGE_VIEW');`,
      );
    }

    // Pinterest Tag
    if (profile.pinterest_tag_id) {
      addScript(
        "pin-tag",
        undefined,
        `!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");pintrk('load','${profile.pinterest_tag_id}');pintrk('page');`,
      );
    }

    // LinkedIn Insight Tag
    if (profile.linkedin_insight_tag) {
      addScript(
        "li-insight",
        undefined,
        `_linkedin_partner_id="${profile.linkedin_insight_tag}";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s);})(window.lintrk);`,
      );
    }

    return () => {
      scripts.forEach((s) => s.remove());
    };
  }, [profile]);

  // Heatmap click tracking
  useEffect(() => {
    if (!profile) return;
    const handleClick = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / document.documentElement.scrollHeight) * 100;
      const target = e.target as HTMLElement;
      const elementType = target.tagName.toLowerCase();
      const elementId =
        target.closest("[data-link-id]")?.getAttribute("data-link-id") ||
        target.id ||
        undefined;
      supabase
        .from("click_heatmap")
        .insert({
          profile_id: profile.id,
          element_type: elementType,
          element_id: elementId,
          x_percent: Math.round(x * 100) / 100,
          y_percent: Math.round(y * 100) / 100,
          viewport_width: window.innerWidth,
          viewport_height: window.innerHeight,
        })
        .then(() => {});
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [profile]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  if (notFound || !profile)
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
          <h1 className="font-dm font-bold text-2xl text-foreground">
            Profil introuvable
          </h1>
          <p className="text-muted-foreground">
            Le profil <strong>@{username}</strong> n'existe pas ou a été
            supprimé.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            ← Retour à AvyLink
          </a>
        </div>
      </div>
    );

  const fontFamily = FONT_MAP[profile.font_style] || FONT_MAP.inter;
  const avatarPos = profile.avatar_position || "center";
  const btnClass = BUTTON_STYLES[profile.button_style] || BUTTON_STYLES.rounded;
  const bgColor = profile.background_color || undefined;
  const bgImage = (profile as any).background_image_url as string | undefined;
  const isOutline = profile.button_style === "outline";

  const bgStyle: React.CSSProperties = {
    fontFamily,
    ...(bgImage
      ? {
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }
      : { background: bgColor || undefined }),
  };

  return (
    <div className="min-h-screen" style={bgStyle}>
      <div
        className={`min-h-screen ${bgImage ? "bg-black/20 backdrop-blur-[1px]" : !bgColor ? "bg-gradient-to-br from-background via-secondary/30 to-background" : ""}`}
      >
        <div className="max-w-lg mx-auto pb-12">
          {/* ── Cover + Avatar header ── */}
          <div className="relative mb-6">
            <div className="h-44 w-full bg-gradient-to-br from-primary/30 to-primary/10 overflow-hidden">
              {profile.cover_url ? (
                <img
                  src={profile.cover_url}
                  alt="Couverture"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/30" />
              )}
            </div>

            {/* Avatar — positioned based on avatar_position */}
            <div className="px-5">
              <div
                className={`flex items-end -mt-10 mb-3 ${
                  avatarPos === "center"
                    ? "justify-center"
                    : avatarPos === "right"
                      ? "justify-end"
                      : "justify-between"
                }`}
              >
                <div className="relative">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name || ""}
                      className="w-20 h-20 rounded-full object-cover border-4 border-background shadow-blue"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold border-4 border-background shadow-blue">
                      {(profile.display_name ||
                        profile.username ||
                        "?")[0].toUpperCase()}
                    </div>
                  )}
                  {profile.is_verified && (
                    <span className="absolute -bottom-0.5 -right-0.5">
                      <VerifiedBadge
                        style={(profile as any).verified_badge_style}
                        size="md"
                      />
                    </span>
                  )}
                </div>
                {avatarPos !== "center" && profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-medium text-foreground hover:border-primary/40 transition-colors mb-1"
                  >
                    <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="truncate max-w-[100px]">
                      {profile.website.replace(/^https?:\/\//, "")}
                    </span>
                  </a>
                )}
              </div>

              {avatarPos === "center" && profile.website && (
                <div className="flex justify-center mb-2">
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-medium text-foreground hover:border-primary/40 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="truncate max-w-[100px]">
                      {profile.website.replace(/^https?:\/\//, "")}
                    </span>
                  </a>
                </div>
              )}

              <div
                className={`flex items-center gap-2 flex-wrap ${avatarPos === "center" ? "justify-center" : avatarPos === "right" ? "justify-end" : ""}`}
              >
                <h1 className="font-bold text-2xl text-foreground leading-tight">
                  {profile.display_name || `@${profile.username}`}
                </h1>
              </div>
              {profile.username && (
                <p
                  className={`text-sm text-muted-foreground ${avatarPos === "center" ? "text-center" : avatarPos === "right" ? "text-right" : ""}`}
                >
                  @{profile.username}
                </p>
              )}
              {profile.bio && (
                <p
                  className={`text-sm text-foreground/70 mt-2 leading-relaxed ${avatarPos === "center" ? "text-center" : avatarPos === "right" ? "text-right" : ""}`}
                >
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* ── Content area ── */}
          <div className="px-4 space-y-3">
            {/* Page Blocks */}
            {blocks.map((block) => (
              <PageBlockRenderer
                key={block.id}
                block={block}
                profilePlan={profile.plan}
                onBuy={setSelectedBlockItem}
              />
            ))}

            {/* Links — apply button_style */}
            {links.map((link) => {
              const displayType = getLinkDisplayType(link);
              if (displayType === "youtube")
                return <YouTubeBlock key={link.id} link={link} />;
              if (displayType === "spotify")
                return <SpotifyBlock key={link.id} link={link} />;
              if (displayType === "tiktok")
                return <TikTokBlock key={link.id} link={link} />;
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => incrementClick(link.id)}
                  className={`flex items-center gap-4 p-4 border border-border/50 bg-card hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group ${btnClass} ${isOutline ? "border-foreground/20 hover:border-primary" : ""}`}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${getPlatformColor(link.icon || "website")}18`,
                    }}
                  >
                    <SocialIcon platform={link.icon || "website"} size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {link.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getPlatformLabel(link.icon || "website")}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0" />
                </a>
              );
            })}

            {blocks.length === 0 &&
              links.length === 0 &&
              storeItems.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Aucun lien pour l'instant.</p>
                </div>
              )}

            {/* Store Items */}
            {storeItems.length > 0 &&
              (profile.plan === "premium" || profile.plan === "business") && (
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-2 px-1">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    <h3 className="font-dm font-bold text-base text-foreground">
                      Boutique
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {storeItems.map((item) => {
                      const clientPrice = Math.round(item.price * 1.07);
                      const typeIcon =
                        item.item_type === "service" ? (
                          <Briefcase className="w-3 h-3" />
                        ) : item.item_type === "appointment" ? (
                          <Calendar className="w-3 h-3" />
                        ) : (
                          <Tag className="w-3 h-3" />
                        );
                      const typeLabel =
                        item.item_type === "service"
                          ? "Service"
                          : item.item_type === "appointment"
                            ? "Rendez-vous"
                            : "Article";
                      return (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-border/50 bg-card overflow-hidden"
                        >
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-40 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          )}
                          <div className="p-4 space-y-2">
                            <div className="flex items-center gap-1.5">
                              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                {typeIcon} {typeLabel}
                              </span>
                            </div>
                            {item.header_text && (
                              <p className="text-xs font-medium text-muted-foreground">
                                {item.header_text}
                              </p>
                            )}
                            <h4 className="font-dm font-bold text-foreground">
                              {item.name}
                            </h4>
                            {item.description && (
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between pt-2">
                              <p className="text-xl font-bold text-primary">
                                {clientPrice.toLocaleString("fr-FR")}{" "}
                                {item.currency}
                              </p>
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="px-4 py-2 gradient-cta text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                              >
                                {item.item_type === "appointment"
                                  ? "Réserver"
                                  : "Acheter"}
                              </button>
                            </div>
                            {item.stock !== null &&
                              item.stock <= 5 &&
                              item.stock > 0 && (
                                <p className="text-[11px] text-amber-600 font-medium">
                                  ⚡ Plus que {item.stock} en stock
                                </p>
                              )}
                            {item.stock !== null && item.stock <= 0 && (
                              <p className="text-[11px] text-red-500 font-medium">
                                Rupture de stock
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>

          {/* Store Payment Modal */}
          {selectedItem && profile && (
            <StorePaymentModal
              open={!!selectedItem}
              onClose={() => setSelectedItem(null)}
              item={{ ...selectedItem, profile_id: profile.id }}
              sellerProfileId={profile.id}
            />
          )}

          {/* Shop Block Item Payment Modal */}
          {selectedBlockItem && profile && (
            <StorePaymentModal
              open={!!selectedBlockItem}
              onClose={() => setSelectedBlockItem(null)}
              item={{ ...selectedBlockItem, profile_id: profile.id }}
              sellerProfileId={profile.id}
            />
          )}

          {/* Footer branding */}
          {!(profile as any)?.hide_branding && (
            <div className="mt-10 text-center">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Créé avec
                <img
                  src="/icon-192.jpg"
                  alt="AvyLink"
                  className="w-4 h-4 rounded object-cover"
                />
                <span className="font-bold">AvyLink</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
