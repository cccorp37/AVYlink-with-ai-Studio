import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Crown,
  Search,
  Check,
  Loader2,
  Sparkles,
  X,
  Eye,
  Smartphone,
  ShoppingBag,
  Clock,
  Star,
  MessageCircle,
  Heart,
  Layers,
  UserPlus,
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

function getTemplateLayoutStyle(tpl: TemplateDef): "minimal_card" | "hero_cover" | "bento" | "classic" {
  if (tpl.category === "Carte de visite") return "minimal_card";
  if (tpl.category === "Festival" || tpl.category === "Animation") return "hero_cover";
  if (tpl.category === "Boutique" || tpl.category === "Créatif" || tpl.category === "Néon") return "bento";
  return "classic";
}

function getTemplateFeaturePills(tpl: TemplateDef): string[] {
  switch (tpl.category) {
    case "Carte de visite":
      return ["📇 Contact vCard", "💬 WhatsApp", "📋 Formulaire"];
    case "Boutique":
      return ["🛍️ Catalogue", "📱 Mobile Money", "⭐ Avis 5★"];
    case "Festival":
    case "Animation":
      return ["⏳ Compte à rebours", "🎟️ Billetterie", "🎬 Vidéo HD"];
    case "Créatif":
    case "Néon":
      return ["🍱 Grille Bento", "❤️ Pourboire", "🎵 Audio"];
    default:
      return ["✨ Éditorial", "❓ FAQ", "⭐ Témoignages"];
  }
}

