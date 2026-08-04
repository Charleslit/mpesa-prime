import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/mpesa/MobileFrame";
import { BackBar } from "@/components/mpesa/TopBar";
import { getPendingSend, type PendingSend } from "@/lib/send-store";
import { formatKsh } from "@/hooks/use-balance";

export const Route = createFileRoute("/send/confirm")({
  head: () => ({
    meta: [
      { title: "Confirm — Send Money — M-PESA" },
      {
        name: "description",
        content:
          "Review the recipient, amount, transaction cost and interest fee before sending money on M-PESA.",
      },
      { property: "og:title", content: "Confirm transfer — M-PESA" },
      { property: "og:description", content: "Review the details before sending." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Confirm,
});

function Confirm() {
  const navigate = useNavigate();
  const [p, setP] = useState<PendingSend | null>(null);

  useEffect(() => {
    const found = getPendingSend();
    if (!found) navigate({ to: "/send" });
    else setP(found);
  }, [navigate]);

  if (!p) return null;

  return (
    <MobileFrame>
      <BackBar title="Confirm" to="/send" />

      <div className="flex-1 px-4 flex flex-col">
        <div className="mt-28 flex flex-col items-center">
          <div
            className="relative w-full rounded-2xl bg-card pt-16 pb-6 px-5"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[3px] rounded-full"
              style={{ background: "var(--gradient-card)" }}
            />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 h-20 w-20 rounded-full bg-surface-avatar flex items-center justify-center border border-border shadow-sm">
              <span className="text-lg font-bold text-brand-purple">
                {p.recipientInitials}
              </span>
            </div>

            <p className="text-center text-base font-medium text-foreground">
              Send money to mobile number
            </p>
            <div className="mt-5 divide-y divide-border">
              <Row label="Send to" value={p.recipientName} />
              <Row label="Amount" value={formatKsh(p.amount)} />
              <Row label="Transaction cost" value="N/A" />
              <Row label="Interest Fee" value="Ksh 0.05" />
            </div>
          </div>
        </div>

        <div className="mt-auto pb-6">
          <Link
            to="/send/pin"
            className="block w-full rounded-xl py-3.5 text-center text-base font-semibold text-primary-foreground"
            style={{ backgroundColor: "var(--brand-blue)" }}
          >
            Continue
          </Link>
        </div>
      </div>
    </MobileFrame>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-base font-bold text-foreground">{value}</p>
    </div>
  );
}
