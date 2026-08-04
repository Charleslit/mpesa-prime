import { useEffect, useMemo, useState } from "react";
import type { LastTx } from "@/lib/send-store";
import { formatKsh } from "@/hooks/use-balance";

type Props = {
  tx: LastTx;
  delayMs?: number;
};

export function MpesaSmsToast({ tx, delayMs = 3000 }: Props) {
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const showTimer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(showTimer);
  }, [delayMs]);

  useEffect(() => {
    if (!visible) return;
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [visible]);

  const { timeLabel, body } = useMemo(() => buildMessage(tx), [tx]);

  if (!visible) return null;

  const dismiss = () => {
    setEntered(false);
    window.setTimeout(() => setVisible(false), 220);
  };

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-50 px-3 pt-3"
      role="status"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto origin-top rounded-[1.35rem] px-3.5 pb-3 pt-3 shadow-lg transition-all duration-300 ease-out ${
          entered
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-4 opacity-0 scale-[0.98]"
        }`}
        style={{
          background:
            "linear-gradient(180deg, rgba(214, 232, 248, 0.96) 0%, rgba(236, 244, 252, 0.97) 45%, rgba(248, 250, 252, 0.98) 100%)",
          boxShadow:
            "0 10px 28px rgba(15, 23, 42, 0.18), 0 1px 0 rgba(255,255,255,0.65) inset",
        }}
      >
        <div className="flex items-start gap-2.5">
          <div className="relative mt-0.5 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#cfd6dd] text-[#6b7680]">
              <PersonSilhouette />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#1a73e8] ring-2 ring-white">
              <MessageBadge />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-[15px] font-semibold leading-none text-[#1a1c1e]">
                MPESA
              </p>
              <p className="text-[12px] leading-none text-[#5f6368]">{timeLabel}</p>
              <button
                type="button"
                onClick={dismiss}
                className="ml-auto text-[#5f6368]"
                aria-label="Collapse notification"
              >
                <ChevronDown />
              </button>
            </div>

            <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-[#202124]">
              {body}
            </p>

            <div className="mt-2.5">
              <button
                type="button"
                onClick={dismiss}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-medium text-[#202124] shadow-sm ring-1 ring-black/5"
              >
                <ChromeMark />
                Open link
              </button>
            </div>

            <div className="relative mt-2.5 flex items-center justify-center">
              <button
                type="button"
                onClick={dismiss}
                className="text-[13px] font-medium text-[#202124]"
              >
                Mark as read
              </button>
              <span className="absolute right-0 text-[#5f6368]">
                <CollapseIcon />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildMessage(tx: LastTx) {
  const created = new Date(tx.createdAt);
  const timeLabel = created.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const datePart = created
    .toLocaleDateString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "2-digit",
    })
    .replace(/\//g, "/");

  const amount = formatKsh(tx.amount).replace("Ksh ", "Ksh");
  const body = `${tx.refCode} Confirmed. ${amount} sent to ${tx.recipientName} ${tx.recipientPhone} on ${datePart} at ${timeLabel}. New M-PESA balance is Ksh…`;

  return { timeLabel, body };
}

function PersonSilhouette() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function MessageBadge() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="white" aria-hidden>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8A2.5 2.5 0 0 1 17.5 16H10l-4.2 3.2c-.7.5-1.8 0-1.8-.9V5.5Z" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChromeMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden>
      <circle cx="24" cy="24" r="20" fill="#fff" />
      <path
        fill="#EA4335"
        d="M24 8c6.1 0 11.4 3.4 14.1 8.4L29.3 24H24V8z"
      />
      <path
        fill="#FBBC04"
        d="M9.9 16.4C12.6 11.4 17.9 8 24 8v16H9.9z"
        transform="rotate(120 24 24)"
      />
      <path
        fill="#34A853"
        d="M9.9 16.4C12.6 11.4 17.9 8 24 8v16H9.9z"
        transform="rotate(240 24 24)"
      />
      <circle cx="24" cy="24" r="8.5" fill="#fff" />
      <circle cx="24" cy="24" r="6.2" fill="#4285F4" />
    </svg>
  );
}

function CollapseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M14 10l-4 4M10 10h4v4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
