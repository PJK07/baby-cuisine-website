import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

interface AuthContextValue {
  user: User | null;
  isConfigured: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithOutlook: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getRedirectUrl() {
  const configuredRedirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL as string | undefined;
  const currentRedirectUrl = `${window.location.origin}/`;

  if (!configuredRedirectUrl) return currentRedirectUrl;

  try {
    const configuredUrl = new URL(configuredRedirectUrl);
    const currentUrl = new URL(currentRedirectUrl);
    const configuredIsLocal =
      configuredUrl.hostname === "localhost" || configuredUrl.hostname === "127.0.0.1";
    const currentIsLocal =
      currentUrl.hostname === "localhost" || currentUrl.hostname === "127.0.0.1";

    if (configuredIsLocal && currentIsLocal) return currentRedirectUrl;
  } catch {
    return currentRedirectUrl;
  }

  return configuredRedirectUrl;
}

async function signInWithProvider(provider: "google" | "azure") {
  if (!supabase) throw new Error("Supabase is not configured yet.");

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: getRedirectUrl(),
    },
  });

  if (error) throw error;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        setUser(data.session?.user ?? null);
      })
      .catch(() => {
        if (!isMounted) return;
        setUser(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isConfigured: isSupabaseConfigured,
      isLoading,
      signInWithGoogle: () => signInWithProvider("google"),
      signInWithOutlook: () => signInWithProvider("azure"),
      signInWithEmail: async (email) => {
        if (!supabase) throw new Error("Supabase is not configured yet.");

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: getRedirectUrl(),
          },
        });

        if (error) throw error;
      },
      signOut: async () => {
        if (!supabase) return;
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
