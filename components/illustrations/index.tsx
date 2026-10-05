/**
 * Custom SVG illustrations for JBC.
 *
 * These are drawn artwork, not photos and not icon-font glyphs. Real product
 * photography arrives in Phase 5; until then these carry the visual weight.
 *
 * Every illustration takes its colours from the design tokens so it re-skins
 * automatically when the palette changes.
 */

const GREEN = "var(--color-primary)";
const GREEN_DARK = "var(--color-primary-dark)";
const GREEN_TINT = "var(--color-primary-tint)";
const YELLOW = "var(--color-accent)";
const YELLOW_TINT = "var(--color-accent-tint)";
const BLUE = "var(--color-secondary)";
const BLUE_TINT = "var(--color-secondary-tint)";

/* ── Hero: the cream jar with herbal leaves ─────────────────────────── */

export function HeroJar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 300"
      className={className}
      role="img"
      aria-label="A jar of JBC herbal skin cream surrounded by fresh green leaves"
    >
      <defs>
        <linearGradient id="jbc-jar-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor={GREEN_TINT} />
        </linearGradient>
        <linearGradient id="jbc-jar-lid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={GREEN} />
          <stop offset="100%" stopColor={GREEN_DARK} />
        </linearGradient>
        <linearGradient id="jbc-leaf-a" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={GREEN_DARK} />
          <stop offset="100%" stopColor={GREEN} />
        </linearGradient>
        <linearGradient id="jbc-leaf-b" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#6aa96e" />
          <stop offset="100%" stopColor={GREEN} />
        </linearGradient>
        <filter id="jbc-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* soft ground shadow */}
      <ellipse
        cx="160"
        cy="268"
        rx="86"
        ry="13"
        fill={GREEN_DARK}
        opacity="0.16"
        filter="url(#jbc-soft)"
      />

      {/* leaves behind the jar */}
      <g>
        <path
          d="M74 150 C34 132 26 84 62 62 C96 42 116 88 96 124 C88 140 82 146 74 150 Z"
          fill="url(#jbc-leaf-a)"
        />
        <path d="M62 62 C74 92 80 122 74 150" stroke={GREEN_DARK} strokeWidth="2.5" fill="none" opacity="0.5" />

        <path
          d="M244 140 C286 126 296 78 260 56 C226 36 204 82 224 118 C232 132 238 137 244 140 Z"
          fill="url(#jbc-leaf-b)"
        />
        <path d="M260 56 C248 86 242 114 244 140" stroke={GREEN_DARK} strokeWidth="2.5" fill="none" opacity="0.4" />

        <path
          d="M108 84 C96 46 126 22 154 34 C178 46 172 84 142 96 C130 100 118 96 108 84 Z"
          fill="url(#jbc-leaf-a)"
          opacity="0.9"
        />
      </g>

      {/* the jar */}
      <g>
        {/* lid */}
        <rect x="106" y="96" width="108" height="34" rx="10" fill="url(#jbc-jar-lid)" />
        <rect x="106" y="102" width="108" height="9" rx="4.5" fill="#ffffff" opacity="0.26" />
        {/* neck */}
        <rect x="114" y="128" width="92" height="10" fill={GREEN_TINT} />
        {/* body */}
        <rect
          x="92"
          y="136"
          width="136"
          height="128"
          rx="20"
          fill="url(#jbc-jar-body)"
          stroke={GREEN}
          strokeWidth="2.5"
        />
        {/* label band */}
        <rect x="104" y="168" width="112" height="66" rx="10" fill="#ffffff" stroke={GREEN_TINT} strokeWidth="2" />
        {/* label content: a leaf mark and two text lines */}
        <path
          d="M160 178 C150 188 150 200 160 208 C170 200 170 188 160 178 Z"
          fill={GREEN}
        />
        <rect x="134" y="214" width="52" height="5" rx="2.5" fill={GREEN} opacity="0.55" />
        <rect x="142" y="224" width="36" height="5" rx="2.5" fill={GREEN} opacity="0.3" />
        {/* jar highlight */}
        <rect x="104" y="146" width="12" height="106" rx="6" fill="#ffffff" opacity="0.65" />
      </g>

      {/* floating herb sprigs in front */}
      <g opacity="0.95">
        <path
          d="M228 214 C252 202 268 214 258 232 C246 248 226 240 228 214 Z"
          fill="url(#jbc-leaf-b)"
        />
        <path
          d="M78 206 C56 198 44 212 54 228 C66 242 82 232 78 206 Z"
          fill="url(#jbc-leaf-a)"
        />
      </g>
    </svg>
  );
}

