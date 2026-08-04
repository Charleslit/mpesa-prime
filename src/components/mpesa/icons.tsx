import type { SVGProps } from "react";
import mpesaRedLeaf from "@/assets/mpesa-red-leaf.png";

// Shared outline SVG icons for the M-PESA-style app.
// All icons share: 24x24 viewBox, stroke=currentColor, 1.6 stroke width,
// rounded caps/joins, no fill. Green comes from `text-primary` on the parent.

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (p: IconProps) => ({
  width: p.size ?? 24,
  height: p.size ?? 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});

export const SendMoneyIcon = (p: IconProps) => (
  <svg {...base(p)}>
    {/* Navigation arrow / paper-plane silhouette (Telegram-style) */}
    <path d="M20.3 4.2a1 1 0 0 0-1.1-.2L4.5 10.3c-.9.4-.9 1.7 0 2.1l5 2 2 5c.4.9 1.7.9 2.1 0l6.9-14.1a1 1 0 0 0-.2-1.1Z" />
    {/* Short red accent line on the inner (lower-left) side */}
    <path d="M9.8 14.2 12.5 11.5" stroke="#e60028" strokeWidth={1.6} />
  </svg>
);

export const LipaIcon = (p: IconProps) => (
  <svg {...base(p)}>
    {/* Red arched handle */}
    <path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="#e60028" />
    {/* Green basket body with tapered sides */}
    <path d="M3.5 10.5h17l-1.6 8.2a2 2 0 0 1-2 1.6H7.1a2 2 0 0 1-2-1.6L3.5 10.5Z" />
    {/* Vertical ribs inside basket */}
    <path d="M9 13.5v4M12 13.5v4M15 13.5v4" />
  </svg>
);

export const WithdrawIcon = (p: IconProps) => {
  const { size = 24, ...rest } = p;
  const green = "#4CAF50";
  const red = "#D32F2F";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      {...rest}
    >
      {/*
        Green wallet (~2× wider than tall):
        full rounded body with a break at the bottom-right for the arrow.
      */}
      <path
        d="M15.2 17H5.8A2.8 2.8 0 0 1 3 14.2V8.8A2.8 2.8 0 0 1 5.8 6h12.4A2.8 2.8 0 0 1 21 8.8v3.4"
        stroke={green}
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Left latch / flap (~1/4 wallet width), vertically centered */}
      <rect
        x="5.1"
        y="8.4"
        width="3.6"
        height="6.2"
        rx="1"
        stroke={green}
        strokeWidth="1.75"
      />
      {/* Snap button in the latch center */}
      <circle
        cx="6.9"
        cy="11.5"
        r="1.05"
        stroke={green}
        strokeWidth="1.5"
      />

      {/* Hollow red down-arrow in the open bottom-right corner */}
      <path
        d="M15.7 9.4h3v4.2h1.45L17.2 18.1 14.2 13.6h1.5Z"
        stroke={red}
        strokeWidth="1.55"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const BundlesIcon = (p: IconProps) => {
  const { size = 24, ...rest } = p;
  const green = "#4CAF50";
  const red = "#E60028";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      {...rest}
    >
      {/* Green digit “1” (upright): top-left flag + vertical stem */}
      <path
        d="M6.2 7.2 9.4 4.4V19.2"
        stroke={green}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Red digit “1” upside down: vertical stem + bottom-right flag */}
      <path
        d="M14.6 4.8V19.6L17.8 16.8"
        stroke={red}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const InternationalIcon = (p: IconProps) => {
  const { size = 32, className, ...rest } = p;
  const green = "#2F9E44";
  const leafSrc =
    typeof mpesaRedLeaf === "string" ? mpesaRedLeaf : "/mpesa-red-leaf.png";
  return (
    <span
      className={className}
      style={{
        position: "relative",
        display: "inline-block",
        width: size,
        height: size,
        flexShrink: 0,
        overflow: "visible",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden
        {...rest}
      >
        <circle cx="22" cy="22" r="16.5" stroke={green} strokeWidth="2.35" />
        <path d="M5.5 22h33" stroke={green} strokeWidth="2.1" />
        <path d="M22 5.5v33" stroke={green} strokeWidth="2.1" />
        <ellipse
          cx="22"
          cy="22"
          rx="8"
          ry="16.5"
          stroke={green}
          strokeWidth="2.1"
        />
        <ellipse
          cx="22"
          cy="22"
          rx="16.5"
          ry="8"
          stroke={green}
          strokeWidth="2.1"
        />
      </svg>
      {/* Red leaf accent — bottom-right of globe */}
      <img
        src={leafSrc}
        alt=""
        width={Math.round(size * 0.45)}
        height={Math.round(size * 0.45)}
        draggable={false}
        style={{
          position: "absolute",
          width: "45%",
          height: "45%",
          right: "0%",
          bottom: "0%",
          objectFit: "contain",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
    </span>
  );
};

export const AirtimeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    {/* Classic phone handset — two rounded ear/mouth pieces joined by a curved bar */}
    <path d="M8.6 14.9c-1.4-1.4-2.3-3-2.7-4.2-.2-.5 0-1 .3-1.4l1.4-1.4c.4-.4 1-.4 1.4 0l1.7 1.7c.4.4.4 1 0 1.4l-.8.8c.5 1 1.2 1.9 2.1 2.8s1.8 1.6 2.8 2.1l.8-.8c.4-.4 1-.4 1.4 0l1.7 1.7c.4.4.4 1 0 1.4l-1.4 1.4c-.4.4-.9.5-1.4.3-1.2-.4-2.8-1.3-4.2-2.7Z" />
    {/* Red thin outgoing arrow in top-right corner */}
    <path d="M16.5 7.5h3.5M20 7.5V11" stroke="#e60028" strokeWidth={1.3} />
    <path d="m16.8 10.7 3.2-3.2" stroke="#e60028" strokeWidth={1.3} />
  </svg>
);

export const TunukiwaIcon = (p: IconProps) => (
  <svg {...base(p)}>
    {/* Gift box body */}
    <path d="M5 9h14v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18V9Z" />
    {/* Gift lid */}
    <path d="M3 6.5h18v2.5H3z" />
    {/* Lid ribbon bumps */}
    <path d="M9 6.5c0-2 1.5-2.5 3-2.5s3 .5 3 2.5" />
    {/* Red ribbon strip hanging down */}
    <path d="M12 9v10" stroke="#e60028" />
    {/* Red ribbon tag / notch */}
    <path d="M11 15h2v3l-1 1-1-1v-3Z" stroke="#e60028" />
  </svg>
);

export const HomeInternetIcon = (p: IconProps) => (
  <svg {...base(p)}>
    {/* Green house outline */}
    <path d="M12 3.5 4 9.5v9.5a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5V9.5L12 3.5Z" />
    {/* Red Wi-Fi arcs */}
    <path d="M9 14c1.3-1.3 4.7-1.3 6 0" stroke="#e60028" />
    <path d="M10.5 15.5c.7-.7 2.3-.7 3 0" stroke="#e60028" />
    {/* Red Wi-Fi dot */}
    <circle cx="12" cy="17" r="0.7" fill="#e60028" stroke="none" />
  </svg>
);

export const BellIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);

export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6" />
    <path d="m20 20-4.3-4.3" />
  </svg>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m15 5-7 7 7 7" />
  </svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m9 5 7 7-7 7" />
  </svg>
);

export const XIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </svg>
);

