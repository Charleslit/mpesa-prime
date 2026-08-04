import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AdminUserSession = {
  id: string;
  email: string;
  display_name: string;
  initials: string;
  is_admin: boolean;
  token?: string;
};

const SESSION_KEY = "mpesa_admin_session";

export function useSession() {
  const [session, setSession] = useState<{ user: AdminUserSession } | Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // First check local subscriber admin session
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          setSession({ user: parsed } as any);
          setLoading(false);
          return;
        }
      }
    } catch {}

    // Fall back to Supabase session check if present
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data?.session) {
        setSession(data.session);
      }
      setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!localStorage.getItem(SESSION_KEY) && s) {
        setSession(s);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const saveAdminSession = (user: AdminUserSession) => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch {}
    setSession({ user } as any);
  };

  const clearAdminSession = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
    setSession(null);
  };

  const currentUser = (session as any)?.user ?? null;

  return {
    session,
    loading,
    user: currentUser,
    saveAdminSession,
    clearAdminSession,
  };
}