/* ── Why JBC: four benefit illustrations ────────────────────────────── */

export function HerbsIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 150"
      className={className}
      role="img"
      aria-label="Fresh green herbs growing from the ground"
    >
      <defs>
        <linearGradient id="jbc-herb-stem" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={GREEN_DARK} />
          <stop offset="100%" stopColor={GREEN} />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="132" rx="66" ry="7" fill={GREEN_TINT} />

      <path d="M100 130 C100 96 100 70 100 44" stroke="url(#jbc-herb-stem)" strokeWidth="5" fill="none" strokeLinecap="round" />

      <path d="M100 100 C74 96 58 76 60 54 C84 54 100 72 100 100 Z" fill={GREEN} />
      <path d="M100 100 C126 96 142 76 140 54 C116 54 100 72 100 100 Z" fill={GREEN} opacity="0.8" />
      <path d="M100 72 C82 68 68 52 70 34 C88 34 100 50 100 72 Z" fill={GREEN} opacity="0.9" />
      <path d="M100 60 C116 56 128 42 126 26 C110 26 100 40 100 60 Z" fill={YELLOW} />
    </svg>
  );
}

export function NoAdditivesIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 150"
      className={className}
      role="img"
      aria-label="A clean cream jar with a crossed-out bottle, meaning no artificial additives"
    >
      <ellipse cx="100" cy="134" rx="62" ry="7" fill={GREEN_TINT} />

      {/* clean jar */}
      <rect x="46" y="62" width="62" height="66" rx="12" fill="#ffffff" stroke={GREEN} strokeWidth="3" />
      <rect x="52" y="48" width="50" height="18" rx="7" fill={GREEN} />
      <rect x="58" y="86" width="38" height="6" rx="3" fill={GREEN} opacity="0.45" />
      <rect x="64" y="98" width="26" height="6" rx="3" fill={GREEN} opacity="0.25" />

      {/* crossed-out bottle */}
      <g>
        <rect x="126" y="66" width="38" height="62" rx="9" fill="#ffffff" stroke="#9aa5ad" strokeWidth="3" />
        <rect x="136" y="52" width="18" height="16" rx="4" fill="#c3cbd1" />
        <rect x="133" y="88" width="24" height="6" rx="3" fill="#c3cbd1" />
        <line
          x1="120"
          y1="58"
          x2="172"
          y2="136"
          stroke={YELLOW}
          strokeWidth="7"
          strokeLinecap="round"
        />
        <line
          x1="172"
          y1="58"
          x2="120"
          y2="136"
          stroke={YELLOW}
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function AntifungalIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 150"
      className={className}
      role="img"
      aria-label="A shield protecting against fungal spots on skin"
    >
      <defs>
        <linearGradient id="jbc-shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GREEN} />
          <stop offset="100%" stopColor={GREEN_DARK} />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="136" rx="56" ry="7" fill={GREEN_TINT} />

      <path
        d="M100 20 L146 40 C146 88 126 116 100 128 C74 116 54 88 54 40 Z"
        fill="url(#jbc-shield)"
      />
      <path
        d="M100 20 L146 40 C146 88 126 116 100 128 Z"
        fill="#ffffff"
        opacity="0.12"
      />

      {/* fungal spores being cleared away */}
      <circle cx="82" cy="66" r="9" fill="#ffffff" opacity="0.92" />
      <circle cx="82" cy="66" r="15" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.5" />
      <circle cx="118" cy="88" r="7" fill="#ffffff" opacity="0.8" />
      <path
        d="M76 100 L124 52"
        stroke="#ffffff"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.95"
      />
    </svg>
  );
}

