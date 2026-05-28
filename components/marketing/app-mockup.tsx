export function AppMockup({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 400"
      width="100%"
      height="auto"
      role="img"
      aria-label="Schematische weergave van het Invora dashboard"
      className={className}
    >
      {/* Schaduw */}
      <rect x="14" y="20" width="572" height="370" rx="16" fill="#1A1A1A" opacity="0.08" />

      {/* Browser frame */}
      <rect
        x="6"
        y="6"
        width="588"
        height="380"
        rx="16"
        fill="#FFFFFF"
        stroke="#E7E2D8"
        strokeWidth="1.5"
      />

      {/* Title bar */}
      <rect x="6" y="6" width="588" height="34" rx="16" fill="#F9F7F4" />
      <rect x="6" y="22" width="588" height="18" fill="#F9F7F4" />
      <circle cx="24" cy="23" r="5" fill="#DC2626" opacity="0.7" />
      <circle cx="42" cy="23" r="5" fill="#D97706" opacity="0.7" />
      <circle cx="60" cy="23" r="5" fill="#7B9E87" opacity="0.85" />

      {/* URL bar */}
      <rect
        x="100"
        y="14"
        width="400"
        height="18"
        rx="9"
        fill="#FFFFFF"
        stroke="#E7E2D8"
      />
      <circle cx="114" cy="23" r="3" fill="#7B9E87" />
      <rect x="124" y="20" width="120" height="6" rx="2" fill="#6B7280" opacity="0.3" />

      {/* Sidebar */}
      <rect x="6" y="40" width="120" height="346" fill="#F9F7F4" />
      <rect x="6" y="40" width="120" height="346" fill="none" stroke="#E7E2D8" strokeWidth="1" />
      <text
        x="22"
        y="68"
        fontFamily="system-ui, sans-serif"
        fontSize="14"
        fontWeight="700"
        fill="#7B9E87"
      >
        Invora
      </text>

      {/* Sidebar items */}
      <rect x="14" y="86" width="100" height="32" rx="8" fill="#7B9E87" />
      <rect x="26" y="98" width="14" height="8" rx="2" fill="#FFFFFF" />
      <rect x="46" y="100" width="48" height="4" rx="2" fill="#FFFFFF" />

      <rect x="26" y="130" width="14" height="8" rx="2" fill="#7B9E87" opacity="0.5" />
      <rect x="46" y="132" width="44" height="4" rx="2" fill="#1A1A1A" opacity="0.5" />

      <rect x="26" y="156" width="14" height="8" rx="2" fill="#7B9E87" opacity="0.5" />
      <rect x="46" y="158" width="52" height="4" rx="2" fill="#1A1A1A" opacity="0.5" />

      <rect x="26" y="182" width="14" height="8" rx="2" fill="#7B9E87" opacity="0.5" />
      <rect x="46" y="184" width="32" height="4" rx="2" fill="#1A1A1A" opacity="0.5" />

      <rect x="26" y="208" width="14" height="8" rx="2" fill="#7B9E87" opacity="0.5" />
      <rect x="46" y="210" width="44" height="4" rx="2" fill="#1A1A1A" opacity="0.5" />

      {/* Content area */}
      {/* Header */}
      <rect x="146" y="60" width="180" height="14" rx="3" fill="#1A1A1A" opacity="0.85" />
      <rect x="146" y="82" width="240" height="6" rx="2" fill="#6B7280" opacity="0.5" />

      {/* KPI cards */}
      <g>
        <rect
          x="146"
          y="106"
          width="138"
          height="80"
          rx="10"
          fill="#FFFFFF"
          stroke="#E7E2D8"
        />
        <rect x="158" y="118" width="64" height="5" rx="2" fill="#6B7280" opacity="0.6" />
        <rect x="158" y="134" width="86" height="14" rx="3" fill="#7B9E87" />
        <rect x="158" y="158" width="56" height="4" rx="2" fill="#6B7280" opacity="0.4" />

        <rect
          x="294"
          y="106"
          width="138"
          height="80"
          rx="10"
          fill="#FFFFFF"
          stroke="#E7E2D8"
        />
        <rect x="306" y="118" width="72" height="5" rx="2" fill="#6B7280" opacity="0.6" />
        <rect x="306" y="134" width="76" height="14" rx="3" fill="#5E8A6E" />
        <rect x="306" y="158" width="62" height="4" rx="2" fill="#6B7280" opacity="0.4" />

        <rect
          x="442"
          y="106"
          width="138"
          height="80"
          rx="10"
          fill="#FFFFFF"
          stroke="#E7E2D8"
        />
        <rect x="454" y="118" width="56" height="5" rx="2" fill="#6B7280" opacity="0.6" />
        <rect x="454" y="134" width="92" height="14" rx="3" fill="#D4B896" />
        <rect x="454" y="158" width="68" height="4" rx="2" fill="#6B7280" opacity="0.4" />
      </g>

      {/* Chart */}
      <rect
        x="146"
        y="200"
        width="434"
        height="170"
        rx="10"
        fill="#FFFFFF"
        stroke="#E7E2D8"
      />
      <rect x="160" y="214" width="86" height="6" rx="2" fill="#1A1A1A" opacity="0.7" />
      <rect x="160" y="226" width="120" height="4" rx="2" fill="#6B7280" opacity="0.5" />

      <g>
        <rect x="170" y="320" width="22" height="32" rx="3" fill="#7B9E87" opacity="0.45" />
        <rect x="202" y="306" width="22" height="46" rx="3" fill="#7B9E87" opacity="0.55" />
        <rect x="234" y="288" width="22" height="64" rx="3" fill="#7B9E87" opacity="0.65" />
        <rect x="266" y="272" width="22" height="80" rx="3" fill="#7B9E87" opacity="0.75" />
        <rect x="298" y="296" width="22" height="56" rx="3" fill="#7B9E87" opacity="0.85" />
        <rect x="330" y="258" width="22" height="94" rx="3" fill="#7B9E87" />
        <rect x="362" y="278" width="22" height="74" rx="3" fill="#5E8A6E" />
        <rect x="394" y="246" width="22" height="106" rx="3" fill="#5E8A6E" />
        <rect x="426" y="266" width="22" height="86" rx="3" fill="#5E8A6E" />
        <rect x="458" y="252" width="22" height="100" rx="3" fill="#5E8A6E" />
        <rect x="490" y="288" width="22" height="64" rx="3" fill="#5E8A6E" />
        <rect x="522" y="276" width="22" height="76" rx="3" fill="#5E8A6E" />
      </g>
    </svg>
  )
}
