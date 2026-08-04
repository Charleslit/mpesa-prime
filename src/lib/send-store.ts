// Session-scoped store for an in-progress Send Money transaction.
const KEY = "mpesa.pending-send";

export type PendingSend = {
  recipientName: string;
  recipientPhone: string;
  recipientInitials: string;
  amount: number;
};

export function setPendingSend(p: PendingSend) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}

export function getPendingSend(): PendingSend | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingSend) : null;
  } catch {
    return null;
  }
}

export function clearPendingSend() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}

const LAST_TX_KEY = "mpesa.last-tx";
export type LastTx = PendingSend & {
  refCode: string;
  createdAt: string;
  transactionCost: number;
};
export function setLastTx(t: LastTx) {
  try {
    sessionStorage.setItem(LAST_TX_KEY, JSON.stringify(t));
  } catch {}
}
export function getLastTx(): LastTx | null {
  try {
    const raw = sessionStorage.getItem(LAST_TX_KEY);
    return raw ? (JSON.parse(raw) as LastTx) : null;
  } catch {
    return null;
  }
}

export function makeRefCode() {
  const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "0123456789";
  let out = "";
  for (let i = 0; i < 4; i++) out += alpha[Math.floor(Math.random() * alpha.length)];
  for (let i = 0; i < 6; i++) out += digits[Math.floor(Math.random() * digits.length)];
  return out;
}