export function GentleIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 150"
      className={className}
      role="img"
      aria-label="A soft open palm holding a heart, symbolising gentle care"
    >
      <ellipse cx="100" cy="134" rx="62" ry="7" fill={GREEN_TINT} />

      <path
        d="M62 118 C42 100 40 78 56 70 C66 64 74 72 76 84 L76 56 C76 44 92 44 92 56 L92 80 L92 48 C92 36 108 36 108 48 L108 80 L108 56 C108 44 124 44 124 56 L124 96 C124 110 112 122 96 122 Z"
        fill={YELLOW_TINT}
        stroke={YELLOW}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M100 96 C88 84 88 70 100 60 C112 70 112 84 100 96 Z"
        fill="#e0566a"
      />
    </svg>
  );
}

/* ── What it helps with: four condition illustrations ───────────────── */

export function FungalIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 96"
      className={className}
      role="img"
      aria-label="A patch of skin with fungal spots fading away"
    >
      <rect x="8" y="16" width="104" height="64" rx="18" fill={YELLOW_TINT} stroke={YELLOW} strokeWidth="2.5" />
      <circle cx="42" cy="42" r="9" fill={GREEN} opacity="0.65" />
      <circle cx="72" cy="56" r="6" fill={GREEN} opacity="0.45" />
      <path d="M34 70 C46 62 62 74 84 58" stroke={GREEN_DARK} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function BurnIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 96"
      className={className}
      role="img"
      aria-label="A cooling blue flame over skin, showing relief from burns"
    >
      <rect x="8" y="16" width="104" height="64" rx="18" fill={BLUE_TINT} stroke={BLUE} strokeWidth="2.5" />
      <path
        d="M60 24 C60 24 44 42 44 56 C44 66 51 73 60 73 C69 73 76 66 76 56 C76 42 60 24 60 24 Z"
        fill={BLUE}
        opacity="0.9"
      />
      <path
        d="M60 44 C60 44 52 55 52 62 C52 68 56 71 60 71 C64 71 68 68 68 62 C68 55 60 44 60 44 Z"
        fill="#ffffff"
        opacity="0.85"
      />
    </svg>
  );
}

export function RashIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 96"
      className={className}
      role="img"
      aria-label="Calm skin where a rash has settled"
    >
      <rect x="8" y="16" width="104" height="64" rx="18" fill={GREEN_TINT} stroke={GREEN} strokeWidth="2.5" />
      <path d="M20 48 C36 36 48 60 62 48 C76 36 88 60 102 48" stroke={GREEN} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx="38" cy="66" r="5" fill={GREEN} opacity="0.35" />
      <circle cx="82" cy="66" r="5" fill={GREEN} opacity="0.35" />
    </svg>
  );
}

export function DrySkinIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 96"
      className={className}
      role="img"
      aria-label="A water droplet moisturising dry skin"
    >
      <rect x="8" y="16" width="104" height="64" rx="18" fill={BLUE_TINT} stroke={BLUE} strokeWidth="2.5" />
      <path
        d="M60 28 C60 28 44 50 44 60 C44 68 51 74 60 74 C69 74 76 68 76 60 C76 50 60 28 60 28 Z"
        fill={BLUE}
        opacity="0.9"
      />
      <ellipse cx="53" cy="60" rx="4" ry="6" fill="#ffffff" opacity="0.75" />
    </svg>
  );
}

/* ── Safe for everyone: children, men and women ────────────────────── */

