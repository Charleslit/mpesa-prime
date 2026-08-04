import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./use-session";

export type Profile = {
  id: string;
  email: string | null;
  display_name: string;
  initials: string;
  logo_url: string | null;
  balance: number;
  fuliza_balance: number;
  airtime_balance: number;
};

export type ProfileUpdate = Partial<
  Pick<
    Profile,
    "display_name" | "initials" | "logo_url" | "balance" | "fuliza_balance" | "airtime_balance"
  >
>;

const PROFILE_KEY = "mpesa_profile_data";

function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return Boolean(url && !url.includes("placeholder"));
}

async function resolveLogoUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  if (!isSupabaseConfigured()) return path;
  try {
    const { data } = await supabase.storage.from("logos").createSignedUrl(path, 60 * 60);
    return data?.signedUrl ?? null;
  } catch {
    return path;
  }
}

export function useProfile() {
  const { user, loading: sessionLoading } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logoDisplayUrl, setLogoDisplayUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      try {
        const stored = localStorage.getItem(PROFILE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setProfile(parsed);
          setLogoDisplayUrl(parsed.logo_url);
        } else {
          setProfile(null);
          setLogoDisplayUrl(null);
        }
      } catch {
        setProfile(null);
        setLogoDisplayUrl(null);
      }
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    let currentProfile: Profile = {
      id: (user as any).id || "admin",
      email: (user as any).email || null,
      display_name: (user as any).display_name || "Admin",
      initials: (user as any).initials || "AD",
      logo_url: null,
      balance: 0,
      fuliza_balance: 463.91,
      airtime_balance: 0,
    };

    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      if (stored) {
        currentProfile = { ...currentProfile, ...JSON.parse(stored) };
      }
    } catch {}

    if ((user as any).is_admin) {
      setIsSuperAdmin(true);
    }

    // Only attempt Supabase fetch if Supabase is actually configured
    if (isSupabaseConfigured()) {
      try {
        const [{ data: p }, { data: roles }] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", user.id),
        ]);
        if (p) {
          currentProfile = {
            ...currentProfile,
            ...p,
            balance: Number(p.balance),
            fuliza_balance: Number(p.fuliza_balance),
            airtime_balance: Number(p.airtime_balance),
          };
        }
        if (roles?.some((r) => r.role === "super_admin")) {
          setIsSuperAdmin(true);
        }
      } catch {}
    }

    setProfile(currentProfile);
    setLogoDisplayUrl(await resolveLogoUrl(currentProfile.logo_url));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!sessionLoading) load();
  }, [sessionLoading, load]);

  const update = async (patch: ProfileUpdate) => {
    const updated = {
      ...(profile || {
        id: (user as any)?.id || "admin",
        email: (user as any)?.email || null,
        display_name: "Admin",
        initials: "AD",
        logo_url: null,
        balance: 0,
        fuliza_balance: 463.91,
        airtime_balance: 0,
      }),
      ...patch,
    };

    setProfile(updated);
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    } catch {}

    if (isSupabaseConfigured() && user?.id) {
      try {
        await supabase.from("profiles").update(patch).eq("id", user.id);
      } catch {}
    }

    if (patch.logo_url !== undefined) {
      setLogoDisplayUrl(await resolveLogoUrl(patch.logo_url));
    }
  };

  const uploadLogo = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await update({ logo_url: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const clearLogo = async () => update({ logo_url: null });

  return {
    profile,
    logoDisplayUrl,
    loading: loading || sessionLoading,
    isSuperAdmin,
    reload: load,
    update,
    uploadLogo,
    clearLogo,
  };
}
