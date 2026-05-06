/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import type { User } from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../services/firebase";
import {
  getStorageEventName,
  loadAppData,
  saveAppData,
} from "../utils/storage";

type SyncStatus = "local" | "carregando" | "sincronizado" | "salvando" | "erro";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  syncStatus: SyncStatus;
  login: (email: string, password: string) => Promise<void>;
  createAccount: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forceSync: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getSyncDoc(userId: string) {
  return doc(db, "users", userId, "sync", "app");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("local");
  const applyingRemote = useRef(false);
  const pushTimer = useRef<number | null>(null);

  const pushToCloud = useCallback(
    async (currentUser = user) => {
      if (!currentUser || applyingRemote.current) return;

      setSyncStatus("salvando");
      try {
        await setDoc(
          getSyncDoc(currentUser.uid),
          {
            ...loadAppData(),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
        setSyncStatus("sincronizado");
      } catch {
        setSyncStatus("erro");
      }
    },
    [user],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (!currentUser) {
        setSyncStatus("local");
        return;
      }

      setSyncStatus("carregando");
      try {
        const snapshot = await getDoc(getSyncDoc(currentUser.uid));

        if (snapshot.exists()) {
          applyingRemote.current = true;
          saveAppData(snapshot.data());
          window.setTimeout(() => {
            applyingRemote.current = false;
          }, 1000);
          setSyncStatus("sincronizado");
        } else {
          await pushToCloud(currentUser);
        }
      } catch {
        setSyncStatus("erro");
      }
    });

    return unsubscribe;
  }, [pushToCloud]);

  useEffect(() => {
    if (!user) return undefined;

    return onSnapshot(
      getSyncDoc(user.uid),
      (snapshot) => {
        if (!snapshot.exists() || applyingRemote.current) return;

        applyingRemote.current = true;
        saveAppData(snapshot.data());
        window.setTimeout(() => {
          applyingRemote.current = false;
        }, 1000);
        setSyncStatus("sincronizado");
      },
      () => setSyncStatus("erro"),
    );
  }, [pushToCloud, user]);

  useEffect(() => {
    function handleStorageChanged() {
      if (!user || applyingRemote.current) return;

      if (pushTimer.current) window.clearTimeout(pushTimer.current);
      pushTimer.current = window.setTimeout(() => {
        void pushToCloud(user);
      }, 500);
    }

    window.addEventListener(getStorageEventName(), handleStorageChanged);

    return () => {
      window.removeEventListener(getStorageEventName(), handleStorageChanged);
      if (pushTimer.current) window.clearTimeout(pushTimer.current);
    };
  }, [pushToCloud, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      syncStatus,
      login: async (email, password) => {
        setSyncStatus("carregando");
        await signInWithEmailAndPassword(auth, email, password);
      },
      createAccount: async (email, password) => {
        setSyncStatus("carregando");
        await createUserWithEmailAndPassword(auth, email, password);
      },
      logout: async () => {
        await signOut(auth);
      },
      forceSync: async () => {
        await pushToCloud(user);
      },
    }),
    [user, loading, syncStatus, pushToCloud],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
