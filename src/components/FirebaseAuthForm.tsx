import { useState } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, LogIn } from "lucide-react";

export function FirebaseAuthForm() {
  const { loginWithGoogle, loginWithApple, loginWithEmail, registerWithEmail } =
    useFirebaseAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegistering) {
        await registerWithEmail(email, password);
        toast({
          title: "Inscription réussie",
          description: "Vous êtes maintenant connecté avec Firebase.",
        });
      } else {
        await loginWithEmail(email, password);
        toast({
          title: "Connexion réussie",
          description: "Vous êtes connecté avec Firebase.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      toast({
        title: "Connecté avec Google",
        description: "Connexion réussie.",
      });
    } catch (err: any) {
      const isIframe =
        typeof window !== "undefined" && window.self !== window.top;
      const isNetworkError =
        err?.code === "auth/network-request-failed" ||
        err?.message?.includes("network-request-failed");

      const description =
        err?.customMessage ||
        (isNetworkError && isIframe
          ? "La popup Google a été bloquée dans l'aperçu iframe. Vous pouvez ouvrir l'application dans un nouvel onglet ou vous connecter par email."
          : err.message || "Impossible de se connecter avec Google");

      toast({
        title: isNetworkError ? "Connexion restreinte" : "Erreur",
        description,
        variant: "destructive",
      });
    }
  };

  const handleApple = async () => {
    try {
      await loginWithApple();
      toast({
        title: "Connecté avec Apple",
        description: "Firebase Auth activé.",
      });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-sm space-y-4">
      <form
        onSubmit={handleEmailAuth}
        className="space-y-4 bg-card p-6 rounded-xl border border-border shadow-sm"
      >
        <h3 className="font-bold text-lg">
          {isRegistering ? "Créer un compte" : "Connexion avec Firebase"}
        </h3>
        <div>
          <Label htmlFor="fb-email">Email</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="fb-email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="fb-password">Mot de passe</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="fb-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full gap-2">
          {loading ? (
            "Chargement..."
          ) : (
            <>
              <LogIn className="w-4 h-4" />{" "}
              {isRegistering ? "S'inscrire" : "Se connecter"}
            </>
          )}
        </Button>
        <div className="text-center">
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering
              ? "Déjà un compte ? Se connecter"
              : "Pas de compte ? S'inscrire"}
          </button>
        </div>
      </form>

      <div className="grid gap-2">
        <Button
          variant="outline"
          onClick={handleGoogle}
          className="w-full gap-2"
        >
          Continuer avec Google
        </Button>
        <Button
          variant="outline"
          onClick={handleApple}
          className="w-full gap-2"
        >
          Continuer avec Apple
        </Button>
      </div>
    </div>
  );
}
