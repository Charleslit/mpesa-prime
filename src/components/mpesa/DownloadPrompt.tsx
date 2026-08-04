import { useEffect, useState } from "react";
import { useSession } from "@/hooks/use-session";
import { DownloadIcon, XIcon } from "@/components/mpesa/icons";

const STORAGE_KEY = "mpesa_download_prompt_dismissed";

export function DownloadPrompt() {
  const { user } = useSession();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    try {
      const dismissed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (!dismissed[user.id]) {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, [user]);

  if (!open || !user) return null;

  const dismiss = () => {
    try {
      const dismissed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      dismissed[user.id] = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
    } catch {
      // ignore
    }
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6 sm:items-center sm:pb-0">
      <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <DownloadIcon size={22} />
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <XIcon size={20} />
          </button>
        </div>

        <h2 className="mt-4 text-lg font-bold text-foreground">
          Get the M-PESA app
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Install this app on your Android phone for the best experience. Tap
          download to get the APK, then open the file and allow install from
          this browser if prompted.
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <a
            href="/downloads/mpesa.apk"
            download="mpesa.apk"
            className="w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground"
          >
            Download app
          </a>
          <button
            type="button"
            onClick={dismiss}
            className="w-full rounded-xl border border-border py-3 text-sm font-semibold text-foreground"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
