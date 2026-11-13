import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import {
  HARDCODED_ADMIN_PROFILE,
  HARDCODED_ADMIN_STORAGE_KEY,
  HARDCODED_ADMIN_USER,
} from '../services/auth';

type Profile = Record<string, unknown> | null;

type AuthState = {
  user: any;
  profile: Profile;
  loading: boolean;
  role: string | null;
};

const AuthContext = createContext<AuthState>({ user: null, profile: null, loading: true, role: null });

const isHardcodedAdminActive = () =>
  typeof window !== 'undefined' && window.localStorage.getItem(HARDCODED_ADMIN_STORAGE_KEY) === 'true';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(() => (isHardcodedAdminActive() ? HARDCODED_ADMIN_USER : null));
  const [profile, setProfile] = useState<Profile>(() =>
    isHardcodedAdminActive() ? HARDCODED_ADMIN_PROFILE : null,
  );
  const [loading, setLoading] = useState(() => !isHardcodedAdminActive());

  useEffect(() => {
    const syncHardcodedAdmin = () => {
      if (isHardcodedAdminActive()) {
        setUser(HARDCODED_ADMIN_USER);
        setProfile(HARDCODED_ADMIN_PROFILE);
        setLoading(false);
        return true;
      }
      return false;
    };

    const handleAuthEvent = () => {
      if (!syncHardcodedAdmin() && !auth.currentUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    };

    window.addEventListener('resolveja-auth-change', handleAuthEvent);

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (syncHardcodedAdmin()) {
        return;
      }
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        const { getDoc, doc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        const snap = await getDoc(doc(db, 'users', u.uid));
        setProfile(snap.exists() ? (snap.data() as Record<string, unknown>) : null);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      window.removeEventListener('resolveja-auth-change', handleAuthEvent);
      unsub();
    };
  }, []);

  const role = (profile?.perfil as string) ?? null;
  return <AuthContext.Provider value={{ user, profile, loading, role }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
