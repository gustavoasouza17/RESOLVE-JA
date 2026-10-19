import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

type Profile = Record<string, unknown> | null;

type AuthState = {
  user: any;
  profile: Profile;
  loading: boolean;
  role: string | null;
};

const AuthContext = createContext<AuthState>({ user: null, profile: null, loading: true, role: null });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
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
    return () => unsub();
  }, []);

  const role = (profile?.perfil as string) ?? null;
  return <AuthContext.Provider value={{ user, profile, loading, role }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
