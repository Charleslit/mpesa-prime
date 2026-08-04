import type { ReactNode } from "react";

export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-muted flex items-start md:items-center justify-center md:py-10">
      <div
        className="relative w-full max-w-[420px] min-h-screen md:min-h-0 md:h-[860px] md:rounded-[2.5rem] bg-background overflow-hidden md:border-8 md:border-foreground/90"
        style={{ boxShadow: "var(--shadow-frame)" }}
      >
        <div className="flex h-full flex-col overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