function getTemplateStarterBlocks(tpl: TemplateDef) {
  const p = tpl.preview;
  if (tpl.category === "Boutique") {
    return [
      {
        type: "heading",
        title: "Catalogue",
        content: {
          text: p.buttons[0]?.label || "Nos meilleures ventes 🔥",
          subtitle: "Paiement sécurisé via Orange Money & MTN MoMo",
        },
      },
      {
        type: "whatsapp_cta",
        title: "Commande rapide WhatsApp",
        content: {
          phone: "237690000000",
          button_text: "Commander sur WhatsApp",
          subtitle: "Livraison express & conseils personnalisés",
          message: `Bonjour ${p.displayName}, je souhaite commander un article vu sur votre boutique AvyLink !`,
        },
      },
      {
        type: "testimonials",
        title: "Avis de nos clients",
        content: {
          items: [
            {
              author: "Sarah M.",
              role: "Cliente vérifiée • Douala",
              comment: "Qualité incroyable et livraison super rapide ! Je recommande à 100%.",
              rating: 5,
            },
            {
              author: "Marc K.",
              role: "Client vérifié • Yaoundé",
              comment: "Paiement Mobile Money fluide en 10 secondes.",
              rating: 5,
            },
          ],
        },
      },
      {
        type: "faq",
        title: "Questions fréquentes",
        content: {
          items: [
            {
              question: "Quels sont les moyens de paiement acceptés ?",
              answer: "Nous acceptons Orange Money et MTN Mobile Money directement depuis cette page.",
            },
            {
              question: "Quels sont les délais de livraison ?",
              answer: "Accès immédiat pour les produits digitaux et 24h à 48h pour les articles physiques.",
            },
          ],
        },
      },
    ];
  }

  if (tpl.category === "Carte de visite") {
    return [
      {
        type: "whatsapp_cta",
        title: "Contact Direct",
        content: {
          phone: "237690000000",
          button_text: "Écrire sur WhatsApp Direct",
          subtitle: `${p.displayName} • ${p.subtitle}`,
          message: `Bonjour ${p.displayName}, j'ai consulté votre carte de visite digitale AvyLink.`,
        },
      },
      {
        type: "testimonials",
        title: "Recommandations",
        content: {
          items: [
            {
              author: "Jean-Paul N.",
              role: "Directeur Général",
              comment: "Un professionnel rigoureux, réactif et orienté résultats.",
              rating: 5,
            },
          ],
        },
      },
      {
        type: "form",
        title: "Prendre rendez-vous",
        content: {
          formTitle: p.extraBlock?.data?.title || "Demander un devis ou rendez-vous",
          successMessage: "Merci ! Votre message a bien été transmis.",
          includeMessage: true,
        },
      },
    ];
  }

  if (tpl.category === "Festival" || tpl.category === "Animation") {
    const inFiveDays = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 16);
    return [
      {
        type: "countdown",
        title: "Prochain Événement Live",
        content: {
          target_date: inFiveDays,
          subtitle: `${p.displayName} — Places limitées !`,
          cta_text: p.buttons[0]?.label || "Réserver mon pass",
          cta_url: "https://avylink.com",
        },
      },
      {
        type: "tip_jar",
        title: "Soutenir le projet",
        content: {
          description: "Soutenez nos créations directement via Orange Money & MTN MoMo ❤️",
          amounts: [500, 1000, 2500, 5000],
        },
      },
    ];
  }

  return [
    {
      type: "tip_jar",
      title: "Soutenir mon travail",
      content: {
        description: "Offrez-moi un café via Mobile Money pour soutenir mes contenus ❤️",
        amounts: [500, 1000, 2500, 5000],
      },
    },
    {
      type: "whatsapp_cta",
      title: "Me contacter",
      content: {
        phone: "237690000000",
        button_text: "Discuter sur WhatsApp",
        subtitle: "Collaborations & partenariats",
        message: `Bonjour ${p.displayName}, je vous contacte depuis votre page AvyLink !`,
      },
    },
    {
      type: "faq",
      title: "À savoir",
      content: {
        items: [
          {
            question: "Comment collaborer avec moi ?",
            answer: "Cliquez sur le bouton WhatsApp ou envoyez une demande via le formulaire de contact.",
          },
        ],
      },
    },
  ];
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
  const layoutStyle = getTemplateLayoutStyle(tpl);
  const featurePills = getTemplateFeaturePills(tpl);
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
      className="relative rounded-2xl overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm cursor-pointer group flex flex-col justify-between"
      style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.08)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {tpl.isPro && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg text-[9px] font-extrabold text-amber-950"
          style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
        >
          <Crown className="w-3 h-3 text-amber-950" /> PRO
        </motion.div>
      )}

      {/* Distinct Architectural Mini Preview */}
      <div className="relative flex-1 flex flex-col justify-between" style={{ background: p.cardBg }}>
        {/* 1. CARTE DE VISITE LAYOUT (minimal_card) */}
        {layoutStyle === "minimal_card" ? (
          <div className="p-3 space-y-2">
            <div
              className="rounded-xl p-2.5 border shadow-sm"
              style={{
                background: "rgba(255,255,255,0.08)",
                borderColor: `${p.accentColor}35`,
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shadow-md flex-shrink-0"
                  style={{ background: p.avatarBg, color: "#fff" }}
                >
                  {p.avatarInitial}
                </div>
                <div className="min-w-0 text-left flex-1">
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-[11px] truncate" style={{ color: p.textColor }}>
                      {p.displayName}
                    </p>
                    <span className="w-3 h-3 rounded-full bg-sky-500 text-white text-[7px] flex items-center justify-center flex-shrink-0">
                      ✓
                    </span>
                  </div>
                  <p className="text-[8px] truncate" style={{ color: p.subtitleColor }}>
                    {p.subtitle}
                  </p>
                  <span
                    className="inline-block mt-0.5 text-[7px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: `${p.accentColor}20`, color: p.accentColor }}
                  >
                    {p.badge || "vCard Pro"}
                  </span>
                </div>
              </div>
              {/* Quick Contact Action Bar */}
              <div className="grid grid-cols-3 gap-1 mt-2">
                {["📞 Appel", "💬 WhatsApp", "📇 Contact"].map((act) => (
                  <div
                    key={act}
                    className="py-1 rounded-md text-[7px] font-bold text-center truncate"
                    style={{
                      background: `${p.accentColor}18`,
                      color: p.textColor,
                      border: `1px solid ${p.accentColor}30`,
                    }}
                  >
                    {act}
                  </div>
                ))}
              </div>
            </div>
            {/* Buttons */}
            <div className="space-y-1">
              {p.buttons.slice(0, 2).map((btn, i) => (
                <div
                  key={i}
                  className="w-full py-1.5 px-2.5 text-[8px] font-semibold flex items-center justify-between truncate"
                  style={{
                    background: btn.bg,
                    color: btn.textColor,
                    border: btn.border || "none",
                    borderRadius: btnRadius,
                  }}
                >
                  <span className="truncate">
                    {btn.icon ? `${btn.icon} ` : ""}
                    {btn.label}
                  </span>
                  <span>→</span>
                </div>
              ))}
            </div>
          </div>
        ) : /* 2. BOUTIQUE E-COMMERCE LAYOUT */
        tpl.category === "Boutique" ? (
          <div>
            <div
              className="h-14 relative overflow-hidden flex items-end p-2"
              style={{ background: p.coverBg }}
            >
              <span className="px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-xs text-[7px] font-bold text-white uppercase tracking-wider">
                🛍️ Boutique Mobile Money
              </span>
            </div>
            <div className="px-2.5 -mt-5 relative z-10 flex items-end justify-between">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold border-2 shadow-md"
                style={{ background: p.avatarBg, borderColor: "#fff", color: "#fff" }}
              >
                {p.avatarInitial}
              </div>
              <span
                className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: `${p.accentColor}20`, color: p.accentColor }}
              >
                ★ 4.9 (120+)
              </span>
            </div>
            <div className="p-2.5 space-y-2">
              <div className="text-left">
                <p className="font-bold text-[10px] truncate" style={{ color: p.textColor }}>
                  {p.displayName}
                </p>
                <p className="text-[8px] truncate" style={{ color: p.subtitleColor }}>
                  {p.subtitle}
                </p>
              </div>
              {/* 2-Column Mini Product Grid */}
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { title: p.buttons[0]?.label || "Pack Pro", price: "15 000 F" },
                  { title: p.buttons[1]?.label || "Article VIP", price: "8 500 F" },
                ].map((prod, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg p-1.5 text-left border"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      borderColor: `${p.accentColor}30`,
                    }}
                  >
                    <div
                      className="h-7 rounded mb-1 flex items-center justify-center text-[10px]"
                      style={{ background: `${p.accentColor}22` }}
                    >
                      {idx === 0 ? "📦" : "✨"}
                    </div>
                    <p
                      className="text-[8px] font-bold truncate"
                      style={{ color: p.textColor }}
                    >
                      {prod.title}
                    </p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span
                        className="text-[7px] font-extrabold"
                        style={{ color: p.accentColor }}
                      >
                        {prod.price}
                      </span>
                      <span
                        className="px-1 py-px rounded text-[6px] font-bold text-white"
                        style={{ background: p.accentColor }}
                      >
                        Acheter
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {/* WhatsApp Express Bar */}
              <div className="py-1 px-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center gap-1 text-[8px] font-bold text-emerald-500">
                <span>💬 Commander sur WhatsApp</span>
              </div>
            </div>
          </div>
        ) : /* 3. FESTIVAL & ANIMATION LAYOUT (hero_cover + countdown) */
        layoutStyle === "hero_cover" ? (
          <div>
            <div
              className="h-24 relative overflow-hidden flex flex-col justify-end p-2.5 text-left"
              style={{ background: p.coverBg }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border border-white shadow"
                  style={{ background: p.avatarBg, color: "#fff" }}
                >
                  {p.avatarInitial}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[10px] text-white truncate">
                    {p.displayName}
                  </p>
                  <p className="text-[8px] text-white/80 truncate">{p.subtitle}</p>
                </div>
              </div>
            </div>
            <div className="p-2.5 space-y-2">
              {/* Mini Countdown Timer */}
              <div
                className="rounded-lg p-1.5 border"
                style={{
                  background: `${p.accentColor}12`,
                  borderColor: `${p.accentColor}30`,
                }}
              >
                <p
                  className="text-[7px] font-bold uppercase tracking-wider text-center mb-1"
                  style={{ color: p.accentColor }}
                >
                  ⏳ Événement dans
                </p>
                <div className="grid grid-cols-4 gap-1 text-center">
                  {[
                    { v: "04", l: "J" },
                    { v: "18", l: "H" },
                    { v: "42", l: "M" },
                    { v: "19", l: "S" },
                  ].map((t) => (
                    <div
                      key={t.l}
                      className="rounded py-0.5 text-[8px] font-extrabold"
                      style={{
                        background: "rgba(0,0,0,0.18)",
                        color: p.textColor,
                      }}
                    >
                      {t.v}
                      <span className="text-[6px] opacity-70">{t.l}</span>
                    </div>
                  ))}
                </div>
              </div>
              {p.buttons.slice(0, 2).map((btn, i) => (
                <div
                  key={i}
                  className="w-full py-1 px-2 text-[8px] font-bold text-center truncate"
                  style={{
                    background: btn.bg,
                    color: btn.textColor,
                    border: btn.border || "none",
                    borderRadius: btnRadius,
                  }}
                >
                  {btn.icon ? `${btn.icon} ` : ""}
                  {btn.label}
                </div>
              ))}
            </div>
          </div>
        ) : /* 4. BENTO GRID LAYOUT (Créatif / Néon) */
        layoutStyle === "bento" ? (
          <div>
            <div
              className="h-14 relative overflow-hidden"
              style={{ background: p.coverBg }}
            />
            <div className="px-3 -mt-5 relative z-10 flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold border-2 shadow-md flex-shrink-0"
                style={{ background: p.avatarBg, borderColor: "#fff", color: "#fff" }}
              >
                {p.avatarInitial}
              </div>
              <div className="min-w-0 text-left pt-4">
                <p className="font-bold text-[10px] truncate" style={{ color: p.textColor }}>
                  {p.displayName}
                </p>
                <p className="text-[8px] truncate" style={{ color: p.subtitleColor }}>
                  {p.subtitle}
                </p>
              </div>
            </div>
            {/* Bento Tiles */}
            <div className="p-2.5 grid grid-cols-2 gap-1.5">
              <div
                className="col-span-2 py-1.5 px-2.5 text-[8px] font-bold text-left flex items-center justify-between truncate"
                style={{
                  background: p.buttons[0]?.bg || p.accentColor,
                  color: p.buttons[0]?.textColor || "#fff",
                  borderRadius: btnRadius,
                }}
              >
                <span className="truncate">
                  {p.buttons[0]?.icon || "🔥"} {p.buttons[0]?.label}
                </span>
                <span>↗</span>
              </div>
              {p.buttons.slice(1, 3).map((btn, i) => (
                <div
                  key={i}
                  className="p-2 flex flex-col justify-between text-left min-h-[44px]"
                  style={{
                    background: btn.bg,
                    color: btn.textColor,
                    border: btn.border || `1px solid ${p.accentColor}30`,
                    borderRadius: btnRadius,
                  }}
                >
                  <span className="text-[10px]">{btn.icon || (i === 0 ? "🎨" : "⚡")}</span>
                  <span className="text-[8px] font-bold truncate">{btn.label}</span>
                </div>
              ))}
              {/* Tip Jar mini bar */}
              <div
                className="col-span-2 py-1 px-2 rounded-lg flex items-center justify-between text-[7px] font-bold"
                style={{
                  background: `${p.accentColor}18`,
                  color: p.textColor,
                  border: `1px solid ${p.accentColor}30`,
                }}
              >
                <span>❤️ Pourboire Mobile Money</span>
                <span
                  className="px-1.5 py-0.5 rounded text-white"
                  style={{ background: p.accentColor }}
                >
                  1 000 F
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* 5. CLASSIC / EDITORIAL LAYOUT (Minimaliste / Pastel) */
          <div>
            <div
              className="h-14 relative overflow-hidden"
              style={{ background: p.coverBg }}
            />
            <div className="flex justify-center -mt-6 relative z-10">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold border-2 shadow-md"
                style={{
                  background: p.avatarBg,
                  borderColor: "#fff",
                  color: "#fff",
                }}
              >
                {p.avatarInitial}
              </div>
            </div>
            <div className="px-3 pt-1.5 pb-2.5 text-center space-y-1.5">
              <div>
                <p className="font-bold text-[11px] truncate" style={{ color: p.textColor }}>
                  {p.displayName}
                </p>
                <p className="text-[8px] truncate" style={{ color: p.subtitleColor }}>
                  {p.subtitle}
                </p>
              </div>
              {p.socials && p.socials.length > 0 && (
                <div className="flex items-center justify-center gap-1.5">
                  {p.socials.slice(0, 4).map((s) => (
                    <SocialIcon key={s} platform={s} size={11} />
                  ))}
                </div>
              )}
              <div className="space-y-1">
                {p.buttons.slice(0, 2).map((btn, i) => (
                  <div
                    key={i}
                    className="w-full py-1 px-2 text-[8px] font-medium text-center truncate"
                    style={{
                      background: btn.bg,
                      color: btn.textColor,
                      border: btn.border || "none",
                      borderRadius: btnRadius,
                    }}
                  >
                    {btn.icon ? `${btn.icon} ` : ""}
                    {btn.label}
                  </div>
                ))}
              </div>
              {/* Testimonial snippet */}
              <div
                className="p-1.5 rounded-lg text-left"
                style={{
                  background: `${p.accentColor}12`,
                  border: `1px solid ${p.accentColor}25`,
                }}
              >
                <p className="text-[7px] italic truncate" style={{ color: p.textColor }}>
                  ★★★★★ "Service exceptionnel et très fluide !"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer with Included Features */}
      <div className="px-3 py-2.5 border-t border-border/40 bg-card/95 space-y-1.5">
        <div className="flex items-center justify-between gap-1">
          <div className="min-w-0">
            <p className="font-bold text-[11px] text-foreground truncate">
              {tpl.name}
            </p>
            <p className="text-[9px] text-muted-foreground">{tpl.category}</p>
          </div>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${
              tpl.isPro
                ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                : "bg-primary/10 text-primary"
            }`}
          >
            {tpl.isPro ? "Pro" : "Gratuit"}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {featurePills.slice(0, 2).map((fp) => (
            <span
              key={fp}
              className="text-[8px] px-1.5 py-0.5 rounded-md bg-secondary/70 text-muted-foreground font-medium"
            >
              {fp}
            </span>
          ))}
        </div>
      </div>

      {/* Hover / Tap overlay */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 z-30 bg-black/65 backdrop-blur-[3px] flex flex-col items-center justify-center gap-2 p-3"
          >
            <motion.button
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={onPreview}
              className="w-full max-w-[150px] py-2 bg-background text-foreground rounded-xl font-bold text-xs shadow-xl hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> Aperçu riche
            </motion.button>
            <motion.button
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ delay: 0.04 }}
              onClick={onUse}
              disabled={applying}
              className="w-full max-w-[150px] py-2 gradient-cta text-primary-foreground rounded-xl font-bold text-xs shadow-xl hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5"
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
  onUseWithBlocks,
  applying,
}: {
  tpl: TemplateDef;
  onClose: () => void;
  onUse: () => void;
  onUseWithBlocks: () => void;
  applying: boolean;
}) {
  const p = tpl.preview;
  const layoutStyle = getTemplateLayoutStyle(tpl);
  const featurePills = getTemplateFeaturePills(tpl);
  const btnRadius =
    tpl.button_style === "pill"
      ? "9999px"
      : tpl.button_style === "sharp"
        ? "0"
        : tpl.button_style === "square"
          ? "6px"
          : "14px";
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="relative w-full max-w-[400px] flex flex-col items-center my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-50 w-9 h-9 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Feature badges bar */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3">
          {featurePills.map((fp) => (
            <span
              key={fp}
              className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-bold border border-white/20"
            >
              {fp}
            </span>
          ))}
        </div>

        {/* Phone mockup */}
        <div className="w-full rounded-[2.5rem] border-[6px] border-gray-800 bg-gray-800 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-gray-800 rounded-b-2xl z-20" />

          <div
            className="relative rounded-[2rem] overflow-hidden overflow-y-auto max-h-[64vh]"
            style={{ background: p.cardBg, ...fontStyle }}
          >
            {/* Header varies by layoutStyle */}
            {layoutStyle === "hero_cover" ? (
              <div
                className="h-48 relative overflow-hidden flex flex-col justify-end p-5 text-left"
                style={{ background: p.coverBg }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="relative z-10 flex items-center gap-3">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white shadow-xl"
                    style={{ background: p.avatarBg, color: "#fff" }}
                  >
                    {p.avatarInitial}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-white">{p.displayName}</p>
                    <p className="text-xs text-white/80">{p.subtitle}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="h-32 relative overflow-hidden"
                  style={{ background: p.coverBg }}
                />
                <div className="flex justify-center -mt-11 relative z-10">
                  <div
                    className={`w-22 h-22 ${layoutStyle === "minimal_card" ? "rounded-2xl" : "rounded-full"} flex items-center justify-center text-2xl font-bold border-4 shadow-xl`}
                    style={{
                      width: 84,
                      height: 84,
                      background: p.avatarBg,
                      borderColor: "#fff",
                      color: "#fff",
                    }}
                  >
                    {p.avatarInitial}
                  </div>
                </div>
              </>
            )}

            <div className="px-5 pt-3 pb-6 text-center space-y-4">
              {layoutStyle !== "hero_cover" && (
                <div>
                  <p className="font-bold text-xl" style={{ color: p.textColor }}>
                    {p.displayName}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: p.subtitleColor }}>
                    {p.subtitle}
                  </p>
                  {p.badge && (
                    <span
                      className="inline-block mt-2 text-[11px] font-bold px-3 py-0.5 rounded-full"
                      style={{
                        background: `${p.accentColor}20`,
                        color: p.accentColor,
                        border: `1px solid ${p.accentColor}35`,
                      }}
                    >
                      {p.badge}
                    </span>
                  )}
                </div>
              )}

              {p.bio && (
                <p className="text-xs leading-relaxed" style={{ color: p.subtitleColor }}>
                  {p.bio}
                </p>
              )}

              {/* Rich Category Widget in Modal */}
              {tpl.category === "Boutique" && (
                <div className="grid grid-cols-2 gap-2 text-left">
                  {[
                    { name: p.buttons[0]?.label || "Pack Formation", price: "15 000 XAF" },
                    { name: p.buttons[1]?.label || "Consultation VIP", price: "10 000 XAF" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl p-2.5 border"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        borderColor: `${p.accentColor}35`,
                      }}
                    >
                      <div
                        className="h-14 rounded-lg mb-2 flex items-center justify-center text-xl"
                        style={{ background: `${p.accentColor}20` }}
                      >
                        {idx === 0 ? "🛍️" : "📦"}
                      </div>
                      <p className="text-xs font-bold truncate" style={{ color: p.textColor }}>
                        {item.name}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[11px] font-extrabold" style={{ color: p.accentColor }}>
                          {item.price}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white"
                          style={{ background: p.accentColor }}
                        >
                          Acheter
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(tpl.category === "Festival" || tpl.category === "Animation") && (
                <div
                  className="rounded-xl p-3 border"
                  style={{
                    background: `${p.accentColor}15`,
                    borderColor: `${p.accentColor}35`,
                  }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: p.accentColor }}>
                    ⏳ Compte à rebours officiel
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { v: "04", l: "Jours" },
                      { v: "18", l: "Heures" },
                      { v: "42", l: "Min" },
                      { v: "19", l: "Sec" },
                    ].map((u) => (
                      <div
                        key={u.l}
                        className="rounded-lg py-1.5"
                        style={{ background: "rgba(0,0,0,0.2)", color: p.textColor }}
                      >
                        <p className="font-extrabold text-sm">{u.v}</p>
                        <p className="text-[9px] opacity-75">{u.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Buttons (Bento or Stack) */}
              <div className={layoutStyle === "bento" ? "grid grid-cols-2 gap-2" : "space-y-2"}>
                {p.buttons.map((btn, i) => (
                  <div
                    key={i}
                    className={`${layoutStyle === "bento" && i === 0 ? "col-span-2" : ""} py-2.5 px-3 text-xs font-bold text-center truncate`}
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

              {/* WhatsApp + Tip Jar preview */}
              <div
                className="rounded-xl p-3 flex items-center justify-between text-left"
                style={{
                  background: "rgba(16,185,129,0.14)",
                  border: "1px solid rgba(16,185,129,0.35)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-sm">
                    💬
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: p.textColor }}>
                      Discussion WhatsApp Directe
                    </p>
                    <p className="text-[10px]" style={{ color: p.subtitleColor }}>
                      Réponse rapide en 1 clic
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold">
                  Écrire
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons below phone */}
        <div className="flex flex-col sm:flex-row gap-2.5 mt-4 w-full">
          <button
            onClick={onUse}
            disabled={applying}
            className="flex-1 py-2.5 px-4 bg-card text-foreground rounded-xl font-bold text-xs shadow-lg border border-border hover:border-primary/40 transition-all flex items-center justify-center gap-1.5"
          >
            {applying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Appliquer le style seul
          </button>
          <button
            onClick={onUseWithBlocks}
            disabled={applying}
            className="flex-1 py-2.5 px-4 gradient-cta text-primary-foreground rounded-xl font-bold text-xs shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
          >
            {applying ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Style + Blocs du modèle
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// === Main Component ===
export default function DashboardTemplates({ profile, onUpdate }: Props) {
  const navigate = useNavigate();
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

  const handleUseTemplate = async (tpl: TemplateDef, includeStarterBlocks = false) => {
    if (!profile) return;
    if (tpl.isPro && profile.plan === "free") {
      toast({
        title: "Modèle Premium 👑",
        description: "Passe au plan Starter, Premium ou Business pour débloquer ce modèle.",
        variant: "destructive",
      });
      navigate("/dashboard/abonnement");
      return;
    }
    setApplyingId(tpl.id);
    try {
      const layoutStyle = getTemplateLayoutStyle(tpl);
      const updates: Record<string, unknown> = {
        theme: tpl.theme,
        button_style: tpl.button_style,
        font_style: tpl.font_style,
        background_color: tpl.background_color,
        layout_style: layoutStyle,
      };
      if (onUpdate) {
        await onUpdate(updates as Partial<Profile>);
      }
      await supabase.from("profiles").update(updates).eq("id", profile.id);

      if (includeStarterBlocks) {
        const starterBlocks = getTemplateStarterBlocks(tpl);
        const { data: existing } = await supabase
          .from("page_blocks")
          .select("id")
          .eq("profile_id", profile.id);
        let pos = Array.isArray(existing) ? existing.length : 0;
        for (const blk of starterBlocks) {
          await supabase.from("page_blocks").insert({
            profile_id: profile.id,
            type: blk.type,
            title: blk.title,
            content: blk.content,
            position: pos++,
            is_active: true,
          });
        }
      }

      toast({
        title: includeStarterBlocks
          ? `✅ Modèle "${tpl.name}" + blocs installés !`
          : `✅ Modèle "${tpl.name}" appliqué !`,
        description: includeStarterBlocks
          ? "La disposition et les blocs interactifs ont été ajoutés à ta page."
          : "Le thème, la disposition et les couleurs ont été mis à jour.",
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
              Galerie de Modèles Architecturaux
            </h2>
            <p className="text-sm text-muted-foreground">
              Chaque modèle possède sa propre disposition (Bento, Carte vCard, Boutique, Poster Festival) et ses blocs dédiés
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
                  <span className="text-primary font-bold">{active.name}</span>{" "}
                  <span className="text-muted-foreground">({active.category})</span>
                </p>
              </div>
            );
          })()}

        <div className="relative z-10">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un modèle (Boutique, Carte de visite, Festival, Néon...)"
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((tpl, i) => (
              <TemplateCard
                key={tpl.id}
                tpl={tpl}
                index={i}
                applying={applyingId === tpl.id}
                onUse={() => handleUseTemplate(tpl, true)}
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
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/20 backdrop-blur-xl" />
        <div className="relative z-10">
          <Crown className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <h3 className="font-dm font-bold text-base text-foreground mb-1">
            Accède à tous les modèles Pro & E-Commerce
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Débloque les modèles animés, boutiques Mobile Money et festivals avec un abonnement Pro
          </p>
          <button
            onClick={() => navigate("/dashboard/abonnement")}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Voir les offres d'abonnement 👑
          </button>
        </div>
      </motion.div>

      {/* Fullscreen preview modal */}
      <AnimatePresence>
        {previewTpl && (
          <TemplatePreviewModal
            tpl={previewTpl}
            onClose={() => setPreviewTpl(null)}
            onUse={() => handleUseTemplate(previewTpl, false)}
            onUseWithBlocks={() => handleUseTemplate(previewTpl, true)}
            applying={applyingId === previewTpl.id}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
