import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { api } from './api';
import type { SessionUser } from './types';

const STORAGE_KEY = 'pg-auth';

type Session = { token: string; user: SessionUser } | null;

type AuthValue = {
  session: Session;
  signIn: (token: string, user: SessionUser) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

function read(): Session {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(read);

  const signIn = useCallback((token: string, user: SessionUser) => {
    const next = { token, user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  }, []);

  const signOut = useCallback(async () => {
    const token = session?.token;
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    if (token) await api('/auth/logout', { method: 'POST', token }).catch(() => undefined);
  }, [session]);

  const value = useMemo(() => ({ session, signIn, signOut }), [session, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
