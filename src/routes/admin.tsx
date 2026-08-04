import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MobileFrame } from "@/components/mpesa/MobileFrame";
import { BackBar } from "@/components/mpesa/TopBar";
import { DownloadPrompt } from "@/components/mpesa/DownloadPrompt";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useProfile, type ProfileUpdate } from "@/hooks/use-profile";
import { useContacts } from "@/hooks/use-contacts";
import { formatKsh } from "@/hooks/use-balance";
import {
  verifySubscriberAdminLogin,
  ensureSuperAdmin,
  adminCreateUser,
  adminListUsers,
  adminDeleteUser,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — M-PESA" },
      { name: "description", content: "M-PESA admin panel for managing accounts and balances." },
      { property: "og:title", content: "Admin Panel — M-PESA" },
      { property: "og:description", content: "Manage accounts, balances and profile settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminRoute,
});

function AdminRoute() {
  const { session, loading } = useSession();
  if (loading) {
    return (
      <MobileFrame>
        <BackBar title="Admin" />
        <div className="p-6 text-sm text-muted-foreground">Loading…</div>
      </MobileFrame>
    );
  }
  return session ? <Dashboard /> : <Login />;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const verifyLogin = useServerFn(verifySubscriberAdminLogin);
  const { saveAdminSession } = useSession();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await verifyLogin({
        data: {
          email: email.trim(),
          password,
        },
      });

      if (res && res.user) {
        saveAdminSession(res.user);
      } else {
        setError("Invalid response from Subscriber Platform");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <MobileFrame>
      <BackBar title="Subscriber Admin Sign In" />
      <div className="flex-1 flex flex-col justify-center px-6 pb-10">
        <div
          className="rounded-2xl bg-card p-6 space-y-4"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div>
            <h1 className="text-xl font-bold text-foreground">Sign in</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Sign in with your Subscriber Platform admin credentials.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <label className="block">
              <span className="text-xs text-muted-foreground">Subscriber Admin Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm focus:outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Password</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm focus:outline-none focus:border-primary"
              />
            </label>
            {error && (
              <p className="text-xs text-destructive font-medium leading-relaxed">{error}</p>
            )}
            <button
              disabled={busy}
              type="submit"
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Authenticating with Subscriber API…" : "Sign in"}
            </button>
          </form>
          <p className="text-[11px] text-muted-foreground">
            Only accounts with Admin permissions on Subscriber Platform can sign in.
          </p>
        </div>
        <Link
          to="/"
          className="mt-6 text-center text-sm text-primary font-medium"
        >
          Back to app
        </Link>
      </div>
    </MobileFrame>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { profile, logoDisplayUrl, isSuperAdmin, reload, update, uploadLogo, clearLogo } =
    useProfile();
  const { clearAdminSession } = useSession();
  const [tab, setTab] = useState<"profile" | "users">("profile");

  const signOut = async () => {
    clearAdminSession();
    try {
      await supabase.auth.signOut();
    } catch {}
    navigate({ to: "/" });
  };

  if (!profile) {
    return (
      <MobileFrame>
        <BackBar title="Admin" />
        <div className="p-6 text-sm text-muted-foreground">Loading profile…</div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <DownloadPrompt />
      <BackBar
        title={isSuperAdmin ? "Super Admin" : "My Account"}
        right={
          <button
            onClick={signOut}
            className="text-xs font-semibold text-destructive"
          >
            Sign out
          </button>
        }
      />

      {isSuperAdmin && (
        <div className="mx-4 mt-2 flex rounded-full bg-muted p-1 text-sm">
          {(["profile", "users"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`flex-1 rounded-full py-2 font-semibold ${
                tab === k
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70"
              }`}
            >
              {k === "profile" ? "My Profile" : "Users"}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-10 pt-4 space-y-4">
        {tab === "profile" ? (
          <ProfileEditor
            profile={profile}
            logoUrl={logoDisplayUrl}
            onUpdate={update}
            onUploadLogo={uploadLogo}
            onClearLogo={clearLogo}
          />
        ) : (
          <SuperAdminUsers refreshSelf={reload} />
        )}
        <ContactsEditor />
      </div>
    </MobileFrame>
  );
}

function ProfileEditor({
  profile,
  logoUrl,
  onUpdate,
  onUploadLogo,
  onClearLogo,
}: {
  profile: NonNullable<ReturnType<typeof useProfile>["profile"]>;
  logoUrl: string | null;
  onUpdate: (p: ProfileUpdate) => Promise<void>;
  onUploadLogo: (f: File) => Promise<void>;
  onClearLogo: () => Promise<void>;
}) {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [initials, setInitials] = useState(profile.initials);
  const [balance, setBalance] = useState(String(profile.balance));
  const [fuliza, setFuliza] = useState(String(profile.fuliza_balance));
  const [airtime, setAirtime] = useState(String(profile.airtime_balance));
  const [status, setStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = async () => {
    setStatus(null);
    try {
      await onUpdate({
        display_name: displayName.trim() || "User",
        initials: (initials.trim() || "U").slice(0, 3).toUpperCase(),
        balance: Number(balance) || 0,
        fuliza_balance: Number(fuliza) || 0,
        airtime_balance: Number(airtime) || 0,
      });
      setStatus("Saved");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Save failed");
    }
  };

  return (
    <section
      className="rounded-2xl bg-card p-4 space-y-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h2 className="text-base font-semibold text-foreground">Profile & Balances</h2>

      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-brand-red">{profile.initials}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
          >
            Upload logo
          </button>
          {profile.logo_url && (
            <button
              type="button"
              onClick={onClearLogo}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-destructive"
            >
              Remove
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) await onUploadLogo(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <Field label="Display name (e.g. Elvis)" value={displayName} onChange={setDisplayName} />
      <Field
        label="Initials (2–3 letters shown on home)"
        value={initials}
        onChange={(v) => setInitials(v.toUpperCase().slice(0, 3))}
      />
      <Field label="M-PESA Balance (Ksh)" value={balance} onChange={setBalance} type="number" />
      <Field
        label="Available Fuliza (Ksh)"
        value={fuliza}
        onChange={setFuliza}
        type="number"
      />
      <Field
        label="Airtime Balance (Ksh)"
        value={airtime}
        onChange={setAirtime}
        type="number"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
        >
          Save changes
        </button>
        {status && <span className="text-xs text-muted-foreground">{status}</span>}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
      />
    </label>
  );
}

function ContactsEditor() {
  const { contacts, add, remove } = useContacts();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [initials, setInitials] = useState("");

  const create = async () => {
    if (!name.trim()) return;
    const ini = (initials.trim() || name.replace(/[^A-Za-z]/g, "").slice(0, 2) || "?")
      .toUpperCase();
    await add({
      name: name.trim(),
      phone: phone.trim() || null,
      initials: ini,
      tint: "primary",
      is_favourite: true,
    });
    setName("");
    setPhone("");
    setInitials("");
  };

  return (
    <section
      className="rounded-2xl bg-card p-4 space-y-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h2 className="text-base font-semibold text-foreground">Send-money recipients</h2>
      <p className="text-xs text-muted-foreground">
        These names appear as favourites on the Send Money screen.
      </p>

      <div className="grid grid-cols-1 gap-2">
        {contacts.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl bg-muted p-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary text-xs font-bold">
              {c.initials}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
              {c.phone && (
                <p className="text-[11px] text-muted-foreground">{c.phone}</p>
              )}
            </div>
            <button
              onClick={() => remove(c.id)}
              className="text-xs font-semibold text-destructive"
            >
              Remove
            </button>
          </div>
        ))}
        {contacts.length === 0 && (
          <p className="text-xs text-muted-foreground">No recipients yet.</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          value={initials}
          onChange={(e) => setInitials(e.target.value)}
          placeholder="AB"
          maxLength={3}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-center uppercase"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (optional)"
          className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={create}
          className="rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground"
        >
          Add
        </button>
      </div>
    </section>
  );
}

type AdminUserRow = Awaited<ReturnType<typeof adminListUsers>>[number];

function SuperAdminUsers({ refreshSelf }: { refreshSelf: () => Promise<void> }) {
  const list = useServerFn(adminListUsers);
  const create = useServerFn(adminCreateUser);
  const del = useServerFn(adminDeleteUser);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [initials, setInitials] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const rows = await list();
      setUsers(rows);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to load users");
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setBusy(true);
    try {
      await create({
        data: {
          email: email.trim(),
          password,
          displayName: displayName.trim(),
          initials: initials.trim() || undefined,
        },
      });
      setStatus("User created");
      setEmail("");
      setPassword("");
      setDisplayName("");
      setInitials("");
      await load();
      await refreshSelf();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className="rounded-2xl bg-card p-4 space-y-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h2 className="text-base font-semibold text-foreground">Users</h2>

      <form onSubmit={submit} className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@email.com"
            className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            required
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6)"
            minLength={6}
            className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            value={initials}
            onChange={(e) => setInitials(e.target.value.toUpperCase())}
            placeholder="Initials"
            maxLength={3}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-center uppercase"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create user"}
        </button>
        {status && <p className="text-xs text-muted-foreground">{status}</p>}
      </form>

      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="rounded-xl bg-muted p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {u.display_name}{" "}
                  {u.roles.includes("super_admin") && (
                    <span className="ml-1 rounded bg-primary-soft px-1.5 py-0.5 text-[10px] text-primary">
                      SUPER
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
              </div>
              {!u.roles.includes("super_admin") && (
                <button
                  onClick={async () => {
                    await del({ data: { userId: u.id } });
                    await load();
                  }}
                  className="text-xs font-semibold text-destructive"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
              <BalancePill label="Balance" value={u.balance} />
              <BalancePill label="Fuliza" value={u.fuliza_balance} />
              <BalancePill label="Airtime" value={u.airtime_balance} />
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-xs text-muted-foreground">No users yet.</p>
        )}
      </div>
    </section>
  );
}

function BalancePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-background p-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-xs font-bold text-foreground">{formatKsh(value)}</p>
    </div>
  );
}
