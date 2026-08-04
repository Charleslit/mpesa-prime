import { createFileRoute } from "@tanstack/react-router";
import { MobileFrame } from "@/components/mpesa/MobileFrame";
import { BackBar } from "@/components/mpesa/TopBar";
import { SearchIcon } from "@/components/mpesa/icons";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — Do more with M-PESA" },
      {
        name: "description",
        content:
          "Explore financial services, entertainment, utilities, betting, insurance and travel — all in one place with M-PESA.",
      },
      { property: "og:title", content: "Discover — M-PESA" },
      {
        property: "og:description",
        content: "Pay, book, learn and earn in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Discover,
});

const finances = [
  { label: "ZiiDi Trader", bg: "oklch(0.94 0.03 145)" },
  { label: "ZiiDi Invest & Save", bg: "oklch(0.97 0.04 145)" },
  { label: "Tuunza Mapato", bg: "oklch(0.62 0.18 145)", dark: true },
  { label: "ShirikiPay", bg: "oklch(0.96 0.05 27)" },
];

const entertainment = [
  { label: "Baze", bg: "oklch(0.94 0.05 350)" },
  { label: "Games", bg: "oklch(0.94 0.05 60)" },
  { label: "Newspaper", bg: "oklch(0.94 0.03 50)" },
];

const more = [
  { label: "Financial Services", emoji: "💰" },
  { label: "Insure and Protect", emoji: "🛡️" },
  { label: "Events & Tickets", emoji: "🎫" },
  { label: "Pay for Utilities", emoji: "💡" },
  { label: "Betting", emoji: "🎮" },
  { label: "Book & Travel", emoji: "🚌" },
];

function Discover() {
  return (
    <MobileFrame>
      <BackBar title="Discover" />

      <main className="flex-1 bg-muted px-4 pb-8 space-y-4">
        <Card title="My Finances" viewAll>
          <div className="flex gap-3 overflow-x-auto -mx-2 px-2 scrollbar-none">
            {finances.map((f) => (
              <div key={f.label} className="shrink-0 w-20 text-center">
                <div
                  className="h-16 w-16 rounded-2xl flex items-center justify-center text-[10px] font-bold text-center p-1 leading-tight"
                  style={{
                    backgroundColor: f.bg,
                    color: f.dark ? "white" : "var(--foreground)",
                  }}
                >
                  {f.label}
                </div>
                <p className="mt-1.5 text-xs leading-tight text-foreground">
                  {f.label}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Entertainment">
          <div className="flex gap-4">
            {entertainment.map((e) => (
              <div key={e.label} className="text-center">
                <div
                  className="h-16 w-16 rounded-2xl flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: e.bg }}
                >
                  {e.label[0]}
                </div>
                <p className="mt-1.5 text-xs text-foreground">{e.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Do more with M-PESA
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Pay, book, learn, and earn in one place.
              </p>
            </div>
            <span className="text-primary">
              <SearchIcon size={20} />
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {more.map((m) => (
              <div
                key={m.label}
                className="rounded-2xl bg-muted p-3 flex flex-col justify-between h-24"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg" aria-hidden>
                    {m.emoji}
                  </span>
                  <p className="text-sm font-bold text-foreground leading-tight">
                    {m.label}
                  </p>
                </div>
                <div className="flex -space-x-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-5 w-5 rounded-full border-2 border-muted"
                      style={{
                        background: [
                          "var(--brand-red)",
                          "var(--primary)",
                          "oklch(0.85 0.15 90)",
                        ][i],
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </MobileFrame>
  );
}

function Card({
  children,
  title,
  viewAll,
}: {
  children: React.ReactNode;
  title?: string;
  viewAll?: boolean;
}) {
  return (
    <section
      className="rounded-2xl bg-card p-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {title && (
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          {viewAll && (
            <button className="text-sm font-medium text-primary">
              View all ›
            </button>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
