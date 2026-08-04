import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/mpesa/MobileFrame";
import { CloseShareBar } from "@/components/mpesa/TopBar";
import {
  StarIcon,
  ReverseIcon,
  CalendarEditIcon,
  ReceiptIcon,
  CopyIcon,
} from "@/components/mpesa/icons";
import { getLastTx, type LastTx } from "@/lib/send-store";
import { formatKsh } from "@/hooks/use-balance";
import { MpesaSmsToast } from "@/components/mpesa/MpesaSmsToast";

export const Route = createFileRoute("/send/success")({
  head: () => ({
    meta: [
      { title: "Transaction successful — M-PESA" },
      {
        name: "description",
        content:
          "Your M-PESA transaction was successful. View the receipt, download it, schedule a repeat payment, or reverse the transaction.",
      },
      { property: "og:title", content: "Transaction successful — M-PESA" },
      { property: "og:description", content: "Transaction complete." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Success,
});

function Success() {
  const [tx, setTx] = useState<LastTx | null>(null);
  useEffect(() => setTx(getLastTx()), []);

  const dateStr = tx
    ? new Date(tx.createdAt).toLocaleString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <MobileFrame>
      {tx && <MpesaSmsToast tx={tx} delayMs={3000} />}
      <CloseShareBar />

      <div className="flex-1 px-4 flex flex-col">
        <div className="mt-28 flex flex-col items-center">
          <div
            className="relative w-full rounded-2xl bg-card pt-16 pb-6 px-5 text-center"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[3px] rounded-full"
              style={{ background: "var(--gradient-card)" }}
            />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 h-20 w-20 rounded-full bg-surface-avatar flex items-center justify-center border border-border shadow-sm text-3xl">
              🎉
            </div>
            <h1 className="text-2xl font-medium text-foreground leading-snug">
              Your transaction was
              <br />
              successful
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">{dateStr}</p>
            <p className="mt-4 text-3xl font-bold text-foreground">
              {tx ? formatKsh(tx.amount) : "—"}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Transaction cost:
              <span className="font-bold text-foreground">
                {" "}
                {tx ? formatKsh(tx.transactionCost) : "Ksh 0.00"}
              </span>
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary-soft px-3 py-1.5 text-sm font-bold text-primary">
              ID: {tx?.refCode ?? "—"}
              <span className="text-primary">
                <CopyIcon size={16} />
              </span>
              <span className="font-medium">Copy</span>
            </div>

            <div className="mt-5 rounded-xl bg-muted p-4 text-left">
              <p className="text-sm text-foreground">Send to:</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary text-sm font-bold">
                  {tx?.recipientInitials ?? "??"}
                </span>
                <div>
                  <p className="text-sm text-foreground">{tx?.recipientName ?? ""}</p>
                  <p className="text-xs text-muted-foreground">
                    Phone number: {tx?.recipientPhone ?? ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-2 text-center">
          <QuickAct Icon={StarIcon} label="Add to favourites" />
          <QuickAct Icon={ReverseIcon} label="Reverse transaction" />
          <QuickAct Icon={CalendarEditIcon} label="Schedule payment" />
          <QuickAct Icon={ReceiptIcon} label="Download receipt" />
        </div>

        <div className="mt-auto pb-6 pt-6">
          <Link
            to="/"
            className="block w-full rounded-xl bg-primary py-3.5 text-center text-base font-semibold text-primary-foreground"
          >
            Done
          </Link>
        </div>
      </div>
    </MobileFrame>
  );
}

function QuickAct({
  Icon,
  label,
}: {
  Icon: (p: { size?: number }) => import("react").ReactElement;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-primary">
        <Icon size={24} />
      </span>
      <span className="text-[11px] leading-tight text-foreground">{label}</span>
    </div>
  );
}
