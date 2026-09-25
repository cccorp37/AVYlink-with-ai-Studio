import { useState } from "react";
import {
  Crown,
  Search,
  Check,
  Loader2,
  Sparkles,
  X,
  Eye,
  Smartphone,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { firestoreDB as supabase } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import SocialIcon from "@/components/SocialIcon";
import type { Tables } from "@/lib/types";

type Profile = Tables<"profiles">;
interface Props {
  profile: Profile | null;
  onUpdate?: (updates: Partial<Profile>) => Promise<void>;
}

const CATEGORIES = [
  "Tous",
  "Carte de visite",
  "Créatif",
  "Boutique",
  "Animation",
  "Festival",
  "Minimaliste",
  "Néon",
  "Pastel",
];

export interface TemplateDef {
  id: string;
  name: string;
  category: string;
  isPro: boolean;
  theme: string;
  button_style: string;
  font_style: string;
  background_color: string;
  preview: {
    coverBg: string;
    coverOverlay?: string;
    cardBg: string;
    textColor: string;
    subtitleColor: string;
    avatarInitial: string;
    avatarBg: string;
    displayName: string;
    subtitle: string;
    badge?: string;
    bio?: string;
    socials?: string[];
    buttons: {
      label: string;
      bg: string;
      textColor: string;
      border?: string;
      icon?: string;
    }[];
    accentColor: string;
    extraBlock?: {
      type: "spotify" | "video" | "form" | "divider" | "image-grid";
      data?: Record<string, string>;
    };
  };
}

export const TEMPLATES: TemplateDef[] = [
  // ===== CARTE DE VISITE =====
  {
    id: "biz-navy",
    name: "Business Navy",
    category: "Carte de visite",
    isPro: false,
    theme: "dark",
    button_style: "rounded",
    font_style: "inter",
    background_color: "#0f172a",
    preview: {
      coverBg: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
      cardBg: "#ffffff",
      textColor: "#0f172a",
      subtitleColor: "#64748b",
      avatarInitial: "M",
      avatarBg: "linear-gradient(135deg, #0ea5e9, #2563eb)",
      displayName: "Marc Dupont",
      subtitle: "A Division of Nationwide Corp",
      badge: "Senior Consultant",
      bio: "Every client referred is monitored and managed from start to finish.",
      socials: ["facebook", "instagram", "youtube", "tiktok"],
      buttons: [
        {
          label: "Send Email",
          bg: "#ffffff",
          textColor: "#0f172a",
          border: "1.5px solid #e2e8f0",
          icon: "✉️",
        },
        { label: "Add to Contacts", bg: "#0f172a", textColor: "#ffffff" },
      ],
      accentColor: "#0ea5e9",
    },
  },
  {
    id: "biz-ocean",
    name: "Océan Classique",
    category: "Carte de visite",
    isPro: false,
    theme: "ocean",
    button_style: "pill",
    font_style: "inter",
    background_color: "#1e3a5f",
    preview: {
      coverBg: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #7dd3fc 100%)",
      cardBg: "#f0f9ff",
      textColor: "#0c4a6e",
      subtitleColor: "#0369a1",
      avatarInitial: "V",
      avatarBg: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
      displayName: "Vincent van Gogh",
      subtitle: "Creative & Visionary",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      socials: ["facebook", "instagram", "twitter"],
      buttons: [
        {
          label: "Online Store",
          bg: "#ffffff",
          textColor: "#0c4a6e",
          border: "1px solid #bae6fd",
        },
        {
          label: "Youtube",
          bg: "#ffffff",
          textColor: "#0c4a6e",
          border: "1px solid #bae6fd",
        },
        {
          label: "About Us",
          bg: "#ffffff",
          textColor: "#0c4a6e",
          border: "1px solid #bae6fd",
        },
        {
          label: "Contact Us",
          bg: "#ffffff",
          textColor: "#0c4a6e",
          border: "1px solid #bae6fd",
        },
      ],
      accentColor: "#0ea5e9",
    },
  },
  {
    id: "biz-emerald",
    name: "Émeraude Pro",
    category: "Carte de visite",
    isPro: false,
    theme: "forest",
    button_style: "rounded",
    font_style: "dm",
    background_color: "#064e3b",
    preview: {
      coverBg: "linear-gradient(135deg, #064e3b 0%, #059669 100%)",
      cardBg: "#ecfdf5",
      textColor: "#064e3b",
      subtitleColor: "#047857",
      avatarInitial: "S",
      avatarBg: "linear-gradient(135deg, #34d399, #059669)",
      displayName: "Shamir Lobsang",
      subtitle: "Desarrollador de Negocios",
      badge: "Senior Engineer",
      bio: "A creative strategist, youthful innovator, and avid community builder.",
      socials: ["linkedin", "github", "twitter"],
      buttons: [
        {
          label: "✉️  support@email.com",
          bg: "#ecfdf5",
          textColor: "#064e3b",
          border: "1.5px solid #a7f3d0",
        },
        {
          label: "🌐  www.website.com",
          bg: "#ecfdf5",
          textColor: "#064e3b",
          border: "1.5px solid #a7f3d0",
        },
        { label: "Add to Contacts", bg: "#064e3b", textColor: "#ffffff" },
      ],
      accentColor: "#10b981",
    },
  },
  // ===== CRÉATIF =====
  {
    id: "artist-purple",
    name: "Artiste Violet",
    category: "Créatif",
    isPro: false,
    theme: "dark",
    button_style: "pill",
    font_style: "dm",
    background_color: "#7c3aed",
    preview: {
      coverBg: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)",
      cardBg: "#f3e8ff",
      textColor: "#4c1d95",
      subtitleColor: "#7c3aed",
      avatarInitial: "C",
      avatarBg: "linear-gradient(135deg, #a855f7, #7c3aed)",
      displayName: "Chris Cray",
      subtitle: "Founder/CEO, Recording Artist",
      badge: "Lead singer",
      bio: "Lyrics revolve around passion for life, confidence, clarity of purpose.",
      socials: ["spotify", "instagram", "tiktok"],
      buttons: [
        { label: "🎵 Don't Blame Me", bg: "#1DB954", textColor: "#fff" },
        {
          label: "✉️  support@email.com",
          bg: "#f3e8ff",
          textColor: "#7c3aed",
          border: "1px solid #c4b5fd",
        },
        { label: "Add to Contacts", bg: "#4c1d95", textColor: "#ffffff" },
      ],
      accentColor: "#a855f7",
      extraBlock: {
        type: "spotify",
        data: { track: "Don't Blame Me", artist: "Taylor Swift" },
      },
    },
  },
  {
    id: "creative-pink",
    name: "Inspiration Lab",
    category: "Créatif",
    isPro: false,
    theme: "rose",
    button_style: "pill",
    font_style: "dm",
    background_color: "#be185d",
    preview: {
      coverBg: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
      cardBg: "#ffffff",
      textColor: "#9d174d",
      subtitleColor: "#be185d",
      avatarInitial: "I",
      avatarBg: "linear-gradient(135deg, #f472b6, #ec4899)",
      displayName: "Inspiration Lab",
      subtitle: "Creativity & inspiration here",
      bio: "We provide a steady stream of creativity and inspiration.",
      buttons: [
        {
          label: "Online store",
          bg: "#ffffff",
          textColor: "#ec4899",
          border: "1px solid #fbcfe8",
        },
        {
          label: "About us",
          bg: "#ffffff",
          textColor: "#ec4899",
          border: "1px solid #fbcfe8",
        },
      ],
      accentColor: "#ec4899",
      extraBlock: { type: "form", data: { title: "Get on the list" } },
    },
  },
  {
    id: "creative-watercolor",
    name: "Aquarelle",
    category: "Créatif",
    isPro: true,
    theme: "rose",
    button_style: "pill",
    font_style: "dm",
    background_color: "#fce7f3",
    preview: {
      coverBg:
        "linear-gradient(135deg, #fce7f3 30%, #e0f2fe 70%, #fef3c7 100%)",
      cardBg: "#fffbeb",
      textColor: "#78350f",
      subtitleColor: "#92400e",
      avatarInitial: "E",
      avatarBg: "linear-gradient(135deg, #fbbf24, #f472b6)",
      displayName: "Emilia Chloe",
      subtitle: "Digital Artist & Illustrator",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      socials: ["facebook", "instagram", "twitter"],
      buttons: [
        {
          label: "Our Website",
          bg: "#ffffff",
          textColor: "#a855f7",
          border: "1px solid #e9d5ff",
        },
        {
          label: "About us",
          bg: "#ffffff",
          textColor: "#a855f7",
          border: "1px solid #e9d5ff",
        },
        {
          label: "Youtube",
          bg: "#ffffff",
          textColor: "#a855f7",
          border: "1px solid #e9d5ff",
        },
        {
          label: "Contact us",
          bg: "#ffffff",
          textColor: "#a855f7",
          border: "1px solid #e9d5ff",
        },
      ],
      accentColor: "#a855f7",
    },
  },
  // ===== BOUTIQUE =====
  {
    id: "shop-red",
    name: "Boutique Rouge",
    category: "Boutique",
    isPro: false,
    theme: "dark",
    button_style: "rounded",
    font_style: "inter",
    background_color: "#dc2626",
    preview: {
      coverBg: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
      cardBg: "#ffffff",
      textColor: "#1f2937",
      subtitleColor: "#6b7280",
      avatarInitial: "S",
      avatarBg: "linear-gradient(135deg, #f97316, #dc2626)",
      displayName: "Shopping Store",
      subtitle: "Divers produits disponibles",
      socials: ["whatsapp", "instagram", "tiktok"],
      buttons: [
        {
          label: "Lazada",
          bg: "#ffffff",
          textColor: "#dc2626",
          border: "2px solid #fecaca",
        },
        {
          label: "Shopee",
          bg: "#ffffff",
          textColor: "#dc2626",
          border: "2px solid #fecaca",
        },
        {
          label: "WhatsApp",
          bg: "#ffffff",
          textColor: "#25D366",
          border: "2px solid #bbf7d0",
        },
        {
          label: "Instagram",
          bg: "#ffffff",
          textColor: "#E1306C",
          border: "2px solid #fce7f3",
        },
        {
          label: "TikTok",
          bg: "#ffffff",
          textColor: "#010101",
          border: "2px solid #e5e7eb",
        },
      ],
      accentColor: "#dc2626",
    },
  },
  {
    id: "golden-shop",
    name: "Golden Leaf",
    category: "Boutique",
    isPro: true,
    theme: "sunset",
    button_style: "rounded",
    font_style: "inter",
    background_color: "#ec4899",
    preview: {
      coverBg: "linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #f9a8d4 100%)",
      cardBg: "linear-gradient(180deg, #ec4899 0%, #db2777 100%)",
      textColor: "#ffffff",
      subtitleColor: "#fce7f3",
      avatarInitial: "G",
      avatarBg: "linear-gradient(135deg, #fbbf24, #f59e0b)",
      displayName: "Golden Leaf Shop",
      subtitle: "Mineral based beauty products",
      socials: ["facebook", "instagram", "twitter"],
      buttons: [
        {
          label: "Online store",
          bg: "rgba(255,255,255,0.2)",
          textColor: "#fff",
        },
        { label: "Contact us", bg: "rgba(255,255,255,0.2)", textColor: "#fff" },
      ],
      accentColor: "#ec4899",
      extraBlock: { type: "video", data: { title: "Our store intro..." } },
    },
  },
  {
    id: "vm-store",
    name: "V&M Store",
    category: "Boutique",
    isPro: true,
    theme: "ocean",
    button_style: "rounded",
    font_style: "dm",
    background_color: "#0891b2",
    preview: {
      coverBg: "linear-gradient(135deg, #06b6d4 0%, #22d3ee 50%, #67e8f9 100%)",
      cardBg: "#ecfeff",
      textColor: "#164e63",
      subtitleColor: "#0891b2",
      avatarInitial: "V",
      avatarBg: "linear-gradient(135deg, #22d3ee, #06b6d4)",
      displayName: "V&M Store",
      subtitle: "Life as it should be. Design your clothes.",
      buttons: [
        { label: "Online Store", bg: "#0891b2", textColor: "#fff" },
        { label: "Contact Us", bg: "#0891b2", textColor: "#fff" },
      ],
      accentColor: "#06b6d4",
      extraBlock: { type: "image-grid" },
    },
  },
  {
    id: "shop-gold",
    name: "Shop Doré",
    category: "Boutique",
    isPro: false,
    theme: "sunset",
    button_style: "rounded",
    font_style: "inter",
    background_color: "#92400e",
    preview: {
      coverBg: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
      cardBg: "#fffbeb",
      textColor: "#78350f",
      subtitleColor: "#92400e",
      avatarInitial: "B",
      avatarBg: "linear-gradient(135deg, #fbbf24, #f59e0b)",
      displayName: "Boutique Dorée",
      subtitle: "Produits artisanaux de qualité",
      socials: ["facebook", "instagram", "whatsapp", "tiktok", "twitter"],
      buttons: [
        { label: "Shop All", bg: "#78350f", textColor: "#fff" },
        { label: "Our Craft", bg: "#78350f", textColor: "#fff" },
        {
          label: "Shopee",
          bg: "#ffffff",
          textColor: "#78350f",
          border: "2px solid #fde68a",
        },
        {
          label: "Lazada",
          bg: "#ffffff",
          textColor: "#78350f",
          border: "2px solid #fde68a",
        },
      ],
      accentColor: "#f59e0b",
    },
  },
  // ===== ANIMATION =====
  {
    id: "fashion-gradient",
    name: "Fashion Queen",
    category: "Animation",
    isPro: true,
    theme: "dark",
    button_style: "pill",
    font_style: "dm",
    background_color: "#6d28d9",
    preview: {
      coverBg: "linear-gradient(135deg, #7c3aed 0%, #c084fc 50%, #f0abfc 100%)",
      cardBg: "linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%)",
      textColor: "#ffffff",
      subtitleColor: "#e9d5ff",
      avatarInitial: "F",
      avatarBg: "linear-gradient(135deg, #f0abfc, #c084fc)",
      displayName: "Fashion Queen",
      subtitle: "Record the wonderful moments of your life",
      buttons: [
        {
          label: "▶️  Be the most beautiful",
          bg: "rgba(255,255,255,0.15)",
          textColor: "#fff",
        },
        { label: "Website", bg: "#ffffff", textColor: "#6d28d9" },
        { label: "Blog", bg: "#ffffff", textColor: "#6d28d9" },
      ],
      socials: ["facebook", "instagram", "tiktok"],
      accentColor: "#c084fc",
      extraBlock: {
        type: "video",
        data: { title: "Be the most beautiful..." },
      },
    },
  },
  {
    id: "pink-soft",
    name: "Sophia Rose",
    category: "Animation",
    isPro: true,
    theme: "rose",
    button_style: "pill",
    font_style: "dm",
    background_color: "#fce7f3",
    preview: {
      coverBg: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)",
      cardBg: "#ffffff",
      textColor: "#831843",
      subtitleColor: "#be185d",
      avatarInitial: "S",
      avatarBg: "linear-gradient(135deg, #f9a8d4, #ec4899)",
      displayName: "Sophia William",
      subtitle: "Record the wonderful moments, happy every day.",
      buttons: [
        {
          label: "Album",
          bg: "#ffffff",
          textColor: "#be185d",
          border: "1px solid #fbcfe8",
        },
        {
          label: "Facebook",
          bg: "#ffffff",
          textColor: "#be185d",
          border: "1px solid #fbcfe8",
        },
      ],
      accentColor: "#ec4899",
      extraBlock: { type: "video", data: { title: "About the view" } },
    },
  },
  // ===== FESTIVAL =====
  {
    id: "xmas-green",
    name: "Merry Christmas",
    category: "Festival",
    isPro: true,
    theme: "forest",
    button_style: "rounded",
    font_style: "inter",
    background_color: "#14532d",
    preview: {
      coverBg: "linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 50%, #dcfce7 100%)",
      cardBg: "#ffffff",
      textColor: "#14532d",
      subtitleColor: "#15803d",
      avatarInitial: "🎄",
      avatarBg: "linear-gradient(135deg, #22c55e, #15803d)",
      displayName: "Merry Christmas",
      subtitle: "Celebrate with us & enjoy exclusive deals!",
      socials: ["facebook", "twitter", "instagram", "youtube"],
      buttons: [
        { label: "🎵  Spotify", bg: "#1DB954", textColor: "#fff" },
        {
          label: "🎵  Apple Music",
          bg: "#ffffff",
          textColor: "#14532d",
          border: "2px solid #15803d",
        },
        {
          label: "🎵  Soundcloud",
          bg: "#ffffff",
          textColor: "#14532d",
          border: "2px solid #15803d",
        },
        {
          label: "🎵  Deezer",
          bg: "#ffffff",
          textColor: "#14532d",
          border: "2px solid #15803d",
        },
      ],
      accentColor: "#22c55e",
      extraBlock: { type: "video", data: { title: "Christmas Music" } },
    },
  },
  {
    id: "halloween-orange",
    name: "Halloween",
    category: "Festival",
    isPro: true,
    theme: "sunset",
    button_style: "rounded",
    font_style: "mono",
    background_color: "#78350f",
    preview: {
      coverBg: "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)",
      cardBg: "#fff7ed",
      textColor: "#78350f",
      subtitleColor: "#9a3412",
      avatarInitial: "🎃",
      avatarBg: "linear-gradient(135deg, #f97316, #ea580c)",
      displayName: "Happy Halloween",
      subtitle: "Best cost-effective beauty products.",
      socials: ["facebook", "instagram", "youtube", "tiktok"],
      buttons: [
        { label: "Naver Blog", bg: "#f97316", textColor: "#fff" },
        { label: "Real-time order", bg: "#f97316", textColor: "#fff" },
      ],
      accentColor: "#f97316",
      extraBlock: { type: "form", data: { title: "Contact Us" } },
    },
  },
  {
    id: "xmas-red",
    name: "Christmas Sale",
    category: "Festival",
    isPro: false,
    theme: "forest",
    button_style: "rounded",
    font_style: "inter",
    background_color: "#fef2f2",
    preview: {
      coverBg: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 50%, #fecaca 100%)",
      cardBg: "#fff1f2",
      textColor: "#991b1b",
      subtitleColor: "#b91c1c",
      avatarInitial: "🎅",
      avatarBg: "linear-gradient(135deg, #ef4444, #dc2626)",
      displayName: "Christmas Sale",
      subtitle: "Holiday deals — shop now & save big!",
      socials: ["facebook", "twitter", "instagram", "youtube"],
      buttons: [{ label: "🛍️  Shop", bg: "#dc2626", textColor: "#fff" }],
      accentColor: "#dc2626",
    },
  },
  // ===== MINIMALISTE =====
  {
    id: "dev-dark",
    name: "Développeur",
    category: "Minimaliste",
    isPro: false,
    theme: "dark",
    button_style: "square",
    font_style: "mono",
    background_color: "#0f172a",
    preview: {
      coverBg: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      cardBg: "#0f172a",
      textColor: "#38bdf8",
      subtitleColor: "#94a3b8",
      avatarInitial: "D",
      avatarBg: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
      displayName: "Dev Studio",
      subtitle: "Software Developer",
      socials: ["github", "linkedin", "twitter"],
      buttons: [
        {
          label: "GitHub",
          bg: "rgba(56,189,248,0.1)",
          textColor: "#38bdf8",
          border: "1px solid #38bdf8",
        },
        {
          label: "LinkedIn",
          bg: "rgba(56,189,248,0.1)",
          textColor: "#38bdf8",
          border: "1px solid #38bdf8",
        },
      ],
      accentColor: "#38bdf8",
    },
  },
  {
    id: "minimal-white",
    name: "Blanc Pur",
    category: "Minimaliste",
    isPro: false,
    theme: "default",
    button_style: "pill",
    font_style: "inter",
    background_color: "#ffffff",
    preview: {
      coverBg: "#f8fafc",
      cardBg: "#ffffff",
      textColor: "#1e293b",
      subtitleColor: "#94a3b8",
      avatarInitial: "A",
      avatarBg: "linear-gradient(135deg, #1e293b, #334155)",
      displayName: "Alex Martin",
      subtitle: "Minimal is beautiful",
      buttons: [
        { label: "Portfolio", bg: "#1e293b", textColor: "#ffffff" },
        {
          label: "Contact",
          bg: "#ffffff",
          textColor: "#1e293b",
          border: "1.5px solid #e2e8f0",
        },
      ],
      accentColor: "#1e293b",
    },
  },
  {
    id: "minimal-gray",
    name: "Anthracite",
    category: "Minimaliste",
    isPro: false,
    theme: "dark",
    button_style: "rounded",
    font_style: "inter",
    background_color: "#18181b",
    preview: {
      coverBg: "#18181b",
      cardBg: "#27272a",
      textColor: "#fafafa",
      subtitleColor: "#a1a1aa",
      avatarInitial: "R",
      avatarBg: "linear-gradient(135deg, #a1a1aa, #71717a)",
      displayName: "Resmaa Menakem",
      subtitle: "New York Times Best-Selling Author",
      badge: "Famous Writer",
      bio: "From race to culture, transformation is important.",
      buttons: [
        {
          label: "Send Email",
          bg: "#3f3f46",
          textColor: "#fafafa",
          icon: "✉️",
        },
        { label: "Add to Contacts", bg: "#fafafa", textColor: "#18181b" },
      ],
      accentColor: "#a1a1aa",
    },
  },
  // ===== NÉON =====
  {
    id: "neon-cyber",
    name: "Cyber Néon",
    category: "Néon",
    isPro: true,
    theme: "dark",
    button_style: "sharp",
    font_style: "mono",
    background_color: "#020617",
    preview: {
      coverBg: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)",
      cardBg: "#020617",
      textColor: "#22d3ee",
      subtitleColor: "#6366f1",
      avatarInitial: "N",
      avatarBg: "linear-gradient(135deg, #22d3ee, #6366f1)",
      displayName: "NEON_WAVE",
      subtitle: "// digital artist & coder",
      socials: ["github", "discord", "twitter"],
      buttons: [
        {
          label: "▸ PORTFOLIO",
          bg: "transparent",
          textColor: "#22d3ee",
          border: "1px solid #22d3ee",
        },
        {
          label: "▸ GITHUB",
          bg: "transparent",
          textColor: "#a855f7",
          border: "1px solid #a855f7",
        },
        {
          label: "▸ CONTACT",
          bg: "transparent",
          textColor: "#ec4899",
          border: "1px solid #ec4899",
        },
      ],
      accentColor: "#22d3ee",
    },
  },
  {
    id: "neon-pink",
    name: "Néon Rose",
    category: "Néon",
    isPro: true,
    theme: "dark",
    button_style: "pill",
    font_style: "dm",
    background_color: "#0c0a1a",
    preview: {
      coverBg: "linear-gradient(135deg, #0c0a1a 0%, #1a0a2e 100%)",
      cardBg: "#0c0a1a",
      textColor: "#f472b6",
      subtitleColor: "#c084fc",
      avatarInitial: "L",
      avatarBg: "linear-gradient(135deg, #ec4899, #a855f7)",
      displayName: "Luna Neon",
      subtitle: "DJ & Music Producer",
      socials: ["spotify", "soundcloud", "instagram"],
      buttons: [
        {
          label: "🎧 Latest Mix",
          bg: "rgba(236,72,153,0.15)",
          textColor: "#f472b6",
          border: "1px solid #ec489950",
        },
        {
          label: "🎵 Spotify",
          bg: "rgba(168,85,247,0.15)",
          textColor: "#c084fc",
          border: "1px solid #a855f750",
        },
        {
          label: "📱 Follow me",
          bg: "rgba(34,211,238,0.15)",
          textColor: "#22d3ee",
          border: "1px solid #22d3ee50",
        },
      ],
      accentColor: "#ec4899",
    },
  },
  {
    id: "neon-green",
    name: "Matrix",
    category: "Néon",
    isPro: true,
    theme: "dark",
    button_style: "square",
    font_style: "mono",
    background_color: "#022c22",
    preview: {
      coverBg: "linear-gradient(135deg, #022c22 0%, #052e16 100%)",
      cardBg: "#022c22",
      textColor: "#4ade80",
      subtitleColor: "#22c55e",
      avatarInitial: ">_",
      avatarBg: "linear-gradient(135deg, #4ade80, #22c55e)",
      displayName: "h4ck3r_",
      subtitle: "Cybersecurity Specialist",
      socials: ["github", "linkedin", "telegram"],
      buttons: [
        {
          label: "$ whoami",
          bg: "transparent",
          textColor: "#4ade80",
          border: "1px solid #4ade8050",
        },
        {
          label: "$ cat resume.pdf",
          bg: "transparent",
          textColor: "#4ade80",
          border: "1px solid #4ade8050",
        },
      ],
      accentColor: "#4ade80",
    },
  },
  // ===== PASTEL =====
  {
    id: "pastel-lavender",
    name: "Lavande",
    category: "Pastel",
    isPro: false,
    theme: "default",
    button_style: "pill",
    font_style: "dm",
    background_color: "#ede9fe",
    preview: {
      coverBg: "linear-gradient(135deg, #ede9fe 0%, #e0e7ff 50%, #dbeafe 100%)",
      cardBg: "#ffffff",
      textColor: "#4338ca",
      subtitleColor: "#6366f1",
      avatarInitial: "J",
      avatarBg: "linear-gradient(135deg, #818cf8, #6366f1)",
      displayName: "Julie Moreau",
      subtitle: "Life Coach & Wellness",
      buttons: [
        { label: "Réservation", bg: "#6366f1", textColor: "#fff" },
        {
          label: "Mon blog",
          bg: "#ffffff",
          textColor: "#6366f1",
          border: "1.5px solid #c7d2fe",
        },
        {
          label: "Contact",
          bg: "#ffffff",
          textColor: "#6366f1",
          border: "1.5px solid #c7d2fe",
        },
      ],
      accentColor: "#6366f1",
    },
  },
  {
    id: "pastel-mint",
    name: "Menthe Fraîche",
    category: "Pastel",
    isPro: false,
    theme: "default",
    button_style: "rounded",
    font_style: "inter",
    background_color: "#d1fae5",
    preview: {
      coverBg: "linear-gradient(135deg, #d1fae5 0%, #ccfbf1 50%, #cffafe 100%)",
      cardBg: "#ffffff",
      textColor: "#065f46",
      subtitleColor: "#0d9488",
      avatarInitial: "L",
      avatarBg: "linear-gradient(135deg, #2dd4bf, #14b8a6)",
      displayName: "Léa Dubois",
      subtitle: "Naturopathe & Bien-être",
      socials: ["instagram", "facebook", "youtube"],
      buttons: [
        { label: "Prendre RDV", bg: "#0d9488", textColor: "#fff" },
        {
          label: "Mon site",
          bg: "#ffffff",
          textColor: "#0d9488",
          border: "1.5px solid #99f6e4",
        },
      ],
      accentColor: "#14b8a6",
    },
  },
  {
    id: "pastel-peach",
    name: "Pêche",
    category: "Pastel",
    isPro: true,
    theme: "sunset",
    button_style: "pill",
    font_style: "dm",
    background_color: "#fff7ed",
    preview: {
      coverBg: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)",
      cardBg: "#ffffff",
      textColor: "#9a3412",
      subtitleColor: "#c2410c",
      avatarInitial: "A",
      avatarBg: "linear-gradient(135deg, #fb923c, #f97316)",
      displayName: "Amélie Laurent",
      subtitle: "Food Blogger & Chef",
      socials: ["instagram", "tiktok", "youtube"],
      buttons: [
        { label: "📋 Mes recettes", bg: "#f97316", textColor: "#fff" },
        {
          label: "📞 Réserver",
          bg: "#ffffff",
          textColor: "#ea580c",
          border: "1.5px solid #fdba74",
        },
        {
          label: "🌐 Mon blog",
          bg: "#ffffff",
          textColor: "#ea580c",
          border: "1.5px solid #fdba74",
        },
      ],
      accentColor: "#f97316",
      extraBlock: { type: "video", data: { title: "Ma dernière recette" } },
    },
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
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

