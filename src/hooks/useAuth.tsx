import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  session: any | null;
  loading: boolean;
  waitForAuth: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  waitForAuth: () => Promise.resolve(null),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("avylink_user_session");
      if (stored) {
        const u = JSON.parse(stored);
        if (u) {
          u.id = u.id || u.uid;
          return u;
        }
      }
    } catch (_) {}
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncLocal = () => {
      try {
        const stored = localStorage.getItem("avylink_user_session");
        if (stored) {
          const u = JSON.parse(stored);
          if (u) {
            u.id = u.id || u.uid;
            setUser(u);
            setLoading(false);
            return;
          }
        } else if (!auth.currentUser) {
          setUser(null);
        }
      } catch (_) {}
    };

    window.addEventListener("avylink_auth_change", syncLocal);
    window.addEventListener("storage", syncLocal);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Alias uid to id for compatibility with components written for Supabase
        (currentUser as any).id = currentUser.uid;
        localStorage.setItem("avylink_user_session", JSON.stringify(currentUser));
        setUser(currentUser);
      } else {
        // Check if there's a custom stored session
        const stored = localStorage.getItem("avylink_user_session");
        if (stored) {
          try {
            const u = JSON.parse(stored);
            if (u && (u.uid || u.email)) {
              u.id = u.id || u.uid;
              setUser(u);
            } else {
              setUser(null);
            }
          } catch (_) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      window.removeEventListener("avylink_auth_change", syncLocal);
      window.removeEventListener("storage", syncLocal);
    };
  }, []);

  const waitForAuth = async (): Promise<User | null> => {
    if (!loading) return user;
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        unsubscribe();
        if (currentUser) {
          (currentUser as any).id = currentUser.uid;
        }
        resolve(currentUser);
      });
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, session: user ? { user } : null, loading, waitForAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
