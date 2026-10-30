const SKIN = '#dccdff'
const SKIN_SHADE = '#c7b2f7'
const HAIR = '#111111'
const UNIFORM = '#ffffff'
const VIOLET = '#6d4aff'
const VIOLET_DEEP = '#4c358f'
const VIOLET_DARK = '#241747'

export default function NursingStudentsIllustration() {
  return (
    <svg
      viewBox="0 0 560 500"
      role="img"
      aria-label="Illustration of three nursing students in white uniforms"
      className="nursing-illustration"
    >
      <defs>
        <linearGradient id="narsync-illustration-glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={VIOLET} stopOpacity="0.42" />
          <stop offset="1" stopColor={VIOLET} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Backdrop */}
      <circle cx="280" cy="238" r="196" fill="url(#narsync-illustration-glow)" />
      <circle
        cx="280"
        cy="238"
        r="196"
        fill="none"
        stroke="rgba(255, 255, 255, 0.14)"
        strokeWidth="1.5"
      />
      <circle
        cx="466"
        cy="96"
        r="42"
        fill="none"
        stroke="rgba(255, 255, 255, 0.16)"
        strokeWidth="1.5"
      />
      <circle cx="78" cy="122" r="7" fill="rgba(255, 255, 255, 0.2)" />
      <circle cx="506" cy="286" r="5" fill="rgba(255, 255, 255, 0.26)" />
      <circle cx="62" cy="380" r="4" fill="rgba(255, 255, 255, 0.18)" />

      {/* Floating medical accents */}
      <g opacity="0.6">
        <path
          d="M74 92c0-8-12-10-12-2 0 8 12 16 12 16s12-8 12-16c0-8-12-6-12 2Z"
          fill="rgba(255, 255, 255, 0.12)"
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth="2"
        />
        <g stroke={SKIN_SHADE} strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M36 328h20l9-18 11 38 9-20h21" />
        </g>
        <g transform="translate(490 66)">
          <circle r="21" fill="rgba(255, 255, 255, 0.08)" />
          <path
            d="M0-10v20M-10 0h20"
            stroke="rgba(255, 255, 255, 0.55)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>
        <path
          d="M505 202v12M499 208h12"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>

      {/* Ground shadow */}
      <ellipse cx="282" cy="444" rx="208" ry="16" fill="rgba(0, 0, 0, 0.22)" />

      {/* Left student */}
      <g>
        <rect x="107" y="338" width="27" height="92" rx="13" fill={VIOLET_DARK} />
        <rect x="139" y="338" width="27" height="92" rx="13" fill={VIOLET_DARK} />
        <ellipse cx="116" cy="432" rx="25" ry="9" fill={UNIFORM} />
        <ellipse cx="154" cy="432" rx="25" ry="9" fill={UNIFORM} />

        <path
          d="M84 246c0-24 20-36 51-39 31 3 51 15 51 39l4 96c0 13-24 19-55 19s-55-6-55-19Z"
          fill={UNIFORM}
        />
        <path d="M118 211l17 39 17-39Z" fill={VIOLET_DEEP} />
        <path
          d="M84 338c17 9 36 13 51 13s34-4 51-13"
          fill="none"
          stroke="#e9e2ff"
          strokeWidth="3"
        />
        <rect
          x="152"
          y="284"
          width="25"
          height="31"
          rx="5"
          fill="none"
          stroke={SKIN_SHADE}
          strokeWidth="2.5"
        />

        <path
          d="M88 248c-12 31-14 57-4 78"
          fill="none"
          stroke={SKIN}
          strokeWidth="19"
          strokeLinecap="round"
        />
        <path
          d="M182 248c12 31 10 55-3 70"
          fill="none"
          stroke={SKIN}
          strokeWidth="19"
          strokeLinecap="round"
        />

        <rect x="148" y="285" width="55" height="73" rx="9" fill={HAIR} />
        <rect x="157" y="296" width="37" height="51" rx="5" fill={UNIFORM} />
        <path
          d="M164 308h23M164 320h23M164 332h15"
          stroke={VIOLET}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <rect x="164" y="279" width="23" height="12" rx="4" fill={SKIN_SHADE} />
        <circle cx="85" cy="330" r="10" fill={SKIN} />
        <circle cx="178" cy="321" r="10" fill={SKIN} />

        <circle cx="97" cy="172" r="7" fill={SKIN} />
        <circle cx="173" cy="172" r="7" fill={SKIN} />
        <circle cx="135" cy="170" r="39" fill={SKIN} />
        <path
          d="M96 174c-4-44 14-50 39-50s43 6 39 50c-6-26-16-32-39-32s-33 6-39 32Z"
          fill={HAIR}
        />
        <circle cx="123" cy="168" r="2.6" fill={HAIR} />
        <circle cx="147" cy="168" r="2.6" fill={HAIR} />
        <path
          d="M126 184c5 5 13 5 18 0"
          fill="none"
          stroke={HAIR}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M116 210c-8 30-10 58 6 70 16 12 32-2 30-20"
          fill="none"
          stroke={HAIR}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="152" cy="258" r="7" fill={HAIR} />

        <path
          d="M108 139c8-13 46-13 54 0l-2 10c-10-8-40-8-50 0Z"
          fill={UNIFORM}
        />
        <path d="M132.5 131h5v13h-5zM128.5 135h13v5h-13z" fill={VIOLET} />
      </g>

      {/* Center student */}
      <g>
        <rect x="253" y="342" width="26" height="94" rx="13" fill={VIOLET_DARK} />
        <rect x="284" y="342" width="26" height="94" rx="13" fill={VIOLET_DARK} />
        <ellipse cx="263" cy="438" rx="25" ry="9" fill={UNIFORM} />
        <ellipse cx="301" cy="438" rx="25" ry="9" fill={UNIFORM} />

        <path
          d="M229 244c0-28 21-40 51-43 30 3 51 15 51 43l5 102c0 13-24 19-56 19s-56-6-56-19Z"
          fill={UNIFORM}
        />
        <path d="M262 202l18 44 18-44Z" fill={VIOLET_DEEP} />
        <path
          d="M229 344c18 9 37 13 51 13s33-4 51-13"
          fill="none"
          stroke="#e9e2ff"
          strokeWidth="3"
        />
        <path
          d="M233 246c-18 40-8 70 13 82"
          fill="none"
          stroke={SKIN}
          strokeWidth="19"
          strokeLinecap="round"
        />
        <path
          d="M327 246c18 40 8 70-13 82"
          fill="none"
          stroke={SKIN}
          strokeWidth="19"
          strokeLinecap="round"
        />

        <rect x="237" y="296" width="86" height="66" rx="10" fill={HAIR} />
        <rect x="246" y="306" width="68" height="48" rx="6" fill={UNIFORM} />
        <path
          d="M254 318h24M254 329h16"
          stroke={VIOLET}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M254 341h8l4-6 5 12 4-6h23"
          fill="none"
          stroke={VIOLET_DEEP}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="267" y="289" width="26" height="13" rx="4" fill={SKIN_SHADE} />
        <circle cx="247" cy="329" r="10" fill={SKIN} />
        <circle cx="313" cy="329" r="10" fill={SKIN} />

        <circle cx="238" cy="157" r="7" fill={SKIN} />
        <circle cx="322" cy="157" r="7" fill={SKIN} />
        <circle cx="280" cy="155" r="42" fill={SKIN} />
        <path
          d="M238 168c-4-52 12-66 42-66s46 14 42 66l-2 32h-12l2-40c-2-28-12-34-30-34s-28 6-30 34l2 40h-12Z"
          fill={HAIR}
        />
        <circle cx="267" cy="156" r="2.8" fill={HAIR} />
        <circle cx="293" cy="156" r="2.8" fill={HAIR} />
        <path
          d="M270 173c6 6 14 6 20 0"
          fill="none"
          stroke={HAIR}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="256" cy="172" r="6" fill={SKIN_SHADE} opacity="0.7" />
        <circle cx="304" cy="172" r="6" fill={SKIN_SHADE} opacity="0.7" />

        <path
          d="M250 123c12-16 48-16 60 0l-2 13c-12-10-44-10-56 0Z"
          fill={UNIFORM}
        />
        <path d="M277.5 112h5v14h-5zM273 116.5h14v5h-14z" fill={VIOLET} />
      </g>

      {/* Right student */}
      <g>
        <rect x="404" y="346" width="26" height="90" rx="13" fill={VIOLET_DARK} />
        <rect x="434" y="346" width="26" height="90" rx="13" fill={VIOLET_DARK} />
        <ellipse cx="414" cy="438" rx="25" ry="9" fill={UNIFORM} />
        <ellipse cx="450" cy="438" rx="25" ry="9" fill={UNIFORM} />

        <path
          d="M379 250c0-26 21-38 51-41 30 3 51 15 51 41l4 96c0 13-24 19-55 19s-55-6-55-19Z"
          fill={UNIFORM}
        />
        <path d="M412 210l18 44 18-44Z" fill={VIOLET_DEEP} />
        <path
          d="M379 346c17 9 36 13 51 13s34-4 51-13"
          fill="none"
          stroke="#e9e2ff"
          strokeWidth="3"
        />
        <rect
          x="388"
          y="290"
          width="25"
          height="30"
          rx="5"
          fill="none"
          stroke={SKIN_SHADE}
          strokeWidth="2.5"
        />

        <path
          d="M384 252c-14 36-16 60-6 78"
          fill="none"
          stroke={SKIN}
          strokeWidth="19"
          strokeLinecap="round"
        />
        <path
          d="M476 252c22-20 32-44 34-68"
          fill="none"
          stroke={SKIN}
          strokeWidth="19"
          strokeLinecap="round"
        />
        <circle cx="379" cy="334" r="10" fill={SKIN} />
        <ellipse cx="512" cy="176" rx="11" ry="13" fill={SKIN} />

        <circle cx="430" cy="132" r="17" fill={HAIR} />
        <circle cx="430" cy="148" r="6" fill={VIOLET} />
        <circle cx="392" cy="179" r="7" fill={SKIN} />
        <circle cx="468" cy="179" r="7" fill={SKIN} />
        <circle cx="430" cy="178" r="38" fill={SKIN} />
        <path
          d="M392 184c-4-46 12-58 38-58s42 12 38 58l-2 28h-12l2-36c-2-24-10-30-26-30s-24 6-26 30l2 36h-12Z"
          fill={HAIR}
        />
        <circle cx="417" cy="176" r="2.6" fill={HAIR} />
        <circle cx="443" cy="176" r="2.6" fill={HAIR} />
        <path
          d="M420 192c6 6 14 6 20 0"
          fill="none"
          stroke={HAIR}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="406" cy="191" r="5.5" fill={SKIN_SHADE} opacity="0.7" />
        <circle cx="454" cy="191" r="5.5" fill={SKIN_SHADE} opacity="0.7" />

        <path
          d="M402 148c12-14 44-14 56 0l-2 12c-12-10-40-10-52 0Z"
          fill={UNIFORM}
        />
        <path d="M427.5 136h5v14h-5zM423 140.5h14v5h-14z" fill={VIOLET} />
      </g>
    </svg>
  )
}