export const UploadIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
    <path d="M12 4v12" />
    <path d="m7 9 5-5 5 5" />
  </svg>
);

export const StarIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1L12 17.8 6.5 20l1-6.1L3 9.5l6.3-.9L12 3Z" />
  </svg>
);

export const ReverseIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 12a8 8 0 1 1 3 6.2" />
    <path d="M4 20v-4h4" />
  </svg>
);

export const CalendarEditIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 3v4M16 3v4" />
    <path d="m14 17 3-3 1.5 1.5L15.5 18.5H14V17Z" />
  </svg>
);

export const ReceiptIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 3h11l3 3v15l-2-1.5L15 21l-2-1.5L11 21l-2-1.5L7 21l-2-1.5V3Z" />
    <path d="M9 9h6M9 13h6M9 17h3" />
  </svg>
);

export const CopyIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M4 16V6a2 2 0 0 1 2-2h10" />
  </svg>
);

export const EyeOffIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 3l18 18" />
    <path d="M10.6 6.1A9 9 0 0 1 21 12a10 10 0 0 1-3.2 4.3" />
    <path d="M6.2 6.6A10 10 0 0 0 3 12a9 9 0 0 0 12.5 4.9" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </svg>
);

export const ContactIcon = (p: IconProps) => {
  const { size = 24, ...rest } = p;
  const green = "#2F9E44";
  const rose = "#E05A6C";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      {...rest}
    >
      {/* Green rounded-square frame */}
      <rect
        x="3.4"
        y="3.4"
        width="17.2"
        height="17.2"
        rx="3.4"
        stroke={green}
        strokeWidth="2"
      />
      {/* Pink/red hollow head ring */}
      <circle
        cx="12"
        cy="9.1"
        r="2.55"
        stroke={rose}
        strokeWidth="2.1"
      />
      {/* Green shoulder arc sitting on the bottom edge */}
      <path
        d="M7 20.6c.8-3.2 2.8-4.9 5-4.9s4.2 1.7 5 4.9"
        stroke={green}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const QrIcon = (p: IconProps) => {
  const { size = 24, ...rest } = p;
  const red = "#B23A48";
  const green = "#58A45C";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      {...rest}
    >
      {/* Red L corner brackets — thinner outer frame */}
      <path
        d="M2.6 7.2V4.6A2 2 0 0 1 4.6 2.6H7.2"
        stroke={red}
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.8 2.6h2.6A2 2 0 0 1 21.4 4.6V7.2"
        stroke={red}
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.6 16.8v2.6A2 2 0 0 0 4.6 21.4H7.2"
        stroke={red}
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.8 21.4h2.6a2 2 0 0 0 2-2V16.8"
        stroke={red}
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Green pattern — inset from the red frame */}
      {/* Top-left ring */}
      <rect
        x="6.8"
        y="6.8"
        width="4.2"
        height="4.2"
        rx="1.2"
        stroke={green}
        strokeWidth="1.75"
      />

      {/* Bottom-left ring */}
      <rect
        x="6.8"
        y="13"
        width="4.2"
        height="4.2"
        rx="1.2"
        stroke={green}
        strokeWidth="1.75"
      />

      {/* Top-right vertical with leftward foot */}
      <path
        d="M16.8 7.2v4.6H14.4"
        stroke={green}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Small center-right dash */}
      <path
        d="M13.6 13.2h3.2"
        stroke={green}
        strokeWidth="1.75"
        strokeLinecap="round"
      />

      {/* Bottom-right hook / L */}
      <path
        d="M14.2 15.4v2.8h2.8"
        stroke={green}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const FingerprintIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 11a6 6 0 0 1 12 0" />
    <path d="M8 12a4 4 0 0 1 8 0v2" />
    <path d="M12 12v4" />
    <path d="M9 16.5c.5 1.5 1.5 3 3 4" />
    <path d="M15 18a5 5 0 0 1-1 3" />
  </svg>
);

