import {
  ArrowLeft,
  Bell,
  Eye,
  Search,
  Command,
  X,
  Sun,
  Moon,
  Languages,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";

import type { Tables } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type Profile = Tables<"profiles">;

interface Props {
  profile: Profile | null;
  title: string;
  onMobileMenuOpen?: () => void;
}

export function DashboardTopbar({ profile, title, onMobileMenuOpen }: Props) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const profileUrl = profile?.username
    ? `${window.location.origin}/u/${profile.username}`
    : null;
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = [
    { id: 1, text: t("notif_welcome"), time: t("now"), unread: true },
    { id: 2, text: t("notif_complete_profile"), time: "2min", unread: true },
    { id: 3, text: t("notif_tip_social"), time: "5min", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header
      className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-border/40 flex-shrink-0 z-30"
      style={{
        background:
          "linear-gradient(90deg, hsl(var(--card) / 0.9), hsl(var(--card) / 0.95))",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Back button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl border border-border/60 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all"
          title="Retour"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>
        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-2">
          <img
            src="/icon-192.jpg"
            alt="AvyLink"
            className="w-8 h-8 rounded-xl object-cover shadow-sm"
          />
          <span className="font-dm font-bold text-base text-foreground">
            Avy<span className="text-gradient">Link</span>
          </span>
        </div>
        <div className="hidden md:block">
          <h1 className="font-dm font-bold text-lg text-foreground">{title}</h1>
          <p className="text-xs text-muted-foreground -mt-0.5">Dashboard</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLang(lang === "fr" ? "en" : "fr")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border/60 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all text-xs font-medium"
          title={lang === "fr" ? "Switch to English" : "Passer en Français"}
        >
          <Languages className="w-3.5 h-3.5" />
          <span className="uppercase">{lang}</span>
        </motion.button>

        {/* Theme toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-xl border border-border/60 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all"
          title={theme === "dark" ? "Mode clair" : "Mode sombre"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Search trigger */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSearchOpen(!searchOpen)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/60 text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all bg-secondary/40"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{t("search")}</span>
          <kbd className="ml-2 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border border-border/40">
            ⌘K
          </kbd>
        </motion.button>

        {/* Profile link */}
        {profileUrl && (
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-border/60 hover:border-primary/30 hover:text-primary text-muted-foreground transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            {t("profile")}
          </motion.a>
        )}

        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl border border-border/60 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full gradient-cta text-[9px] text-primary-foreground font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotifOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-card rounded-2xl border border-border/60 shadow-lg z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-border/40 flex items-center justify-between">
                    <h3 className="font-dm font-bold text-sm text-foreground">
                      {t("notifications")}
                    </h3>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="p-1 rounded-lg hover:bg-secondary"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 border-b border-border/30 last:border-0 hover:bg-secondary/50 transition-colors ${n.unread ? "" : "opacity-60"}`}
                      >
                        <div className="flex items-start gap-2">
                          {n.unread && (
                            <div className="w-2 h-2 rounded-full gradient-cta mt-1.5 flex-shrink-0" />
                          )}
                          <div className={!n.unread ? "ml-4" : ""}>
                            <p className="text-xs text-foreground">{n.text}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {n.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-border/40">
                    <button className="w-full text-xs text-primary font-medium hover:underline">
                      {t("mark_all_read")}
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold cursor-pointer shadow-sm"
          title={user?.email}
        >
          {(profile?.display_name || user?.email || "U")[0].toUpperCase()}
        </motion.div>
      </div>
    </header>
  );
}
