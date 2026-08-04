import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MobileFrame } from "@/components/mpesa/MobileFrame";
import { useProfile } from "@/hooks/use-profile";
import { formatKsh, DEFAULT_BALANCE } from "@/hooks/use-balance";
import {
  BellIcon,
  SearchIcon,
  EyeOffIcon,
  SendMoneyIcon,
  LipaIcon,
  WithdrawIcon,
  BundlesIcon,
  InternationalIcon,
  AirtimeIcon,
  TunukiwaIcon,
  HomeInternetIcon,
  ChevronRightIcon,
} from "@/components/mpesa/icons";
import ziidiTraderDeal from "@/assets/ziidi-trader-deal.png";
import funtabuDeal from "@/assets/funtabu-deal.png";
import shellClubHost from "@/assets/shell-club-host.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My oneAPP" },
      {
        name: "description",
        content:
          "M-PESA home: balance, quick actions and shortcuts to send money, pay bills, withdraw, and buy bundles.",
      },
      { property: "og:title", content: "My oneAPP" },
      {
        property: "og:description",
        content: "M-PESA home: balance, quick actions and shortcuts to send money, pay bills, withdraw, and buy bundles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

type Action = {
  label: string;
  Icon: (p: { size?: number }) => import("react").ReactElement;
  to: string;
};

const actions: Action[] = [
  { label: "Send Money", Icon: SendMoneyIcon, to: "/send" },
  { label: "Lipa na M-PESA", Icon: LipaIcon, to: "/discover" },
  { label: "Withdraw\nMoney", Icon: WithdrawIcon, to: "/discover" },
  { label: "Buy Bundles", Icon: BundlesIcon, to: "/discover" },
  { label: "International Transfers", Icon: InternationalIcon, to: "/discover" },
  { label: "Airtime Top Up", Icon: AirtimeIcon, to: "/discover" },
  { label: "Tunukiwa Bundles", Icon: TunukiwaIcon, to: "/discover" },
  { label: "Home Internet", Icon: HomeInternetIcon, to: "/discover" },
];

function Home() {
  const { profile, logoDisplayUrl } = useProfile();
  const navigate = useNavigate();
  const tapsRef = useRef<{ count: number; last: number }>({ count: 0, last: 0 });

  const handleAvatarTap = () => {
    const now = Date.now();
    if (now - tapsRef.current.last > 800) tapsRef.current.count = 0;
    tapsRef.current.last = now;
    tapsRef.current.count += 1;
    if (tapsRef.current.count >= 3) {
      tapsRef.current.count = 0;
      navigate({ to: "/admin" });
    }
  };

  const displayName = profile?.display_name ?? "Elvis";
  const initials = profile?.initials ?? "EJ";
  const balance =
    import.meta.env.DEV && !(profile && profile.balance > 0)
      ? DEFAULT_BALANCE
      : (profile?.balance ?? DEFAULT_BALANCE);
  const fuliza = profile?.fuliza_balance ?? 463.91;
  const airtime = profile?.airtime_balance ?? 0;

  return (
    <MobileFrame>
      <header className="flex items-center justify-between px-4 pt-2 pb-4 bg-background">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAvatarTap}
            aria-label="Profile (tap 3 times to open admin)"
            className="relative h-11 w-11 rounded-full bg-accent flex items-center justify-center overflow-hidden"
          >
            {logoDisplayUrl ? (
              <img src={logoDisplayUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-brand-red">{initials}</span>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-background flex items-center justify-center">
              <ChevronRightIcon size={10} />
            </span>
          </button>
          <div>
            <p className="text-xs text-muted-foreground">Good morning,</p>
            <p className="text-base font-semibold text-foreground">
              {displayName} <span aria-hidden>👋</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border text-primary"
            aria-label="Notifications"
          >
            <BellIcon size={20} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
          </button>
          <Link
            to="/discover"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border text-primary"
            aria-label="Search"
          >
            <SearchIcon size={20} />
          </Link>
        </div>
      </header>

      <main className="flex-1 bg-muted px-4 pb-8 space-y-4">
        <div className="flex gap-3 overflow-x-auto -mx-4 px-4 snap-x scrollbar-none">
          <BalanceCard active amount={formatKsh(balance)} fuliza={fuliza} />
          <BalanceCard
            title="My Balance"
            subtitle="Airtime"
            amount={formatKsh(airtime)}
            small
          />
        </div>
        <div className="flex justify-center gap-1">
          <span className="h-1.5 w-6 rounded-full bg-primary" />
          <span className="h-1.5 w-3 rounded-full bg-border" />
        </div>

        <section
          className="rounded-2xl bg-card p-4"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">
              Quick Actions
            </h2>
            <Link
              to="/discover"
              className="flex items-center gap-1 text-sm font-medium text-primary"
            >
              View all <ChevronRightIcon size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-y-5 gap-x-2">
            {actions.map(({ label, Icon, to }) => (
              <Link
                key={label}
                to={to}
                className="flex flex-col items-center gap-1.5 text-center"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-primary">
                  <Icon size={31} />
                </span>
                <span className="text-[11px] leading-tight text-foreground whitespace-pre-line">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <button
          type="button"
          className="w-full rounded-2xl bg-card p-4 flex items-center justify-between"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <span className="text-base font-semibold text-foreground">
            Frequents
          </span>
          <ChevronRightIcon size={18} />
        </button>

        <section className="relative">
          <h2 className="mb-3 text-base font-semibold text-foreground">
            Explore &amp; Discover Deals <span aria-hidden>🔥</span>
          </h2>
          <img
            src={shellClubHost}
            alt=""
            aria-hidden
            className="pointer-events-none absolute top-[7px] right-1 z-20 h-[77px] w-[77px] rounded-[20%] object-contain object-bottom drop-shadow-md"
          />
          <DealsCarousel />
        </section>
      </main>
    </MobileFrame>
  );
}

function DealsCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const pauseUntilRef = useRef(0);
  const [active, setActive] = useState(0);
  const slideCount = 3;

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const syncIndex = () => {
      const slide = el.querySelector<HTMLElement>("[data-deal-slide]");
      if (!slide) return;
      const step = slide.offsetWidth + 12; // gap-3
      const next = Math.round(el.scrollLeft / step);
      indexRef.current = Math.min(Math.max(next, 0), slideCount - 1);
      setActive(indexRef.current);
    };

    el.addEventListener("scroll", syncIndex, { passive: true });
    return () => el.removeEventListener("scroll", syncIndex);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return;
      const el = scrollerRef.current;
      if (!el) return;
      const slide = el.querySelector<HTMLElement>("[data-deal-slide]");
      if (!slide) return;
      const step = slide.offsetWidth + 12;
      const next = (indexRef.current + 1) % slideCount;
      indexRef.current = next;
      setActive(next);
      el.scrollTo({ left: next * step, behavior: "smooth" });
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  const pauseAuto = () => {
    pauseUntilRef.current = Date.now() + 5000;
  };

  return (
    <div>
      <div
        ref={scrollerRef}
        onPointerDown={pauseAuto}
        onTouchStart={pauseAuto}
        className="flex gap-3 overflow-x-auto -mx-4 px-4 snap-x snap-mandatory scrollbar-none"
      >
        <div
          data-deal-slide
          className="snap-start shrink-0 w-[92%] overflow-hidden rounded-2xl h-40"
        >
          <img
            src={ziidiTraderDeal}
            alt="ZiiDi Trader — Unataka Kununua Shares?"
            className="h-full w-full object-cover object-left"
          />
        </div>
        <div
          data-deal-slide
          className="snap-start shrink-0 w-[92%] overflow-hidden rounded-2xl h-40"
        >
          <img
            src={funtabuDeal}
            alt="FUNTABU — The newest and coolest ebook platform"
            className="h-full w-full object-cover object-center"
          />
        </div>
        <div
          data-deal-slide
          className="snap-start shrink-0 w-[92%] relative overflow-hidden rounded-2xl bg-[oklch(0.88_0.18_95)] p-5 h-40"
        >
          <p className="text-xs font-bold text-destructive">Shell Club</p>
          <p className="mt-1 text-2xl font-extrabold text-destructive leading-none">
            Unlock <br />
            <span className="text-4xl">More</span>
            <br />
            <span className="italic text-background">Surprises</span>
          </p>
          <p className="absolute bottom-4 right-4 text-[10px] font-semibold text-background max-w-[140px]">
            MAKE EVERY VISIT COUNT WITH SHELL CLUB
          </p>
        </div>
      </div>
      <div className="mt-2 flex justify-center gap-1.5" aria-hidden>
        {Array.from({ length: slideCount }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              i === active ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function BalanceCard({
  title = "M-PESA Balance",
  subtitle,
  amount = "Ksh 0.00",
  small = false,
  active = false,
  fuliza,
}: {
  title?: string;
  subtitle?: string;
  amount?: string;
  small?: boolean;
  active?: boolean;
  fuliza?: number;
}) {
  return (
    <div
      className={`snap-start shrink-0 ${small ? "w-[80%]" : "w-[92%]"} rounded-2xl bg-card p-4 relative overflow-hidden`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Green → cyan left accent */}
      <div
        className="absolute inset-y-0 left-0 w-1.5 rounded-r-lg"
        style={{ background: "var(--gradient-card)" }}
      />

      {/*
        Mesh wraps title → statements button.
        -mx-4 makes the pattern full-bleed to the card’s left/right edges;
        content keeps px-4. Clipped so it ends at the button bottom.
      */}
      <div className="relative z-[1] -mx-4 overflow-hidden px-4">
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[16%] bottom-0 w-full opacity-[0.28]"
          viewBox="0 0 360 160"
          preserveAspectRatio="none"
        >
          {/* Sparse diagonal low-poly wireframe — spans full card width */}
          <g fill="none" stroke="#D0D4DA" strokeWidth="0.65" strokeLinejoin="miter">
            {/* Long diagonals spanning full width */}
            <path d="M0 48L120 12L240 56L360 20" />
            <path d="M0 96L90 58L210 110L360 64" />
            <path d="M0 140L150 88L280 148L360 112" />
            <path d="M0 20L80 70L180 28L300 90L360 42" />
            <path d="M40 0L160 70L260 18L360 78" />
            <path d="M0 72L110 130L220 74L360 150" />

            {/* Crossing connectors that form irregular triangles / quads */}
            <path d="M60 8L40 90L100 150" />
            <path d="M100 0L140 80L100 160" />
            <path d="M170 6L190 95L160 158" />
            <path d="M230 0L250 88L220 160" />
            <path d="M290 10L310 100L280 156" />
            <path d="M330 4L350 92L340 160" />

            <path d="M20 40L70 20L95 55L50 78Z" />
            <path d="M115 30L165 18L185 60L135 72Z" />
            <path d="M205 40L255 22L275 68L225 82Z" />
            <path d="M295 35L345 18L360 55L320 78Z" />

            <path d="M30 100L75 85L100 125L55 140Z" />
            <path d="M130 95L180 80L200 125L150 138Z" />
            <path d="M215 100L270 88L290 130L235 145Z" />
            <path d="M310 95L360 82L360 130L325 145Z" />
          </g>
        </svg>

        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="pl-2 text-sm font-semibold text-primary">{title}</p>
              {subtitle && (
                <p className="pl-2 mt-1 text-sm text-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="pl-2 mt-2 flex items-center gap-2">
            <p className="text-2xl font-bold text-foreground">{amount}</p>
            {active && (
              <span className="text-muted-foreground">
                <EyeOffIcon size={18} />
              </span>
            )}
          </div>
          {active && fuliza !== undefined && (
            <>
              <p className="pl-2 mt-1 text-xs text-muted-foreground">
                Available Fuliza: {formatKsh(fuliza)}
              </p>
              <button
                type="button"
                className="mt-3 w-full rounded-xl border border-primary bg-card/70 py-2.5 text-sm font-semibold text-primary backdrop-blur-[1px]"
              >
                View Statements
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
