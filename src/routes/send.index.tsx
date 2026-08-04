import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/mpesa/MobileFrame";
import { BackBar } from "@/components/mpesa/TopBar";
import { useProfile } from "@/hooks/use-profile";
import { useContacts } from "@/hooks/use-contacts";
import { formatKsh, DEFAULT_BALANCE } from "@/hooks/use-balance";
import { setPendingSend } from "@/lib/send-store";
import mpesaRedLeaf from "@/assets/mpesa-red-leaf.png";
import {
  ContactIcon,
  QrIcon,
  PeopleIcon,
  RequestMoneyIcon,
  InternationalIcon,
} from "@/components/mpesa/icons";

export const Route = createFileRoute("/send/")({
  head: () => ({
    meta: [
      { title: "Send Money — M-PESA" },
      {
        name: "description",
        content:
          "Send money to any mobile number using M-PESA or Shiriki Pay. Pick a favourite or enter a phone number to continue.",
      },
      { property: "og:title", content: "Send Money — M-PESA" },
      {
        property: "og:description",
        content: "Send money to any mobile number using M-PESA or Shiriki Pay.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SendMoney,
});

function SendMoney() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { contacts } = useContacts();
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [tab, setTab] = useState<"mobile" | "pochi">("mobile");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [showScanTip, setShowScanTip] = useState(false);

  useEffect(() => {
    const show = window.setTimeout(() => setShowScanTip(true), 600);
    const hide = window.setTimeout(() => setShowScanTip(false), 4600);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  const selected = contacts.find((c) => c.id === selectedContactId) ?? null;
  const effectivePhone = selected?.phone ?? phone;
  const effectiveName = selected?.name ?? (phone.length >= 9 ? phone : "");
  const effectiveInitials =
    selected?.initials ??
    (effectiveName.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "??");
  const amountNum = Number(amount);
  const balance =
    import.meta.env.DEV && !(profile && profile.balance > 0)
      ? DEFAULT_BALANCE
      : (profile?.balance ?? DEFAULT_BALANCE);
  const canContinue =
    !!effectiveName && effectivePhone.length >= 9 && amountNum > 0 && amountNum <= balance;

  const submit = () => {
    if (!canContinue) return;
    setPendingSend({
      recipientName: effectiveName,
      recipientPhone: effectivePhone,
      recipientInitials: effectiveInitials,
      amount: amountNum,
    });
    navigate({ to: "/send/confirm" });
  };

  return (
    <MobileFrame>
      <BackBar title="Send Money" />

      <div className="px-4">
        <div className="mt-2 flex rounded-md bg-muted p-1">
          {(["mobile", "pochi"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`flex-1 rounded-sm py-2.5 text-sm font-semibold transition ${
                tab === k
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70"
              }`}
            >
              {k === "mobile" ? "Mobile number" : "Pochi la Biashara"}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Favourites</h2>
          <span className="text-sm font-medium text-primary">
            {contacts.length} saved
          </span>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2 text-center">
          <div className="flex flex-col items-center gap-1.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-primary text-primary text-xl font-light">
              +
            </span>
            <span className="text-[11px] text-foreground">Add</span>
          </div>
          {contacts.slice(0, 4).map((f) => {
            const active = f.id === selectedContactId;
            return (
              <button
                key={f.id}
                onClick={() => {
                  setSelectedContactId(active ? null : f.id);
                  if (!active && f.phone) setPhone(f.phone);
                }}
                className="flex flex-col items-center gap-1.5"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary-soft text-primary"
                  }`}
                >
                  {f.initials}
                </span>
                <span className="text-[11px] leading-tight text-foreground line-clamp-1">
                  {f.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <label className="text-sm text-foreground">Enter Phone Number</label>
          <div className="relative mt-2 flex items-center gap-2.5 overflow-visible rounded-xl border border-border bg-background px-4 py-3">
            <input
              inputMode="numeric"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setSelectedContactId(null);
              }}
              placeholder="Enter phone number"
              className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            <button type="button" className="shrink-0" aria-label="Contacts">
              <ContactIcon size={24} />
            </button>
            <span className="h-6 w-px shrink-0 bg-border" />
            <div className="relative shrink-0">
              <button
                type="button"
                className="relative flex items-center justify-center"
                aria-label="Scan QR"
                onClick={() => setShowScanTip((v) => !v)}
              >
                <QrIcon size={24} />
              </button>
              {showScanTip && (
                <div
                  role="tooltip"
                  className="absolute top-[calc(100%+10px)] right-0 z-20 whitespace-nowrap rounded-full bg-[#2b2f33] px-3.5 py-1.5 text-xs font-medium text-white shadow-md"
                >
                  Scan to send
                  <span
                    aria-hidden
                    className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 bg-[#2b2f33]"
                  />
                </div>
              )}
            </div>
          </div>
          {effectiveName && (
            <p className="mt-2 text-sm font-semibold text-primary">
              {effectiveName}
            </p>
          )}
        </div>

        <div className="mt-5">
          <label className="text-sm text-foreground">Enter Amount</label>
          <div
            className={`mt-2 flex items-center rounded-sm border bg-background px-4 py-3 ${
              amount ? "border-primary" : "border-border"
            }`}
          >
            <input
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              placeholder="0"
              className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            <span className="text-sm text-muted-foreground">Ksh</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Balance: {formatKsh(balance)} · Fuliza:{" "}
            {formatKsh(profile?.fuliza_balance ?? 0)}
          </p>
          {amountNum > 0 && amountNum > balance && (
            <p className="mt-1 text-xs font-semibold text-destructive">
              Amount exceeds available balance.
            </p>
          )}
        </div>

        <h2 className="mt-6 text-base font-bold text-foreground">
          Select Payment Method
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="relative overflow-hidden rounded-sm border border-primary bg-primary-soft/50 p-3">
            {/* Diagonal selected corner (dog-ear) */}
            <span
              aria-hidden
              className="pointer-events-none absolute top-0 right-0 h-7 w-7 bg-primary"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute top-[3px] right-[4px] text-[10px] font-bold leading-none text-white"
            >
              ✓
            </span>
            <div className="flex items-center gap-2">
              <img
                src={typeof mpesaRedLeaf === "string" ? mpesaRedLeaf : "/mpesa-red-leaf.png"}
                alt=""
                className="h-6 w-6 object-contain shrink-0"
                draggable={false}
              />
              <div>
                <p className="text-sm font-bold text-foreground">M-PESA</p>
                <p className="text-xs text-muted-foreground">
                  Bal. {formatKsh(balance)}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-sm border border-border bg-background p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-primary text-xs font-bold">
                S
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">Shiriki Pay</p>
                <p className="text-xs text-muted-foreground">Select</p>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!canContinue}
          className={`mt-6 block w-full rounded-sm py-3.5 text-center text-base font-semibold ${
            canContinue
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          Continue
        </button>

        <h2 className="mt-6 text-base font-bold text-foreground">Do More</h2>
        <div className="mt-3 mb-6 grid grid-cols-3 gap-3">
          <DoMore Icon={PeopleIcon} label={"Send to\nMany"} colored />
          <DoMore Icon={RequestMoneyIcon} label={"Request\nMoney"} colored />
          <DoMore Icon={InternationalIcon} label={"International\nTransfers"} colored />
        </div>
      </div>
    </MobileFrame>
  );
}

function DoMore({
  Icon,
  label,
  colored,
}: {
  Icon: (p: { size?: number }) => import("react").ReactElement;
  label: string;
  colored?: boolean;
}) {
  return (
    <div
      className="rounded-sm bg-card p-3 flex flex-col items-center gap-2 text-center overflow-visible"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <span className={`overflow-visible ${colored ? "" : "text-primary"}`}>
        <Icon size={32} />
      </span>
      <span className="text-xs leading-tight text-foreground whitespace-pre-line">
        {label}
      </span>
    </div>
  );
}
