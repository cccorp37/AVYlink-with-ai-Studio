import React, { useState } from "react";
import { Download, Smartphone, X, ExternalLink } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Props {
  className?: string;
  variant?: "default" | "outline" | "ghost" | "banner";
  size?: "default" | "sm" | "lg" | "icon";
}

export const PWAInstallButton: React.FC<Props> = ({
  className = "",
  variant = "outline",
  size = "sm",
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const navigate = useNavigate();

  // If already installed, hide the button
  if (isInstalled) {
    return null;
  }

  const handleAction = () => {
    if (isInstallable) {
      install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      navigate("/install");
    }
  };

  if (variant === "banner") {
    return (
      <>
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                Installer l'application AvyLink
                <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-semibold">
                  PWA
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Accès ultra-rapide et utilisation fluide directement depuis votre écran d'accueil.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleAction}
            className="gradient-cta text-primary-foreground rounded-xl text-xs font-semibold gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            {isInstallable ? "Installer" : "Installer l'app"}
          </Button>
        </div>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold text-foreground">Installer sur iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg hover:bg-secondary text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 text-xs text-foreground/80">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-secondary/30">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                    1
                  </span>
                  <p>
                    Appuyez sur le bouton <strong>Partager</strong> <span className="text-primary font-semibold">(icône avec la flèche vers le haut)</span> en bas de Safari.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-secondary/30">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                    2
                  </span>
                  <p>
                    Faites défiler vers le bas et touchez <strong>« Sur l'écran d'accueil »</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-secondary/30">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                    3
                  </span>
                  <p>
                    Touchez <strong>Ajouter</strong> en haut à droite. Votre application AvyLink est prête !
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl text-xs"
              >
                Compris
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleAction}
        className={`gap-1.5 rounded-xl text-xs font-semibold ${className}`}
      >
        <Download className="w-3.5 h-3.5 text-primary" />
        <span>Installer l'app</span>
      </Button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Installer sur iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg hover:bg-secondary text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-foreground/80">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-secondary/30">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  1
                </span>
                <p>
                  Appuyez sur le bouton <strong>Partager</strong> (icône avec la flèche vers le haut) dans la barre Safari.
                </p>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-secondary/30">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  2
                </span>
                <p>
                  Faites défiler la liste et touchez <strong>« Sur l'écran d'accueil »</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-secondary/30">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  3
                </span>
                <p>
                  Touchez <strong>Ajouter</strong> en haut à droite. C'est prêt !
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowIOSGuide(false)}
              className="w-full rounded-xl text-xs"
            >
              J'ai compris
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