export function FamilyIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 260 140"
      className={className}
      role="img"
      aria-label="A child, a man and a woman standing together, all safe to use JBC cream"
    >
      <ellipse cx="130" cy="128" rx="104" ry="9" fill="#ffffff" opacity="0.35" />

      {/* child */}
      <g>
        <circle cx="58" cy="46" r="16" fill={YELLOW_TINT} stroke={YELLOW} strokeWidth="2.5" />
        <path d="M42 118 C42 90 74 90 74 118 Z" fill={YELLOW_TINT} stroke={YELLOW} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="53" cy="43" r="2.6" fill={GREEN_DARK} />
        <circle cx="64" cy="43" r="2.6" fill={GREEN_DARK} />
        <path d="M53 52 C56 55 60 55 63 52" stroke={GREEN_DARK} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      {/* woman */}
      <g>
        <circle cx="130" cy="40" r="18" fill="#ffffff" stroke={BLUE} strokeWidth="2.5" />
        <path
          d="M112 36 C112 18 148 18 148 36 C148 28 140 24 130 24 C120 24 112 28 112 36 Z"
          fill={BLUE}
          opacity="0.65"
        />
        <path d="M104 118 C104 84 156 84 156 118 Z" fill="#ffffff" stroke={BLUE} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="124" cy="39" r="2.6" fill={BLUE} />
        <circle cx="136" cy="39" r="2.6" fill={BLUE} />
        <path d="M124 48 C127 51 133 51 136 48" stroke={BLUE} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      {/* man */}
      <g>
        <circle cx="202" cy="42" r="18" fill="#ffffff" stroke={GREEN} strokeWidth="2.5" />
        <path d="M184 36 C184 22 220 22 220 36 C216 28 208 26 202 26 C196 26 188 28 184 36 Z" fill={GREEN} opacity="0.7" />
        <path d="M176 118 C176 86 228 86 228 118 Z" fill="#ffffff" stroke={GREEN} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="196" cy="41" r="2.6" fill={GREEN_DARK} />
        <circle cx="208" cy="41" r="2.6" fill={GREEN_DARK} />
      </g>
    </svg>
  );
}

/* ── How it works: three steps ──────────────────────────────────────── */

export function StepSignInIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Signing in with a Google account"
    >
      <rect x="16" y="30" width="88" height="66" rx="14" fill="#ffffff" stroke={GREEN} strokeWidth="3" />
      <rect x="30" y="44" width="60" height="8" rx="4" fill={GREEN} opacity="0.3" />
      <rect x="30" y="60" width="42" height="8" rx="4" fill={GREEN} opacity="0.2" />
      <circle cx="60" cy="84" r="12" fill={BLUE} />
      <path d="M54 84 L58 88 L67 79" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StepSizeIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Choosing a jar size and quantity"
    >
      <rect x="14" y="58" width="34" height="46" rx="8" fill={GREEN_TINT} stroke={GREEN} strokeWidth="3" />
      <rect x="20" y="48" width="22" height="12" rx="5" fill={GREEN} />
      <rect x="44" y="48" width="28" height="56" rx="8" fill="#ffffff" stroke={GREEN} strokeWidth="3" />
      <rect x="49" y="36" width="18" height="14" rx="5" fill={GREEN} opacity="0.7" />
      <rect x="78" y="38" width="28" height="66" rx="8" fill={GREEN_TINT} stroke={GREEN} strokeWidth="3" />
      <rect x="84" y="24" width="16" height="16" rx="5" fill={GREEN} />
    </svg>
  );
}

export function StepPriceIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Receiving a price for the request"
    >
      <rect x="20" y="24" width="80" height="72" rx="14" fill="#ffffff" stroke={GREEN} strokeWidth="3" />
      <path d="M20 46 L100 46" stroke={GREEN} strokeWidth="2.5" opacity="0.35" />
      <rect x="34" y="60" width="34" height="7" rx="3.5" fill={GREEN} opacity="0.25" />
      <rect x="34" y="76" width="52" height="7" rx="3.5" fill={GREEN} opacity="0.18" />
      <circle cx="88" cy="82" r="16" fill={YELLOW} />
      <path d="M88 74 L88 90 M83 78 L88 74 L93 78 M83 86 L88 90 L93 86" stroke={GREEN_DARK} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Empty / error states ───────────────────────────────────────────── */

export function JarEmptyIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 130"
      className={className}
      role="img"
      aria-label="An empty cream jar"
    >
      <ellipse cx="80" cy="116" rx="46" ry="6" fill={GREEN_TINT} />
      <rect x="52" y="42" width="56" height="18" rx="7" fill={GREEN} opacity="0.55" />
      <rect x="46" y="58" width="68" height="56" rx="14" fill="#ffffff" stroke={GREEN} strokeWidth="2.5" strokeDasharray="7 6" />
      <path d="M66 80 L94 80" stroke={GREEN} strokeWidth="4" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