// === Extra block mini-renderers ===
function ExtraBlockPreview({
  block,
  accentColor,
  textColor,
}: {
  block: NonNullable<TemplateDef["preview"]["extraBlock"]>;
  accentColor: string;
  textColor: string;
}) {
  if (block.type === "spotify") {
    return (
      <div
        className="mx-3 mb-2 rounded-lg p-2 flex items-center gap-2"
        style={{ background: "#1DB954" }}
      >
        <SocialIcon platform="spotify" size={14} />
        <div className="min-w-0">
          <p className="text-[9px] font-bold text-white truncate">
            {block.data?.track}
          </p>
          <p className="text-[8px] text-white/70 truncate">
            {block.data?.artist}
          </p>
        </div>
      </div>
    );
  }
  if (block.type === "video") {
    return (
      <div
        className="mx-3 mb-2 rounded-lg overflow-hidden"
        style={{ background: "rgba(0,0,0,0.1)" }}
      >
        <div className="h-12 flex items-center justify-center gap-1.5 relative">
          <div className="w-5 h-5 rounded-full bg-white/80 flex items-center justify-center">
            <div className="w-0 h-0 border-l-[5px] border-l-red-500 border-y-[3px] border-y-transparent ml-0.5" />
          </div>
          <p
            className="text-[8px] font-medium truncate"
            style={{ color: textColor }}
          >
            {block.data?.title}
          </p>
        </div>
      </div>
    );
  }
  if (block.type === "form") {
    return (
      <div
        className="mx-3 mb-2 rounded-lg p-2 space-y-1"
        style={{ border: `1px solid ${accentColor}30` }}
      >
        <p
          className="text-[8px] font-bold text-center"
          style={{ color: accentColor }}
        >
          {block.data?.title}
        </p>
        <div className="h-3.5 rounded bg-gray-100 border border-gray-200" />
        <div className="h-3.5 rounded bg-gray-100 border border-gray-200" />
        <div
          className="h-4 rounded text-[7px] font-bold text-white text-center leading-[16px]"
          style={{ background: accentColor }}
        >
          Submit
        </div>
      </div>
    );
  }
  if (block.type === "image-grid") {
    return (
      <div className="mx-3 mb-2 grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded"
          />
        ))}
      </div>
    );
  }
  return null;
}

