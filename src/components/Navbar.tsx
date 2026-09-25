import { Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { user, waitForAuth } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "À bientôt ! 👋", description: "Vous êtes déconnecté." });
    navigate("/");
  };

  const handleAuthSuccess = async () => {
    const authedUser = await waitForAuth();
    if (authedUser) {
      navigate("/dashboard");
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img
              src="/icon-192.jpg"
              alt="AvyLink Logo"
              className="w-9 h-9 rounded-xl object-cover shadow-sm"
            />
            <span className="font-dm font-bold text-xl text-foreground tracking-tight">
              Avy<span className="text-gradient">Link</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {["Fonctionnalités", "Tarifs", "Démo"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace("é", "e").replace("î", "i")}`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary font-semibold"
                  onClick={() => navigate("/dashboard")}
                >
                  Mon Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-destructive gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground font-medium"
                  onClick={() => setAuthModal("login")}
                >
                  Connexion
                </Button>
                <Button
                  size="sm"
                  className="gradient-cta text-primary-foreground shadow-blue hover:shadow-blue-lg transition-all rounded-xl font-semibold"
                  onClick={() => setAuthModal("signup")}
                >
                  Commencer Gratuitement
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden bg-background/95 backdrop-blur-xl border-t border-border/50 px-4 py-5 space-y-3 animate-fade-up">
            {["Fonctionnalités", "Tarifs", "Démo"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace("é", "e").replace("î", "i")}`}
                className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2"
                onClick={() => setOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2 border-t border-border/50">
              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2 rounded-xl"
                >
                  <LogOut className="w-4 h-4" /> Déconnexion
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => {
                      setAuthModal("login");
                      setOpen(false);
                    }}
                  >
                    Connexion
                  </Button>
                  <Button
                    size="sm"
                    className="gradient-cta text-primary-foreground rounded-xl"
                    onClick={() => {
                      setAuthModal("signup");
                      setOpen(false);
                    }}
                  >
                    Commencer Gratuitement
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {authModal && (
        <AuthModal
          defaultMode={authModal}
          onClose={() => setAuthModal(null)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </>
  );
};

export default Navbar;
