import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SUBSCRIBER_PLATFORM_URL = process.env.SUBSCRIBER_PLATFORM_URL || "https://subscriber-platform-api.vercel.app";

/** Authenticate against live Subscriber Platform API (https://subscriber-platform-api.vercel.app) */
export const verifySubscriberAdminLogin = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; password: string }) => input)
  .handler(async ({ data }) => {
    const { email, password } = data;
    try {
      const res = await fetch(`${SUBSCRIBER_PLATFORM_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const errorMsg = errJson?.error || errJson?.message || "Invalid credentials on Subscriber Platform";
        throw new Error(errorMsg);
      }

      const body = await res.json();
      const user = body.user || body;
      const token = body.token;

      if (!user || !user.email) {
        throw new Error("Invalid user response from Subscriber Platform");
      }

      const roleStr = String(user.role || "").toLowerCase();
      const isAdmin = !!user.is_admin || ["admin", "super_admin", "app_owner"].includes(roleStr);

      if (!isAdmin) {
        throw new Error("Access denied: Your Subscriber Platform account does not have Admin privileges.");
      }

      const namePart = user.full_name || user.email.split("@")[0];
      const initials = namePart
        .split(" ")
        .map((s: string) => s[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return {
        ok: true,
        user: {
          id: String(user.id || user.email),
          email: String(user.email).toLowerCase(),
          display_name: namePart,
          initials: initials || "AD",
          is_admin: true,
          token,
        },
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Authentication failed");
    }
  });

const SUPER_EMAIL = "super3momentum@gmail.com";
const SUPER_PASSWORD = "7millionjustforme";

// Unauthenticated: creates the super admin account if it doesn't exist yet.
// Uses a fixed hardcoded credential — the caller cannot inject anything.
export const ensureSuperAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Check whether any super_admin exists
  const { data: existing, error: qErr } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("role", "super_admin")
    .limit(1);
  if (qErr) throw new Error(qErr.message);
  if (existing && existing.length > 0) return { ok: true, created: false };

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email: SUPER_EMAIL,
    password: SUPER_PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: "Super Admin", initials: "SA" },
  });
  if (error && !/already/i.test(error.message)) {
    throw new Error(error.message);
  }
  return { ok: true, created: true };
});

async function assertSuperAdmin(context: {
  supabase: import("@supabase/supabase-js").SupabaseClient;
  userId: string;
}) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: super admin only");
}

export const adminCreateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      email: string;
      password: string;
      displayName: string;
      initials?: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const initials =
      (data.initials || data.displayName.replace(/[^A-Za-z]/g, "").slice(0, 2) || "U")
        .toUpperCase()
        .slice(0, 3);
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { display_name: data.displayName, initials },
    });
    if (error) throw new Error(error.message);
    return { ok: true, userId: created.user?.id };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email, display_name, initials, balance, fuliza_balance, airtime_balance, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    return (profiles ?? []).map((p) => ({
      ...p,
      balance: Number(p.balance),
      fuliza_balance: Number(p.fuliza_balance),
      airtime_balance: Number(p.airtime_balance),
      roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role),
    }));
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    if (data.userId === context.userId) throw new Error("Cannot delete yourself");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