// === Template Card ===
function TemplateCard({
  tpl,
  onUse,
  onPreview,
  applying,
  index,
}: {
  tpl: TemplateDef;
  onUse: () => void;
  onPreview: () => void;
  applying: boolean;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const p = tpl.preview;
  const btnRadius =
    tpl.button_style === "pill"
      ? "9999px"
      : tpl.button_style === "sharp"
        ? "0"
        : tpl.button_style === "square"
          ? "4px"
          : "8px";

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      layout
      className="relative rounded-2xl overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm cursor-pointer group"
      style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.08)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {tpl.isPro && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
        >
          <Crown className="w-3.5 h-3.5 text-amber-900" />
        </motion.div>
      )}

      {/* Mini profile preview */}
      <div className="relative" style={{ background: p.cardBg }}>
        <div
          className="h-16 relative overflow-hidden"
          style={{ background: p.coverBg }}
        >
          {p.coverOverlay && (
            <div
              className="absolute inset-0"
              style={{ background: p.coverOverlay }}
            />
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.12),transparent_60%)]" />
        </div>

        <div className="flex justify-center -mt-6 relative z-10">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-[2.5px] shadow-md"
            style={{
              background: p.avatarBg,
              borderColor:
                typeof p.cardBg === "string" && p.cardBg.startsWith("linear")
                  ? "rgba(255,255,255,0.5)"
                  : p.cardBg,
              color: "#fff",
            }}
          >
            {p.avatarInitial}
          </div>
        </div>

        <div className="px-3 pt-1.5 pb-2.5 text-center">
          <p
            className="font-bold text-[11px] truncate"
            style={{ color: p.textColor }}
          >
            {p.displayName}
          </p>
          <p
            className="text-[9px] mt-0.5 leading-tight line-clamp-2"
            style={{ color: p.subtitleColor }}
          >
            {p.subtitle}
          </p>

          {p.badge && (
            <span
              className="inline-block mt-1 text-[8px] font-semibold px-1.5 py-px rounded-full"
              style={{
                background: `${p.accentColor}15`,
                color: p.accentColor,
                border: `1px solid ${p.accentColor}30`,
              }}
            >
              {p.badge}
            </span>
          )}

          {p.bio && (
            <p
              className="text-[8px] mt-1 leading-tight line-clamp-2 px-1"
              style={{ color: p.subtitleColor }}
            >
              {p.bio}
            </p>
          )}

          {p.socials && p.socials.length > 0 && (
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              {p.socials.slice(0, 5).map((s) => (
                <SocialIcon key={s} platform={s} size={12} />
              ))}
            </div>
          )}

          <div className="mt-2 space-y-1">
            {p.buttons.slice(0, 3).map((btn, i) => (
              <div
                key={i}
                className="w-full py-1 px-2 text-[9px] font-medium text-center truncate"
                style={{
                  background: btn.bg,
                  color: btn.textColor,
                  border: btn.border || "none",
                  borderRadius: btnRadius,
                }}
              >
                {btn.icon ? `${btn.icon}  ` : ""}
                {btn.label}
              </div>
            ))}
          </div>
        </div>

        {tpl.preview.extraBlock && (
          <ExtraBlockPreview
            block={tpl.preview.extraBlock}
            accentColor={p.accentColor}
            textColor={p.textColor}
          />
        )}
      </div>

      <div className="px-3 py-2 border-t border-border/30 bg-card/90">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-semibold text-[11px] text-foreground truncate">
              {tpl.name}
            </p>
            <p className="text-[9px] text-muted-foreground">{tpl.category}</p>
          </div>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${tpl.isPro ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"}`}
          >
            {tpl.isPro ? "Pro" : "Gratuit"}
          </span>
        </div>
      </div>

      {/* Hover overlay */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 bg-foreground/60 backdrop-blur-[3px] flex flex-col items-center justify-center gap-2"
          >
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={onPreview}
              className="px-4 py-2 bg-background text-foreground rounded-xl font-semibold text-xs shadow-xl hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> Aperçu
            </motion.button>
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ delay: 0.05 }}
              onClick={onUse}
              disabled={applying}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-semibold text-xs shadow-xl hover:bg-primary/90 transition-colors flex items-center gap-1.5"
            >
              {applying ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              {applying ? "..." : "Utiliser"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// === Fullscreen Preview Modal ===
function TemplatePreviewModal({
  tpl,
  onClose,
  onUse,
  applying,
}: {
  tpl: TemplateDef;
  onClose: () => void;
  onUse: () => void;
  applying: boolean;
}) {
  const p = tpl.preview;
  const btnRadius =
    tpl.button_style === "pill"
      ? "9999px"
      : tpl.button_style === "sharp"
        ? "0"
        : tpl.button_style === "square"
          ? "6px"
          : "12px";
  const fontStyle =
    tpl.font_style === "dm"
      ? { fontFamily: "DM Sans, sans-serif" }
      : tpl.font_style === "mono"
        ? { fontFamily: "JetBrains Mono, monospace" }
        : { fontFamily: "Inter, sans-serif" };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-[380px] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close btn */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-50 w-8 h-8 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Phone mockup */}
        <div className="w-full rounded-[2.5rem] border-[6px] border-gray-800 bg-gray-800 shadow-2xl overflow-hidden relative">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-800 rounded-b-2xl z-20" />

          {/* Phone screen */}
          <div
            className="relative rounded-[2rem] overflow-hidden overflow-y-auto max-h-[70vh]"
            style={{ background: p.cardBg, ...fontStyle }}
          >
            {/* Cover */}
            <div
              className="h-40 relative overflow-hidden"
              style={{ background: p.coverBg }}
            >
              {p.coverOverlay && (
                <div
                  className="absolute inset-0"
                  style={{ background: p.coverOverlay }}
                />
              )}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.15),transparent_60%)]" />
            </div>

            {/* Avatar */}
            <div className="flex justify-center -mt-12 relative z-10">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4 shadow-xl"
                style={{
                  background: p.avatarBg,
                  borderColor:
                    typeof p.cardBg === "string" &&
                    p.cardBg.startsWith("linear")
                      ? "rgba(255,255,255,0.5)"
                      : p.cardBg,
                  color: "#fff",
                }}
              >
                {p.avatarInitial}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pt-3 pb-8 text-center">
              <p className="font-bold text-xl" style={{ color: p.textColor }}>
                {p.displayName}
              </p>
              <p className="text-sm mt-1" style={{ color: p.subtitleColor }}>
                {p.subtitle}
              </p>

              {p.badge && (
                <span
                  className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full"
                  style={{
                    background: `${p.accentColor}15`,
                    color: p.accentColor,
                    border: `1px solid ${p.accentColor}30`,
                  }}
                >
                  {p.badge}
                </span>
              )}

              {p.bio && (
                <p
                  className="text-xs mt-3 leading-relaxed"
                  style={{ color: p.subtitleColor }}
                >
                  {p.bio}
                </p>
              )}

              {p.socials && p.socials.length > 0 && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  {p.socials.map((s) => (
                    <SocialIcon key={s} platform={s} size={22} />
                  ))}
                </div>
              )}

              <div className="mt-5 space-y-2.5">
                {p.buttons.map((btn, i) => (
                  <div
                    key={i}
                    className="w-full py-3 px-4 text-sm font-semibold text-center truncate"
                    style={{
                      background: btn.bg,
                      color: btn.textColor,
                      border: btn.border || "none",
                      borderRadius: btnRadius,
                    }}
                  >
                    {btn.icon ? `${btn.icon}  ` : ""}
                    {btn.label}
                  </div>
                ))}
              </div>

              {/* Extra block in full preview */}
              {tpl.preview.extraBlock && (
                <div className="mt-4">
                  {tpl.preview.extraBlock.type === "spotify" && (
                    <div
                      className="rounded-xl p-3 flex items-center gap-3"
                      style={{ background: "#1DB954" }}
                    >
                      <SocialIcon platform="spotify" size={24} />
                      <div className="text-left min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {tpl.preview.extraBlock.data?.track}
                        </p>
                        <p className="text-xs text-white/70 truncate">
                          {tpl.preview.extraBlock.data?.artist}
                        </p>
                      </div>
                    </div>
                  )}
                  {tpl.preview.extraBlock.type === "video" && (
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{ background: "rgba(0,0,0,0.1)" }}
                    >
                      <div className="h-28 flex items-center justify-center gap-2 relative">
                        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <div className="w-0 h-0 border-l-[10px] border-l-red-500 border-y-[6px] border-y-transparent ml-1" />
                        </div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: p.textColor }}
                        >
                          {tpl.preview.extraBlock.data?.title}
                        </p>
                      </div>
                    </div>
                  )}
                  {tpl.preview.extraBlock.type === "form" && (
                    <div
                      className="rounded-xl p-4 space-y-2"
                      style={{ border: `1.5px solid ${p.accentColor}30` }}
                    >
                      <p
                        className="text-sm font-bold"
                        style={{ color: p.accentColor }}
                      >
                        {tpl.preview.extraBlock.data?.title}
                      </p>
                      <input
                        disabled
                        placeholder="Full Name *"
                        className="w-full h-9 rounded-lg px-3 text-xs bg-gray-50 border border-gray-200"
                      />
                      <input
                        disabled
                        placeholder="Email *"
                        className="w-full h-9 rounded-lg px-3 text-xs bg-gray-50 border border-gray-200"
                      />
                      <div
                        className="h-9 rounded-lg text-xs font-bold text-white flex items-center justify-center"
                        style={{ background: p.accentColor }}
                      >
                        Submit
                      </div>
                    </div>
                  )}
                  {tpl.preview.extraBlock.type === "image-grid" && (
                    <div className="grid grid-cols-3 gap-2 rounded-xl overflow-hidden">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons below phone */}
        <div className="flex gap-3 mt-5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-5 py-2.5 bg-background text-foreground rounded-xl font-semibold text-sm shadow-lg border border-border"
          >
            Fermer
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onUse}
            disabled={applying}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-lg flex items-center gap-2"
          >
            {applying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {applying ? "Application..." : "Utiliser ce modèle"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// === Main Component ===
export default function DashboardTemplates({ profile, onUpdate }: Props) {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [search, setSearch] = useState("");
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [previewTpl, setPreviewTpl] = useState<TemplateDef | null>(null);

  const filtered = TEMPLATES.filter((t) => {
    const matchCat = activeCategory === "Tous" || t.category === activeCategory;
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleUseTemplate = async (tpl: TemplateDef) => {
    if (!profile) return;
    if (tpl.isPro && profile.plan === "free") {
      toast({
        title: "Modèle Premium 👑",
        description: "Passe au plan Premium pour utiliser ce modèle.",
        variant: "destructive",
      });
      return;
    }
    setApplyingId(tpl.id);
    try {
      const updates: Partial<Profile> = {
        theme: tpl.theme as Profile["theme"],
        button_style: tpl.button_style,
        font_style: tpl.font_style,
        background_color: tpl.background_color,
      };
      if (onUpdate) {
        await onUpdate(updates);
      } else {
        await supabase.from("profiles").update(updates).eq("id", profile.id);
      }
      toast({
        title: `✅ Modèle "${tpl.name}" appliqué !`,
        description: "Va dans Apparence pour personnaliser davantage.",
      });
      setPreviewTpl(null);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'appliquer le modèle.",
        variant: "destructive",
      });
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm p-5 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="flex items-center gap-3 mb-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-dm font-bold text-lg text-foreground">
              Modèles de page
            </h2>
            <p className="text-sm text-muted-foreground">
              Choisis un template et applique-le en un clic
            </p>
          </div>
        </div>

        {/* Active template info */}
        {profile?.background_color &&
          (() => {
            const active = TEMPLATES.find(
              (t) =>
                t.background_color === profile.background_color &&
                t.theme === profile.theme &&
                t.button_style === profile.button_style,
            );
            if (!active) return null;
            return (
              <div className="mb-3 relative z-10 flex items-center gap-2 px-3 py-2 rounded-xl border border-primary/20 bg-primary/5">
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0"
                  style={{ background: active.preview.coverBg }}
                />
                <p className="text-xs text-foreground font-medium">
                  Modèle actif :{" "}
                  <span className="text-primary font-bold">{active.name}</span>
                </p>
              </div>
            );
          })()}

        <div className="relative z-10">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un modèle..."
            className="pl-9 rounded-xl bg-background/60 backdrop-blur-sm border-border/50"
          />
        </div>
      </motion.div>

      {/* Category tabs */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              activeCategory === cat
                ? "bg-foreground text-background shadow-md"
                : "bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:border-primary/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-16 bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50"
          >
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-medium text-foreground">Aucun modèle trouvé</p>
            <p className="text-sm text-muted-foreground mt-1">
              Essaie une autre catégorie
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={activeCategory}
            className="grid grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((tpl, i) => (
              <TemplateCard
                key={tpl.id}
                tpl={tpl}
                index={i}
                applying={applyingId === tpl.id}
                onUse={() => handleUseTemplate(tpl)}
                onPreview={() => setPreviewTpl(tpl)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pro CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="relative rounded-2xl border border-amber-200/50 p-6 text-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(40_100%_50%/0.1),transparent_60%)]" />
        <div className="relative z-10">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <Crown className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          </motion.div>
          <h3 className="font-dm font-bold text-base text-foreground mb-1">
            Accède à tous les modèles Pro
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Débloque les modèles animés, boutiques et festivals avec le plan
            Premium
          </p>
          <button className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-105">
            Passer à Premium 👑
          </button>
        </div>
      </motion.div>

      {/* Fullscreen preview modal */}
      <AnimatePresence>
        {previewTpl && (
          <TemplatePreviewModal
            tpl={previewTpl}
            onClose={() => setPreviewTpl(null)}
            onUse={() => handleUseTemplate(previewTpl)}
            applying={applyingId === previewTpl.id}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
