import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type Lang = "fr" | "en";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  // Dashboard topbar
  dashboard: { fr: "Dashboard", en: "Dashboard" },
  search: { fr: "Rechercher...", en: "Search..." },
  profile: { fr: "Profil", en: "Profile" },
  notifications: { fr: "Notifications", en: "Notifications" },
  mark_all_read: { fr: "Tout marquer comme lu", en: "Mark all as read" },
  back: { fr: "Retour", en: "Back" },

  // Sidebar
  overview: { fr: "Vue d'ensemble", en: "Overview" },
  my_page: { fr: "Ma Page", en: "My Page" },
  links: { fr: "Liens", en: "Links" },
  shop: { fr: "Boutique", en: "Shop" },
  appearance: { fr: "Apparence", en: "Appearance" },
  analytics: { fr: "Analytiques", en: "Analytics" },
  heatmap: { fr: "Heatmap & A/B", en: "Heatmap & A/B" },
  templates: { fr: "Modèles", en: "Templates" },
  integrations: { fr: "Intégrations", en: "Integrations" },
  form_messages: { fr: "Messages", en: "Messages" },
  team: { fr: "Équipe", en: "Team" },
  api: { fr: "API & Webhooks", en: "API & Webhooks" },
  workspace: { fr: "Google Workspace", en: "Google Workspace" },
  wallet: { fr: "Portefeuille", en: "Wallet" },
  subscription: { fr: "Abonnement", en: "Subscription" },
  settings: { fr: "Paramètres", en: "Settings" },
  help: { fr: "Comment utiliser AvyLink", en: "How to use AvyLink" },
  advanced_settings: { fr: "Paramètres avancés", en: "Advanced Settings" },
  support: { fr: "Support", en: "Support" },
  logout: { fr: "Déconnexion", en: "Logout" },

  // Overview page
  welcome_back: { fr: "Bon retour", en: "Welcome back" },
  quick_actions: { fr: "Actions Rapides", en: "Quick Actions" },
  add_new_link: { fr: "Ajouter un nouveau lien", en: "Add a new link" },
  customize_appearance: {
    fr: "Personnaliser l'apparence",
    en: "Customize appearance",
  },
  view_public_profile: {
    fr: "Voir mon profil public",
    en: "View public profile",
  },
  view_analytics: { fr: "Consulter les analytiques", en: "View analytics" },
  browse_templates: { fr: "Parcourir les templates", en: "Browse templates" },
  total_views: { fr: "Vues totales", en: "Total views" },
  total_clicks: { fr: "Clics totaux", en: "Total clicks" },
  active_links: { fr: "Liens actifs", en: "Active links" },
  ctr: { fr: "Taux de clic", en: "Click rate" },
  recent_activity: { fr: "Activité récente", en: "Recent activity" },
  no_activity: { fr: "Aucune activité récente", en: "No recent activity" },

  // Notifications
  notif_welcome: {
    fr: "Bienvenue sur AvyLink ! 🎉",
    en: "Welcome to AvyLink! 🎉",
  },
  notif_complete_profile: {
    fr: "Complétez votre profil pour plus de visibilité",
    en: "Complete your profile for more visibility",
  },
  notif_tip_social: {
    fr: "Astuce : ajoutez vos réseaux sociaux",
    en: "Tip: add your social networks",
  },
  now: { fr: "Maintenant", en: "Now" },

  // General
  see_goodbye: { fr: "À bientôt ! 👋", en: "See you soon! 👋" },
  logged_out: { fr: "Vous êtes déconnecté.", en: "You are logged out." },
  my_dashboard: { fr: "Mon Dashboard", en: "My Dashboard" },
  login: { fr: "Connexion", en: "Login" },
  signup_free: { fr: "Commencer Gratuitement", en: "Start for Free" },
  features: { fr: "Fonctionnalités", en: "Features" },
  pricing: { fr: "Tarifs", en: "Pricing" },
  demo: { fr: "Démo", en: "Demo" },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("avylink-lang");
    return saved === "en" || saved === "fr" ? saved : "fr";
  });

  const handleSetLang = useCallback((newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem("avylink-lang", newLang);
  }, []);

  const t = useCallback(
    (key: string) => {
      return translations[key]?.[lang] ?? key;
    },
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