export function AlertIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 130"
      className={className}
      role="img"
      aria-label="A plant sprig inside a warning circle"
    >
      <circle cx="80" cy="65" r="46" fill={YELLOW_TINT} stroke={YELLOW} strokeWidth="3" />
      <path d="M80 100 L80 52" stroke={GREEN} strokeWidth="5" strokeLinecap="round" />
      <path d="M80 78 C60 74 50 58 52 40 C70 40 80 56 80 78 Z" fill={GREEN} opacity="0.8" />
      <path d="M80 62 C98 58 108 44 106 28 C90 28 80 42 80 62 Z" fill={GREEN} opacity="0.6" />
    </svg>
  );
}

/* ── Request form: one jar per size ──────────────────────────────────── */

/**
 * How tall each jar is drawn, keyed by the size label.
 *
 * PLACEHOLDER — the ratios are provisional until JBC confirms the real volumes,
 * but the relationship is honest: 100ml is visibly the biggest jar. Update this
 * map alongside CREAM_SIZES in lib/schemas/price-request.ts.
 */
const JAR_HEIGHT_BY_SIZE: Record<string, number> = {
  "30ml": 62,
  "50ml": 78,
  "100ml": 96,
};

/**
 * The size picker on the request form.
 *
 * Each option gets its own jar rather than a shared Lucide icon, because the
 * whole point of the choice is "how big" — so the picture has to carry that.
 * The jar is drawn to scale against the others, sitting on a common baseline,
 * which makes 100ml legible as the largest option without reading any text.
 *
 * `selected` only changes colour and the lid highlight; the geometry is
 * identical in both states so nothing shifts when a choice is made. That matters
 * for CLS and for not startling somebody mid-selection.
 */
export function SizeJarIllustration({
  size,
  selected = false,
  className,
}: {
  size: string;
  selected?: boolean;
  className?: string;
}) {
  const bodyHeight = JAR_HEIGHT_BY_SIZE[size] ?? 78;
  const width = 62;
  const baseline = 112;
  const top = baseline - bodyHeight;
  const label = `${size} jar of JBC herbal skin cream`;

  return (
    <svg
      viewBox="0 0 140 124"
      className={className}
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id={`jbc-size-lid-${size}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={GREEN} />
          <stop offset="100%" stopColor={GREEN_DARK} />
        </linearGradient>
        <linearGradient id={`jbc-size-body-${size}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor={GREEN_TINT} />
        </linearGradient>
      </defs>

      {/* ground shadow, sized to the jar so the three look grounded, not floating */}
      <ellipse
        cx="70"
        cy={baseline + 6}
        rx={width / 2 + 6}
        ry="4"
        fill={GREEN_DARK}
        opacity={selected ? "0.22" : "0.12"}
      />

      {/* lid */}
      <rect
        x={70 - width / 2}
        y={top}
        width={width}
        height="16"
        rx="6"
        fill={`url(#jbc-size-lid-${size})`}
      />
      {/* lid highlight — brighter when chosen, so the selection reads on the art too */}
      <rect
        x={70 - width / 2}
        y={top + 4}
        width={width}
        height="5"
        rx="2.5"
        fill="#ffffff"
        opacity={selected ? "0.4" : "0.22"}
      />

      {/* body */}
      <rect
        x={70 - width / 2 + 4}
        y={top + 16}
        width={width - 8}
        height={bodyHeight - 16}
        rx="10"
        fill={`url(#jbc-size-body-${size})`}
        stroke={selected ? GREEN_DARK : GREEN}
        strokeWidth={selected ? "3" : "2"}
      />
      {/* body highlight */}
      <rect
        x={70 - width / 2 + 9}
        y={top + 24}
        width="6"
        height={Math.max(8, bodyHeight - 36)}
        rx="3"
        fill="#ffffff"
        opacity="0.7"
      />

      {/* leaf mark on the label, so the jar is recognisably JBC at 60px wide */}
      <path
        d={`M70 ${top + bodyHeight / 2 - 4} C${70 - 7} ${top + bodyHeight / 2 + 4} ${
          70 - 7
        } ${top + bodyHeight / 2 + 14} 70 ${top + bodyHeight / 2 + 20} C${
          70 + 7
        } ${top + bodyHeight / 2 + 14} ${70 + 7} ${top + bodyHeight / 2 + 4} 70 ${
          top + bodyHeight / 2 - 4
        } Z`}
        fill={GREEN}
        opacity={selected ? "1" : "0.7"}
      />
    </svg>
  );
}