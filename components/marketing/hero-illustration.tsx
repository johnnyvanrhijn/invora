export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 400"
      width="100%"
      height="auto"
      role="img"
      aria-label="Abstracte illustratie van een zorgprofessional aan het werk"
      className={className}
    >
      {/* Achtergrondaccent: zachte ronde vorm */}
      <defs>
        <linearGradient id="bg-soft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8F2EC" />
          <stop offset="100%" stopColor="#F9F7F4" />
        </linearGradient>
        <linearGradient id="card-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F9F7F4" />
        </linearGradient>
      </defs>

      {/* Grote zachte ovaal als achtergrond */}
      <ellipse cx="270" cy="200" rx="220" ry="170" fill="url(#bg-soft)" />

      {/* Decoratieve sage-cirkel rechtsboven */}
      <circle cx="430" cy="80" r="36" fill="#7B9E87" opacity="0.18" />

      {/* Decoratieve zand-cirkel linksonder */}
      <circle cx="70" cy="340" r="48" fill="#D4B896" opacity="0.28" />

      {/* Laptop / browser frame */}
      <g transform="translate(120, 140)">
        {/* Schaduw */}
        <rect
          x="6"
          y="12"
          width="280"
          height="190"
          rx="14"
          fill="#1A1A1A"
          opacity="0.07"
        />
        {/* Frame */}
        <rect
          x="0"
          y="0"
          width="280"
          height="190"
          rx="14"
          fill="url(#card-grad)"
          stroke="#E7E2D8"
          strokeWidth="1.5"
        />
        {/* Browser-balkje bovenaan */}
        <rect x="0" y="0" width="280" height="24" rx="14" fill="#F9F7F4" />
        <rect x="0" y="14" width="280" height="10" fill="#F9F7F4" />
        <circle cx="14" cy="12" r="3.5" fill="#E7E2D8" />
        <circle cx="26" cy="12" r="3.5" fill="#E7E2D8" />
        <circle cx="38" cy="12" r="3.5" fill="#E7E2D8" />

        {/* Sidebar-strip */}
        <rect x="8" y="32" width="48" height="150" rx="8" fill="#E8F2EC" />
        <rect x="16" y="42" width="32" height="6" rx="3" fill="#7B9E87" />
        <rect x="16" y="56" width="24" height="4" rx="2" fill="#7B9E87" opacity="0.5" />
        <rect x="16" y="66" width="28" height="4" rx="2" fill="#7B9E87" opacity="0.5" />
        <rect x="16" y="76" width="22" height="4" rx="2" fill="#7B9E87" opacity="0.5" />

        {/* Content area: drie mini-KPI kaarten */}
        <rect x="68" y="36" width="62" height="44" rx="8" fill="#FFFFFF" stroke="#E7E2D8" />
        <rect x="76" y="44" width="22" height="3" rx="1.5" fill="#6B7280" opacity="0.6" />
        <rect x="76" y="54" width="36" height="8" rx="2" fill="#7B9E87" />
        <rect x="76" y="68" width="28" height="3" rx="1.5" fill="#6B7280" opacity="0.4" />

        <rect x="138" y="36" width="62" height="44" rx="8" fill="#FFFFFF" stroke="#E7E2D8" />
        <rect x="146" y="44" width="22" height="3" rx="1.5" fill="#6B7280" opacity="0.6" />
        <rect x="146" y="54" width="32" height="8" rx="2" fill="#5E8A6E" />
        <rect x="146" y="68" width="24" height="3" rx="1.5" fill="#6B7280" opacity="0.4" />

        <rect x="208" y="36" width="62" height="44" rx="8" fill="#FFFFFF" stroke="#E7E2D8" />
        <rect x="216" y="44" width="22" height="3" rx="1.5" fill="#6B7280" opacity="0.6" />
        <rect x="216" y="54" width="28" height="8" rx="2" fill="#D4B896" />
        <rect x="216" y="68" width="26" height="3" rx="1.5" fill="#6B7280" opacity="0.4" />

        {/* Staafdiagram */}
        <rect x="68" y="92" width="202" height="92" rx="8" fill="#FFFFFF" stroke="#E7E2D8" />
        <rect x="80" y="158" width="14" height="20" rx="2" fill="#7B9E87" opacity="0.5" />
        <rect x="102" y="148" width="14" height="30" rx="2" fill="#7B9E87" opacity="0.6" />
        <rect x="124" y="132" width="14" height="46" rx="2" fill="#7B9E87" opacity="0.7" />
        <rect x="146" y="118" width="14" height="60" rx="2" fill="#7B9E87" opacity="0.8" />
        <rect x="168" y="128" width="14" height="50" rx="2" fill="#7B9E87" opacity="0.85" />
        <rect x="190" y="108" width="14" height="70" rx="2" fill="#7B9E87" />
        <rect x="212" y="116" width="14" height="62" rx="2" fill="#5E8A6E" />
        <rect x="234" y="100" width="14" height="78" rx="2" fill="#5E8A6E" />
      </g>

      {/* Zwevende factuur-kaart linksboven */}
      <g transform="translate(40, 90) rotate(-6)">
        <rect
          x="0"
          y="0"
          width="120"
          height="80"
          rx="10"
          fill="#FFFFFF"
          stroke="#E7E2D8"
          strokeWidth="1.5"
          filter="drop-shadow(0 6px 12px rgba(123,158,135,0.18))"
        />
        <rect x="12" y="14" width="48" height="6" rx="3" fill="#7B9E87" />
        <rect x="12" y="28" width="80" height="3" rx="1.5" fill="#1A1A1A" opacity="0.15" />
        <rect x="12" y="36" width="64" height="3" rx="1.5" fill="#1A1A1A" opacity="0.15" />
        <rect x="12" y="44" width="72" height="3" rx="1.5" fill="#1A1A1A" opacity="0.15" />
        <rect x="12" y="58" width="48" height="14" rx="4" fill="#E8F2EC" />
        <rect x="20" y="64" width="32" height="3" rx="1.5" fill="#7B9E87" />
      </g>

      {/* Zwevende checkmark badge rechtsonder */}
      <g transform="translate(380, 290)">
        <circle
          cx="32"
          cy="32"
          r="32"
          fill="#7B9E87"
          filter="drop-shadow(0 6px 14px rgba(123,158,135,0.35))"
        />
        <path
          d="M20 32 L29 41 L46 23"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* Abstracte figuur (silhouet zonder gezicht) */}
      <g transform="translate(60, 180)">
        {/* Hoofd */}
        <ellipse cx="30" cy="22" rx="18" ry="22" fill="#D4B896" />
        {/* Torso */}
        <path
          d="M 6 50 Q 30 38 54 50 L 58 110 Q 30 118 2 110 Z"
          fill="#7B9E87"
        />
        {/* Detail kraag */}
        <path
          d="M 22 50 Q 30 56 38 50 L 36 60 Q 30 62 24 60 Z"
          fill="#FFFFFF"
          opacity="0.85"
        />
      </g>
    </svg>
  )
}
