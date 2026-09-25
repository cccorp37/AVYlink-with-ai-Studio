import { useState, useEffect } from "react";
import {
  User,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider, appleProvider } from "@/lib/firebase";

let cachedAccessToken: string | null = null;

function formatAuthError(error: any): string {
  if (!error) return "Une erreur est survenue.";
  const code = error.code || "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Adresse email ou mot de passe incorrect.";
    case "auth/user-not-found":
      return "Aucun compte trouvé avec cet email.";
    case "auth/email-already-in-use":
      return "Cette adresse email est déjà utilisée.";
    case "auth/weak-password":
      return "Le mot de passe doit comporter au moins 6 caractères.";
    case "auth/invalid-email":
      return "Adresse email invalide.";
    case "auth/operation-not-allowed":
      return "Ce mode de connexion n'est pas encore activé dans Firebase Console (Authentication > Sign-in method).";
    case "auth/popup-closed-by-user":
      return "La fenêtre de connexion a été fermée avant la finalisation.";
    case "auth/popup-blocked":
      return "La popup a été bloquée par le navigateur. Autorisez les popups pour ce site.";
    case "auth/network-request-failed":
      return "Erreur de connexion réseau. Vérifiez votre accès internet.";
    default:
      return error.customMessage || error.message || "Une erreur est survenue lors de l'authentification.";
  }
}

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        cachedAccessToken = null;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
      }
      return result.user;
    } catch (error: any) {
      console.error("Google login error:", error);
      if (
        error?.code === "auth/network-request-failed" ||
        error?.message?.includes("network-request-failed")
      ) {
        const isIframe =
          typeof window !== "undefined" && window.self !== window.top;
        error.customMessage = isIframe
          ? "La popup Google a été restreinte par l'environnement d'aperçu ou les cookies tiers de votre navigateur. Veuillez ouvrir l'application dans un nouvel onglet ou vous connecter par email."
          : "La connexion Google n'a pas pu joindre les serveurs d'authentification. Vérifiez votre connexion internet ou vos bloqueurs de popups.";
      }
      throw new Error(formatAuthError(error));
    }
  };

  const loginWithApple = async () => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      return result.user;
    } catch (error: any) {
      console.error("Apple login error:", error);
      throw new Error(formatAuthError(error));
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      return result.user;
    } catch (error: any) {
      console.error("Email login error:", error);
      throw new Error(formatAuthError(error));
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      return result.user;
    } catch (error: any) {
      console.error("Email registration error:", error);
      throw new Error(formatAuthError(error));
    }
  };

  const logout = async () => {
    await signOut(auth);
    cachedAccessToken = null;
  };

  const getAccessToken = () => cachedAccessToken;

  return {
    user,
    loading,
    loginWithGoogle,
    loginWithApple,
    loginWithEmail,
    registerWithEmail,
    logout,
    getAccessToken,
  };
};
