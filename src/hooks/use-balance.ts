import { useEffect, useState } from "react";

const KEY = "mpesa.balance";
/** Default M-PESA balance used when no profile is loaded (dev-friendly amount). */
export const DEFAULT_BALANCE = import.meta.env.DEV ? 400_000 : 0;

export function useBalance() {
  const [balance, setBalance] = useState<number>(DEFAULT_BALANCE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw !== null) {
        const n = Number(raw);
        if (Number.isFinite(n)) setBalance(n);
      } else if (import.meta.env.DEV) {
        setBalance(DEFAULT_BALANCE);
      }
    } catch {}
    setHydrated(true);
  }, []);

  const update = (n: number) => {
    setBalance(n);
    try {
      localStorage.setItem(KEY, String(n));
    } catch {}
  };

  return { balance, setBalance: update, hydrated };
}

export function formatKsh(n: number) {
  return `Ksh ${n.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
