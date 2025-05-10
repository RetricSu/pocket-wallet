import React from "react";

export const NostrLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4z"
        stroke="url(#nostr-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 10v12M10 16h12"
        stroke="url(#nostr-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12l8 8M12 20l8-8"
        stroke="url(#nostr-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="nostr-gradient" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
    </svg>
  );
};
