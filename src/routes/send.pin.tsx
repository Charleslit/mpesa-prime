import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/mpesa/MobileFrame";
import { BackBar } from "@/components/mpesa/TopBar";
import { FingerprintIcon, BackspaceIcon } from "@/components/mpesa/icons";
import { formatKsh } from "@/hooks/use-balance";
import {
  clearPendingSend,
  getPendingSend,
  makeRefCode,
  setLastTx,
  type PendingSend,
} from "@/lib/send-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/send/pin")({
  head: () => ({
    meta: [
      { title: "Enter M-PESA PIN" },
      {
        name: "description",
        content:
          "Authorize the transaction by entering your 4-digit M-PESA PIN or using biometrics.",
      },
      { property: "og:title", content: "Enter M-PESA PIN" },
      { property: "og:description", content: "Authorize the transaction securely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PinScreen,
});

function PinScreen() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [p, setP] = useState<PendingSend | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const found = getPendingSend();
    if (!found) navigate({ to: "/send" });
    else setP(found);
  }, [navigate]);

  const submit = async () => {
    if (!p || processing) return;
    setProcessing(true);
    setError(null);
    try {
      const ref = makeRefCode();
      const { error: rpcError } = await supabase.rpc("send_money", {
        _recipient_name: p.recipientName,
        _recipient_phone: p.recipientPhone,
        _amount: p.amount,
        _ref_code: ref,
      });
      if (rpcError) throw rpcError;
      setLastTx({
        ...p,
        refCode: ref,
        createdAt: new Date().toISOString(),
        transactionCost: 0,
      });
      clearPendingSend();
      navigate({ to: "/send/success" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transaction failed");
      setPin("");
      setProcessing(false);
    }
  };

  const press = (v: string) => {
    if (processing) return;
    if (v === "del") return setPin((prev) => prev.slice(0, -1));
    if (v === "bio") return submit();
    setPin((prev) => {
      const next = (prev + v).slice(0, 4);
      if (next.length === 4) setTimeout(submit, 200);
      return next;
    });
  };

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["bio", "0", "del"],
  ];

  return (
    <MobileFrame>
      <BackBar title="Enter M-PESA PIN" to="/send/confirm" />

      <div className="flex-1 flex flex-col">
        <div className="mt-4 flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-[oklch(0.97_0.03_320)] flex items-center justify-center">
            <span className="text-base font-bold text-brand-purple">
              {p?.recipientInitials ?? "??"}
            </span>
          </div>
          <p className="mt-3 text-lg text-foreground">
            {p?.recipientName ?? ""}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {p ? formatKsh(p.amount) : ""} &nbsp; Fee: Ksh 0.00
          </p>

          <div className="mt-5 flex gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 w-12 rounded-lg border-2 border-primary flex items-center justify-center"
              >
                {pin.length > i && (
                  <span className="h-3 w-3 rounded-full bg-primary" />
                )}
              </div>
            ))}
          </div>
          {error && (
            <p className="mt-4 text-sm font-semibold text-destructive px-6 text-center">
              {error}
            </p>
          )}
          {processing && !error && (
            <p className="mt-4 text-sm text-muted-foreground">Processing…</p>
          )}
        </div>

        <div className="mt-auto grid grid-cols-3 gap-y-6 px-8 pb-10 pt-10">
          {keys.flat().map((k, i) => (
            <button
              key={i}
              type="button"
              onClick={() => press(k)}
              className="flex items-center justify-center text-3xl font-light text-foreground h-12"
              aria-label={k === "bio" ? "Biometrics" : k === "del" ? "Delete" : k}
            >
              {k === "bio" ? (
                <span className="text-brand-red">
                  <FingerprintIcon size={28} />
                </span>
              ) : k === "del" ? (
                <span className="text-primary">
                  <BackspaceIcon size={28} />
                </span>
              ) : (
                k
              )}
            </button>
          ))}
        </div>
      </div>
    </MobileFrame>
  );
}
