import { firestoreDB as supabase } from "@/lib/db";

export interface LinkMetadata {
  success: boolean;
  url: string;
  platform: string;
  contentType: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
  favicon: string;
  embed: {
    videoId?: string;
    embedUrl?: string;
    thumbnailUrl?: string;
    spotifyType?: string;
    spotifyId?: string;
  };
  error?: string;
}

export async function extractMetadata(url: string): Promise<LinkMetadata> {
  const { data, error } = await supabase.functions.invoke("extract-metadata", {
    body: { url },
  });

  if (error) {
    throw new Error(error.message || "Erreur lors de l'extraction");
  }

  return data as LinkMetadata;
}

export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    youtube: "📺",
    spotify: "🎵",
    tiktok: "🎬",
    instagram: "📸",
    twitter: "🐦",
    linkedin: "💼",
    soundcloud: "🎧",
    vimeo: "🎥",
    twitch: "🎮",
    website: "🌐",
  };
  return icons[platform] || "🔗";
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    youtube: "#FF0000",
    spotify: "#1DB954",
    tiktok: "#010101",
    instagram: "#E1306C",
    twitter: "#1DA1F2",
    linkedin: "#0077B5",
    soundcloud: "#FF5500",
    vimeo: "#1AB7EA",
    twitch: "#9146FF",
    website: "#0EAAF0",
  };
  return colors[platform] || "#0EAAF0";
}

export function getPlatformLabel(platform: string): string {
  const labels: Record<string, string> = {
    youtube: "YouTube",
    spotify: "Spotify",
    tiktok: "TikTok",
    instagram: "Instagram",
    twitter: "Twitter / X",
    linkedin: "LinkedIn",
    soundcloud: "SoundCloud",
    vimeo: "Vimeo",
    twitch: "Twitch",
    website: "Site Web",
  };
  return labels[platform] || "Lien";
}
