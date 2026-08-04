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

const CONTACTS_KEY = "mpesa_contacts_data";

function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return Boolean(url && !url.includes("placeholder"));
}

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

    let list: Contact[] = [];
    try {
      const stored = localStorage.getItem(CONTACTS_KEY);
      if (stored) {
        list = JSON.parse(stored);
      }
    } catch {}

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from("contacts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });
        if (data && data.length > 0) {
          list = data as Contact[];
        }
      } catch {}
    }

    setContacts(list);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (c: Omit<Contact, "id" | "user_id">) => {
    if (!user) return;
    const newContact: Contact = {
      ...c,
      id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      user_id: user.id,
    };
    const updated = [...contacts, newContact];
    setContacts(updated);
    try {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
    } catch {}

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("contacts").insert({ ...c, user_id: user.id });
      } catch {}
    }
  };

  const remove = async (id: string) => {
    const updated = contacts.filter((item) => item.id !== id);
    setContacts(updated);
    try {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
    } catch {}

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("contacts").delete().eq("id", id);
      } catch {}
    }
  };

  return { contacts, loading, reload: load, add, remove };
}
