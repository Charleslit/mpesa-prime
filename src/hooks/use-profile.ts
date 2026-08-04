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

async function resolveLogoUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const { data } = await supabase.storage.from("logos").createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

export function useProfile() {
  const { user, loading: sessionLoading } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logoDisplayUrl, setLogoDisplayUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLogoDisplayUrl(null);
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [{ data: p }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
    ]);
    if (p) {
      const casted: Profile = {
        ...p,
        balance: Number(p.balance),
        fuliza_balance: Number(p.fuliza_balance),
        airtime_balance: Number(p.airtime_balance),
      };
      setProfile(casted);
      setLogoDisplayUrl(await resolveLogoUrl(casted.logo_url));
    }
    setIsSuperAdmin(!!roles?.some((r) => r.role === "super_admin"));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!sessionLoading) load();
  }, [sessionLoading, load]);

  const update = async (patch: ProfileUpdate) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", user.id)
      .select()
      .single();
    if (error) throw error;
    const casted: Profile = {
      ...data,
      balance: Number(data.balance),
      fuliza_balance: Number(data.fuliza_balance),
      airtime_balance: Number(data.airtime_balance),
    };
    setProfile(casted);
    setLogoDisplayUrl(await resolveLogoUrl(casted.logo_url));
  };

  const uploadLogo = async (file: File) => {
    if (!user) return;
    const ext = file.name.split(".").pop() || "png";
    const path = `${user.id}/logo-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("logos")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) throw upErr;
    await update({ logo_url: path });
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
