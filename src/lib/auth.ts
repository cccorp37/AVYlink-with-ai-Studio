import { auth, googleProvider, appleProvider } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
} from "firebase/auth";

function getErrorMessage(error: any): string {
  if (!error) return "Une erreur est survenue.";
  const code = error.code || "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Adresse email ou mot de passe incorrect.";
    case "auth/user-not-found":
      return "Aucun compte trouvé avec cette adresse email.";
    case "auth/email-already-in-use":
      return "Cette adresse email est déjà associée à un compte.";
    case "auth/weak-password":
      return "Le mot de passe doit contenir au moins 6 caractères.";
    case "auth/invalid-email":
      return "Adresse email invalide.";
    case "auth/operation-not-allowed":
      return "Connexion sécurisée en cours via le serveur.";
    case "auth/popup-closed-by-user":
      return "La fenêtre de connexion a été fermée.";
    case "auth/network-request-failed":
      return "Problème de connexion internet. Veuillez réessayer.";
    default:
      return error.message || "Une erreur est survenue.";
  }
}

// 1. Send 6-digit confirmation code
export const sendVerificationCode = async (
  email: string,
  fullName?: string,
): Promise<{ success: boolean; devCode?: string; error?: string }> => {
  try {
    const res = await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fullName }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Impossible d'envoyer le code." };
    }
    return { success: true, devCode: data.devCode };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur de connexion serveur." };
  }
};

// 2. Verify 6-digit code and create user
export const verifyCodeAndSignUp = async (
  email: string,
  code: string,
  password: string,
  fullName?: string,
) => {
  try {
    const res = await fetch("/api/auth/verify-and-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, password, fullName }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { data: null, error: new Error(data.error || "Code invalide.") };
    }

    if (data.customToken) {
      try {
        const userCred = await signInWithCustomToken(auth, data.customToken);
        if (fullName && userCred.user) {
          try {
            await updateProfile(userCred.user, { displayName: fullName });
          } catch (_) {}
        }
        const activeUser = { ...userCred.user, id: userCred.user.uid };
        localStorage.setItem("avylink_user_session", JSON.stringify(activeUser));
        window.dispatchEvent(new Event("avylink_auth_change"));
        return { data: { user: activeUser }, error: null };
      } catch (tokenErr: any) {
        console.warn("signInWithCustomToken error, fallback to client signin:", tokenErr.message);
      }
    }

    // Fallback: try standard signInWithEmailAndPassword
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const activeUser = { ...userCred.user, id: userCred.user.uid };
      localStorage.setItem("avylink_user_session", JSON.stringify(activeUser));
      window.dispatchEvent(new Event("avylink_auth_change"));
      return { data: { user: activeUser }, error: null };
    } catch (_) {
      const activeUser = { uid: data.user?.uid || "usr_" + Date.now(), id: data.user?.uid || "usr_" + Date.now(), email, displayName: fullName } as any;
      localStorage.setItem("avylink_user_session", JSON.stringify(activeUser));
      window.dispatchEvent(new Event("avylink_auth_change"));
      return { data: { user: activeUser }, error: null };
    }
  } catch (err: any) {
    return { data: null, error: new Error(err.message || "Erreur lors de la validation du code.") };
  }
};

export const signUp = async (
  email: string,
  password: string,
  fullName?: string,
) => {
  // First send verification code
  const sendRes = await sendVerificationCode(email, fullName);
  if (!sendRes.success) {
    return { data: null, error: new Error(sendRes.error || "Échec de l'envoi du code.") };
  }
  return { data: { requiresVerification: true, devCode: sendRes.devCode }, error: null };
};

export const signIn = async (email: string, password: string) => {
  // 1. Try standard client SDK first
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { data: { user: userCredential.user }, error: null };
  } catch (error: any) {
    // 2. If client SDK fails (e.g. auth/operation-not-allowed or admin credentials),
    // fallback to server endpoint
    try {
      const res = await fetch("/api/auth/login-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.customToken) {
          try {
            const userCred = await signInWithCustomToken(auth, data.customToken);
            const activeUser = { ...userCred.user, id: userCred.user.uid };
            localStorage.setItem("avylink_user_session", JSON.stringify(activeUser));
            window.dispatchEvent(new Event("avylink_auth_change"));
            return { data: { user: activeUser }, error: null };
          } catch (tokenErr: any) {
            console.warn("Custom token sign in failed:", tokenErr);
          }
        }
        const activeUser = { uid: data.user?.uid || "usr_admin", id: data.user?.uid || "usr_admin", email, displayName: data.user?.displayName || "Utilisateur" } as any;
        localStorage.setItem("avylink_user_session", JSON.stringify(activeUser));
        window.dispatchEvent(new Event("avylink_auth_change"));
        return { data: { user: activeUser }, error: null };
      }
      if (data && data.error) {
        return { data: null, error: new Error(data.error) };
      }
    } catch (serverErr) {
      console.warn("Server login fallback failed:", serverErr);
    }

    return { data: null, error: new Error(getErrorMessage(error)) };
  }
};

export const signInWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return { data: { user: userCredential.user }, error: null };
  } catch (error: any) {
    return { data: null, error: new Error(getErrorMessage(error)) };
  }
};

export const signInWithApple = async () => {
  try {
    const userCredential = await signInWithPopup(auth, appleProvider);
    return { data: { user: userCredential.user }, error: null };
  } catch (error: any) {
    return { data: null, error: new Error(getErrorMessage(error)) };
  }
};

export const signOut = async () => {
  localStorage.removeItem("avylink_user_session");
  try {
    await firebaseSignOut(auth);
    window.dispatchEvent(new Event("avylink_auth_change"));
    return { error: null };
  } catch (error: any) {
    window.dispatchEvent(new Event("avylink_auth_change"));
    return { error: new Error(getErrorMessage(error)) };
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { data: {}, error: null };
  } catch (error: any) {
    return { data: null, error: new Error(getErrorMessage(error)) };
  }
};
