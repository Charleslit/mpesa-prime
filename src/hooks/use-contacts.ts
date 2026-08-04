import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./use-session";

export type Contact = {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  initials: string;
  tint: string;
  is_favourite: boolean;
};

export function useContacts() {
  const { user } = useSession();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setContacts([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setContacts((data ?? []) as Contact[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (c: Omit<Contact, "id" | "user_id">) => {
    if (!user) return;
    const { error } = await supabase
      .from("contacts")
      .insert({ ...c, user_id: user.id });
    if (error) throw error;
    await load();
  };

  const remove = async (id: string) => {
    await supabase.from("contacts").delete().eq("id", id);
    await load();
  };

  return { contacts, loading, reload: load, add, remove };
}
