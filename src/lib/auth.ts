import { auth, googleProvider, appleProvider } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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
      return "Cette méthode de connexion doit être activée dans la console Firebase (Authentication > Sign-in method).";
    case "auth/popup-closed-by-user":
      return "La fenêtre de connexion a été fermée.";
    case "auth/network-request-failed":
      return "Problème de connexion internet. Veuillez réessayer.";
    default:
      return error.message || "Une erreur est survenue.";
  }
}

export const signUp = async (
  email: string,
  password: string,
  fullName?: string,
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    if (fullName) {
      await updateProfile(userCredential.user, { displayName: fullName });
    }
    return { data: { user: userCredential.user }, error: null };
  } catch (error: any) {
    return { data: null, error: new Error(getErrorMessage(error)) };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { data: { user: userCredential.user }, error: null };
  } catch (error: any) {
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
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error: any) {
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
