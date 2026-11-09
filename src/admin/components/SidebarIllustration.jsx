export default function SidebarIllustration() {
  return (
    <svg
      className="adm-sidebar-hero__art"
      viewBox="0 0 224 112"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="admSidebarSheet" x1="34" y1="24" x2="152" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#b7a6ff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="admSidebarBadge" x1="150" y1="10" x2="198" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a78bfa" />
          <stop offset="1" stopColor="#6236e8" />
        </linearGradient>
        <radialGradient id="admSidebarGlow">
          <stop stopColor="#8b6bff" stopOpacity="0.34" />
          <stop offset="1" stopColor="#8b6bff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="112" cy="56" rx="98" ry="52" fill="url(#admSidebarGlow)" />
      <ellipse cx="104" cy="104" rx="62" ry="5" fill="#0c0718" opacity="0.3" />

      <g transform="rotate(-4 93 60)">
        <rect
          x="34"
          y="24"
          width="118"
          height="72"
          rx="12"
          fill="url(#admSidebarSheet)"
          stroke="#ffffff"
          strokeOpacity="0.24"
        />
        <rect x="71" y="17" width="44" height="11" rx="5.5" fill="#7c5cf5" />
        <rect x="79" y="20.5" width="28" height="4" rx="2" fill="#ffffff" opacity="0.55" />
        <rect x="46" y="38" width="46" height="7" rx="3.5" fill="#cdbfff" />
        <rect x="46" y="50" width="29" height="4" rx="2" fill="#ffffff" opacity="0.3" />

        <circle cx="52" cy="64" r="5" fill="#8b6bff" />
        <path
          d="M49.8 64.1l1.5 1.5 2.9-3"
          stroke="#ffffff"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="61" y="61.5" width="44" height="5" rx="2.5" fill="#ffffff" opacity="0.36" />

        <circle cx="52" cy="77" r="5" fill="#8b6bff" opacity="0.75" />
        <path
          d="M49.8 77.1l1.5 1.5 2.9-3"
          stroke="#ffffff"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="61" y="74.5" width="36" height="5" rx="2.5" fill="#ffffff" opacity="0.3" />

        <circle cx="52" cy="90" r="4.4" fill="none" stroke="#c4b5fd" strokeOpacity="0.8" strokeWidth="1.4" />
        <rect x="61" y="87.5" width="40" height="5" rx="2.5" fill="#ffffff" opacity="0.22" />
      </g>

      <g transform="translate(150 10)">
        <rect
          x="0"
          y="0"
          width="48"
          height="40"
          rx="12"
          fill="url(#admSidebarBadge)"
          stroke="#ffffff"
          strokeOpacity="0.4"
        />
        <path
          d="M10 13v-1.5A1.5 1.5 0 0 1 11.5 10H13"
          stroke="#e9e2ff"
          strokeOpacity="0.85"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M35 10h1.5a1.5 1.5 0 0 1 1.5 1.5V13"
          stroke="#e9e2ff"
          strokeOpacity="0.85"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M10 27v1.5a1.5 1.5 0 0 0 1.5 1.5H13"
          stroke="#e9e2ff"
          strokeOpacity="0.85"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M35 30h1.5a1.5 1.5 0 0 0 1.5-1.5V27"
          stroke="#e9e2ff"
          strokeOpacity="0.85"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="24" cy="18" r="6" stroke="#ffffff" strokeWidth="1.6" />
        <path
          d="M15 32c1.3-4.2 4.6-6.3 9-6.3s7.7 2.1 9 6.3"
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>

      <path
        d="M181 66l1.8 4.2 4.2 1.8-4.2 1.8-1.8 4.2-1.8-4.2-4.2-1.8 4.2-1.8z"
        fill="#c4b5fd"
        opacity="0.85"
      />
      <path
        d="M20 66l1.3 3.2 3.2 1.3-3.2 1.3-1.3 3.2-1.3-3.2-3.2-1.3 3.2-1.3z"
        fill="#8b6bff"
        opacity="0.7"
      />
      <circle cx="163" cy="74" r="2" fill="#ffffff" opacity="0.45" />
    </svg>
  )
}