export const BackspaceIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9L3 12l6-7Z" />
    <path d="m11 9 6 6M17 9l-6 6" />
  </svg>
);

export const PeopleIcon = (p: IconProps) => {
  const { size = 24, ...rest } = p;
  // Colors matched to the official M-PESA “Send to Many” tile.
  const green = "#2F7A4A";
  const rose = "#C45B6A";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      {...rest}
    >
      {/* Rear-left (green) */}
      <circle cx="13.8" cy="12.8" r="4.1" stroke={green} strokeWidth="2.2" />
      <ellipse
        cx="13.8"
        cy="24.6"
        rx="7.2"
        ry="4.4"
        stroke={green}
        strokeWidth="2.2"
      />
      {/* Rear-right (green) */}
      <circle cx="34.2" cy="12.8" r="4.1" stroke={green} strokeWidth="2.2" />
      <ellipse
        cx="34.2"
        cy="24.6"
        rx="7.2"
        ry="4.4"
        stroke={green}
        strokeWidth="2.2"
      />
      {/* Front-center (rose) — sits slightly lower/larger */}
      <circle cx="24" cy="18.6" r="4.5" stroke={rose} strokeWidth="2.2" />
      <ellipse
        cx="24"
        cy="31.4"
        rx="8.2"
        ry="5"
        stroke={rose}
        strokeWidth="2.2"
      />
    </svg>
  );
};

export const RequestMoneyIcon = (p: IconProps) => {
  const { size = 24, ...rest } = p;
  const green = "#2F9E44";
  const red = "#D13B55";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      {...rest}
    >
      {/* Wallet with open gap at bottom-right for the arrow */}
      <path
        d="M33.8 34H11.4A3.4 3.4 0 0 1 8 30.6V17.4A3.4 3.4 0 0 1 11.4 14h25.2A3.4 3.4 0 0 1 40 17.4v7.2"
        stroke={green}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Left clasp with center dot */}
      <rect
        x="11.2"
        y="18.8"
        width="5.2"
        height="9.6"
        rx="1.1"
        stroke={green}
        strokeWidth="2"
      />
      <circle cx="13.8" cy="23.6" r="1.15" fill={green} />
      {/* Up arrow overlapping bottom-right */}
      <path
        d="M35.2 36.4V21.6"
        stroke={red}
        strokeWidth="2.45"
        strokeLinecap="round"
      />
      <path
        d="M29.2 28 35.2 20.7 41.2 28"
        stroke={red}
        strokeWidth="2.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const EditIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 20h4L20 8l-4-4L4 16v4Z" />
    <path d="m14 6 4 4" />
  </svg>
);

export const DownloadIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 4v12" />
    <path d="m7 13 5 5 5-5" />
    <path d="M4 20h16" />
  </svg>
);
