import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { signInAdmin, type AdminSession } from "./admin-session";
import { readSession, saveSession, clearSession } from "./session-storage";

type SessionAuth = { ready: boolean; signedIn: boolean; sessionId: string | null; getToken: () => Promise<string | null>; signIn: (email: string, password: string) => Promise<void>; signOut: () => Promise<void> };
const AuthContext = createContext<SessionAuth | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<AdminSession | null>(null);
    const [ready, setReady] = useState(false);
    useEffect(() => {
        let active = true;
        void readSession().then(value => { if (active) setSession(value); }).catch(() => {}).finally(() => { if (active) setReady(true); });
        return () => { active = false; };
    }, []);
    useEffect(() => {
        if (!session) return;
        const timer = setTimeout(() => { setSession(null); void clearSession().catch(() => {}); }, Math.max(0, session.expiresAt - Date.now()));
        return () => clearTimeout(timer);
    }, [session]);
    const value = useMemo<SessionAuth>(() => ({
        ready, signedIn: Boolean(session), sessionId: session?.sessionId ?? null,
        getToken: async () => session && session.expiresAt > Date.now() ? session.token : null,
        signIn: async (email, password) => {
            const next = await signInAdmin(email, password);
            await saveSession(next);
            setSession(next);
        },
        signOut: async () => { await clearSession(); setSession(null); },
    }), [ready, session]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useSessionAuth() {
    const auth = useContext(AuthContext);
    if (!auth) throw new Error("Admin session provider is missing.");
    return auth;
}
