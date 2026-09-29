import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

import { Eye, EyeOff, Mail, Lock, User, ArrowRight, KeyRound, CheckCircle2, RotateCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp, verifyCodeAndSignUp, sendVerificationCode, resetPassword } from "@/lib/auth";

type Mode = "login" | "signup" | "verify" | "forgot";

interface AuthModalProps {
  defaultMode?: Mode;
  onClose: () => void;
  onSuccess?: () => void;
}

const AuthModal = ({
  defaultMode = "login",
  onClose,
  onSuccess,
}: AuthModalProps) => {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleResendCode = async () => {
    if (resendCooldown > 0 || !email) return;
    setLoading(true);
    const res = await sendVerificationCode(email, fullName);
    setLoading(false);
    if (!res.success) {
      toast({
        title: "Erreur",
        description: res.error || "Impossible de renvoyer le code.",
        variant: "destructive",
      });
    } else {
      if (res.devCode) setDevCode(res.devCode);
      setResendCooldown(60);
      toast({
        title: "Code renvoyé ✉️",
        description: "Un nouveau code à 6 chiffres a été envoyé à votre adresse email.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "forgot") {
      const { error } = await resetPassword(email);
      setLoading(false);
      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email envoyé ✉️",
          description:
            "Vérifiez votre boîte mail pour réinitialiser votre mot de passe.",
        });
        setMode("login");
      }
      return;
    }

    if (mode === "signup") {
      const res = await signUp(email, password, fullName);
      setLoading(false);
      if (res.error) {
        toast({
          title: "Erreur d'inscription",
          description: res.error.message,
          variant: "destructive",
        });
      } else {
        if (res.data?.devCode) {
          setDevCode(res.data.devCode);
        }
        setResendCooldown(60);
        setMode("verify");
        toast({
          title: "Code de vérification envoyé ✉️",
          description: "Entrez le code à 6 chiffres reçu par email pour valider votre compte.",
        });
      }
      return;
    }

    if (mode === "verify") {
      if (verificationCode.trim().length < 6) {
        setLoading(false);
        toast({
          title: "Code incomplet",
          description: "Veuillez entrer le code complet à 6 chiffres.",
          variant: "destructive",
        });
        return;
      }

      const res = await verifyCodeAndSignUp(email, verificationCode.trim(), password, fullName);
      setLoading(false);
      if (res.error) {
        toast({
          title: "Erreur de validation",
          description: res.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Compte activé ! 🎉",
          description: "Votre email est confirmé et vous êtes connecté avec succès.",
        });
        onSuccess?.();
        onClose();
      }
      return;
    }

    // login
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Bienvenue ! 👋",
        description: "Vous êtes connecté avec succès.",
      });
      onSuccess?.();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
      <div
        className="relative bg-card rounded-3xl shadow-blue-lg w-full max-w-md p-8 border border-border/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Logo */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <img
              src="/icon-192.jpg"
              alt="AvyLink Logo"
              className="w-9 h-9 rounded-xl object-cover shadow-blue"
            />
            <span className="font-dm font-bold text-xl text-foreground">
              Avy<span className="text-gradient">Link</span>
            </span>
          </div>
          {mode === "verify" && (
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Retour
            </button>
          )}
        </div>

        {/* Title */}
        <div className="mb-6">
          <h2 className="font-dm font-bold text-2xl text-foreground">
            {mode === "login" && "Connexion"}
            {mode === "signup" && "Créer un compte"}
            {mode === "verify" && "Confirmez votre email 🔐"}
            {mode === "forgot" && "Mot de passe oublié"}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {mode === "login" && "Bon retour sur AvyLink 👋"}
            {mode === "signup" && "Rejoins +10 000 créateurs africains 🌍"}
            {mode === "verify" && (
              <>
                Entrez le code à 6 chiffres envoyé à{" "}
                <strong className="text-foreground">{email}</strong>
              </>
            )}
            {mode === "forgot" &&
              "Entrez votre email pour recevoir un lien de réinitialisation"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <Label
                htmlFor="fullName"
                className="text-sm font-medium text-foreground"
              >
                Nom complet
              </Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Kofi Asante"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 rounded-xl border-border focus:ring-primary"
                />
              </div>
            </div>
          )}

          {mode !== "verify" && (
            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ton@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 rounded-xl border-border focus:ring-primary"
                />
              </div>
            </div>
          )}

          {mode !== "forgot" && mode !== "verify" && (
            <div>
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Mot de passe
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 rounded-xl border-border focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPwd ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Verification Code input mode */}
          {mode === "verify" && (
            <div className="space-y-3">
              <div>
                <Label
                  htmlFor="verificationCode"
                  className="text-sm font-medium text-foreground"
                >
                  Code de validation à 6 chiffres
                </Label>
                <div className="relative mt-1.5">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="verificationCode"
                    type="text"
                    maxLength={6}
                    autoFocus
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    required
                    className="pl-11 rounded-xl text-center text-xl font-bold tracking-[6px] border-border focus:ring-primary font-mono"
                  />
                </div>
              </div>

              {devCode && (
                <div
                  onClick={() => setVerificationCode(devCode)}
                  className="cursor-pointer p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-center justify-between hover:bg-primary/15 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    Code généré : <strong className="font-mono text-sm tracking-wider">{devCode}</strong>
                  </span>
                  <span className="underline font-semibold text-[11px]">Cliquer pour insérer</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>Vous n'avez rien reçu ?</span>
                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleResendCode}
                  className="text-primary font-semibold hover:underline disabled:opacity-50 flex items-center gap-1"
                >
                  <RotateCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                  {resendCooldown > 0
                    ? `Renvoyer (${resendCooldown}s)`
                    : "Renvoyer le code"}
                </button>
              </div>
            </div>
          )}

          {mode === "login" && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-xs text-primary hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-cta text-primary-foreground rounded-xl font-semibold shadow-blue hover:shadow-blue-lg transition-all h-11"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{" "}
                Traitement en cours...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {mode === "login" && "Se connecter"}
                {mode === "signup" && "Continuer & Recevoir le code"}
                {mode === "verify" && "Confirmer & Activer mon compte"}
                {mode === "forgot" && "Envoyer le lien"}
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Social sign-in — only on login/signup */}
        {(mode === "login" || mode === "signup") && (
          <>
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="flex flex-col gap-3">
              <GoogleSignInButton onSuccess={onSuccess} onClose={onClose} />
              <AppleSignInButton onSuccess={onSuccess} onClose={onClose} />
            </div>

            {typeof window !== "undefined" && window.self !== window.top && (
              <p className="text-[11px] text-muted-foreground text-center mt-2 leading-relaxed">
                💡 L'authentification Email + Code à 6 chiffres fonctionne directement dans l'aperçu.
              </p>
            )}
          </>
        )}

        {/* Switch mode */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" && (
            <>
              Pas encore de compte ?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-primary font-semibold hover:underline"
              >
                Créer un compte
              </button>
            </>
          )}
          {mode === "signup" && (
            <>
              Déjà un compte ?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-primary font-semibold hover:underline"
              >
                Se connecter
              </button>
            </>
          )}
          {mode === "verify" && (
            <button
              onClick={() => setMode("signup")}
              className="text-primary font-semibold hover:underline"
            >
              Modifier mon adresse email
            </button>
          )}
          {mode === "forgot" && (
            <button
              onClick={() => setMode("login")}
              className="text-primary font-semibold hover:underline"
            >
              Retour à la connexion
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

function GoogleSignInButton({
  onSuccess,
  onClose,
}: {
  onSuccess?: () => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle } = useFirebaseAuth();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: "Bienvenue ! 👋",
        description: "Connecté avec Google.",
      });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      const isIframe =
        typeof window !== "undefined" && window.self !== window.top;
      const isNetworkError =
        error?.code === "auth/network-request-failed" ||
        error?.message?.includes("network-request-failed");

      const description =
        error?.customMessage ||
        (isNetworkError && isIframe
          ? "La popup de connexion a été restreinte par l'environnement d'aperçu ou les cookies tiers. Vous pouvez ouvrir l'application dans un nouvel onglet ou vous connecter par email."
          : error?.message || "Impossible de se connecter avec Google.");

      toast({
        title: isNetworkError ? "Connexion restreinte" : "Erreur Google Sign In",
        description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-secondary transition-colors font-semibold text-sm text-foreground disabled:opacity-60"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      Continuer avec Google
    </button>
  );
}

function AppleSignInButton({
  onSuccess,
  onClose,
}: {
  onSuccess?: () => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { loginWithApple } = useFirebaseAuth();
  const { toast } = useToast();

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithApple();
      toast({ title: "Bienvenue ! 👋", description: "Connecté avec Apple." });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erreur Apple Sign In",
        description: error.message || "Impossible de se connecter avec Apple.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAppleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-foreground text-background hover:bg-foreground/90 transition-colors font-semibold text-sm disabled:opacity-60"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-background/40 border-t-background rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.38.07 2.33.74 3.13.77 1.2-.25 2.35-.96 3.62-.82 1.54.2 2.7.89 3.47 2.16-3.2 1.9-2.44 5.81.38 6.97-.57 1.52-1.33 3.01-2.6 3.8zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
      )}
      Continuer avec Apple
    </button>
  );
}

export default AuthModal;
