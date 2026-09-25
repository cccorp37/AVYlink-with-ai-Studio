import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Smartphone,
  Monitor,
  Share,
  Plus,
  MoreVertical,
  ArrowLeft,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallApp = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const ua = navigator.userAgent;
    const ios =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(ios);
    setIsSafari(/Safari/.test(ua) && !/Chrome/.test(ua));

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Listen for app installed
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Retour</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden shadow-blue-lg border-4 border-background">
              <img
                src="/icon-192.jpg"
                alt="AvyLink"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="font-dm font-black text-3xl text-foreground">
              Installer <span className="text-gradient">AvyLink</span>
            </h1>
            <p className="text-muted-foreground">
              Accédez à AvyLink directement depuis votre écran d'accueil, comme
              une vraie application.
            </p>
          </div>

          {/* Status */}
          {isInstalled ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-3"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <Check className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="font-dm font-bold text-lg text-emerald-800">
                Application installée !
              </h2>
              <p className="text-sm text-emerald-600">
                AvyLink est déjà sur votre écran d'accueil.
              </p>
            </motion.div>
          ) : deferredPrompt ? (
            /* Native install prompt available (Chrome, Edge, Samsung...) */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <Button
                onClick={handleInstall}
                size="lg"
                className="w-full gradient-cta text-primary-foreground rounded-2xl font-bold text-base py-7 gap-3"
              >
                <Download className="w-5 h-5" />
                Installer l'application
              </Button>
              <p className="text-xs text-muted-foreground">
                Gratuit · Pas de téléchargement depuis un store
              </p>
            </motion.div>
          ) : (
            /* Manual instructions */
            <div className="space-y-5">
              {isIOS ? (
                /* iOS Instructions */
                <div className="bg-card rounded-2xl border border-border/40 p-6 text-left space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Smartphone className="w-5 h-5 text-primary" />
                    <h2 className="font-dm font-bold text-lg text-foreground">
                      Sur iPhone / iPad
                    </h2>
                  </div>
                  {[
                    {
                      step: 1,
                      icon: <Share className="w-5 h-5" />,
                      text: "Appuyez sur le bouton Partager",
                      sub: "L'icône carrée avec la flèche vers le haut",
                    },
                    {
                      step: 2,
                      icon: <Plus className="w-5 h-5" />,
                      text: "\"Sur l'écran d'accueil\"",
                      sub: "Faites défiler vers le bas pour trouver l'option",
                    },
                    {
                      step: 3,
                      icon: <Check className="w-5 h-5" />,
                      text: 'Appuyez sur "Ajouter"',
                      sub: "L'application apparaîtra sur votre écran",
                    },
                  ].map((s) => (
                    <div key={s.step} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                        {s.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">
                          {s.step}. {s.text}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {s.sub}
                        </div>
                      </div>
                    </div>
                  ))}
                  {!isSafari && (
                    <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 text-xs text-warning font-medium">
                      ⚠️ Ouvrez cette page dans Safari pour installer
                      l'application.
                    </div>
                  )}
                </div>
              ) : (
                /* Android / Desktop Instructions */
                <div className="bg-card rounded-2xl border border-border/40 p-6 text-left space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Monitor className="w-5 h-5 text-primary" />
                    <h2 className="font-dm font-bold text-lg text-foreground">
                      Installation manuelle
                    </h2>
                  </div>
                  {[
                    {
                      step: 1,
                      icon: <MoreVertical className="w-5 h-5" />,
                      text: "Ouvrez le menu du navigateur",
                      sub: "Les 3 points en haut à droite (Chrome)",
                    },
                    {
                      step: 2,
                      icon: <Download className="w-5 h-5" />,
                      text: '"Installer l\'application"',
                      sub: "Ou \"Ajouter à l'écran d'accueil\"",
                    },
                    {
                      step: 3,
                      icon: <Check className="w-5 h-5" />,
                      text: "Confirmez l'installation",
                      sub: "AvyLink s'ajoutera à votre écran",
                    },
                  ].map((s) => (
                    <div key={s.step} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                        {s.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">
                          {s.step}. {s.text}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {s.sub}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[
              { icon: Smartphone, label: "Accès rapide" },
              { icon: Download, label: "Hors-ligne" },
              { icon: Monitor, label: "Plein écran" },
            ].map((b) => (
              <div
                key={b.label}
                className="bg-card rounded-xl border border-border/30 p-4 text-center"
              >
                <b.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <span className="text-xs font-medium text-muted-foreground">
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InstallApp;
