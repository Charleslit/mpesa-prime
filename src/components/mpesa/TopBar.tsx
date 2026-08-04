import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ChevronLeftIcon, XIcon, UploadIcon } from "./icons";

export function BackBar({
  title,
  to = "/",
  right,
}: {
  title: string;
  to?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <Link
        to={to}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground"
        aria-label="Back"
      >
        <ChevronLeftIcon size={20} />
      </Link>
      <h1 className="text-base font-semibold text-foreground">{title}</h1>
      <div className="w-9 flex justify-end">{right}</div>
    </div>
  );
}

export function CloseShareBar({ to = "/" }: { to?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <Link
        to={to}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-destructive"
        aria-label="Close"
      >
        <XIcon size={20} />
      </Link>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-primary"
        aria-label="Share"
      >
        <UploadIcon size={20} />
      </button>
    </div>
  );
}
