import {
  HERO_VISUAL,
  HERO_VISUAL_MACRO_BARS,
  HERO_VISUAL_MICRO_BARS,
  HERO_VISUAL_TREND,
} from "@/lib/hero-visual-config";

type HeroFinanceVisualProps = {
  className?: string;
};

const VB_W = 400;
const VB_H = 220;
const BASE_Y = 178;
const CHART_LEFT = 44;
const CHART_WIDTH = 312;
const CHART_HEIGHT = 108;

const MACRO_GAP = 5;
const MACRO_WIDTH =
  (CHART_WIDTH - MACRO_GAP * (HERO_VISUAL_MACRO_BARS.length - 1)) /
  HERO_VISUAL_MACRO_BARS.length;

const MICRO_GAP = 1.2;
const MICRO_WIDTH =
  (CHART_WIDTH - MICRO_GAP * (HERO_VISUAL_MICRO_BARS.length - 1)) /
  HERO_VISUAL_MICRO_BARS.length;

const TREND_POINTS = HERO_VISUAL_TREND.map(([x, y]) => `${x},${y}`).join(" ");

const AREA_POINTS = [
  `${CHART_LEFT},${BASE_Y}`,
  ...HERO_VISUAL_TREND.map(([x, y]) => `${x},${y}`),
  `${CHART_LEFT + CHART_WIDTH},${BASE_Y}`,
].join(" ");

const lastTrend = HERO_VISUAL_TREND[HERO_VISUAL_TREND.length - 1];
const prevTrend = HERO_VISUAL_TREND[HERO_VISUAL_TREND.length - 2];

/**
 * Borderless holographic growth chart — integrates into the landing background.
 * Animations: `app/globals.css` (`.hero-fv-*`).
 */
export function HeroFinanceVisual({ className = "" }: HeroFinanceVisualProps) {
  const {
    accent,
    accentBright,
    accentGlow,
    accentMuted,
    grid,
    gridBright,
    macroBarTop,
    macroBarBottom,
    microBarTop,
    microBarBottom,
    platformStroke,
    platformFill,
    bloom,
    areaTop,
  } = HERO_VISUAL;

  return (
    <div
      className={`hero-fv-root relative mx-auto w-full max-w-[460px] ${className}`}
      aria-hidden
    >
      <div
        className="hero-fv-bloom pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(ellipse 90% 75% at 50% 55%, ${bloom} 0%, transparent 72%)`,
        }}
      />

      <div className="hero-fv-perspective hero-fv-float relative">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="hero-fv-svg relative block h-auto w-full"
          role="img"
          aria-label=""
        >
          <defs>
            <linearGradient id="hero-fv-macro-bar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={macroBarTop} />
              <stop offset="100%" stopColor={macroBarBottom} />
            </linearGradient>
            <linearGradient id="hero-fv-micro-bar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={microBarTop} />
              <stop offset="55%" stopColor={accent} stopOpacity="0.35" />
              <stop offset="100%" stopColor={microBarBottom} />
            </linearGradient>
            <linearGradient id="hero-fv-line" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={accentMuted} />
              <stop offset="50%" stopColor={accent} />
              <stop offset="100%" stopColor={accentBright} />
            </linearGradient>
            <linearGradient id="hero-fv-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={areaTop} />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="hero-fv-platform" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={platformFill} />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <filter id="hero-fv-glow-soft" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="hero-fv-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker
              id="hero-fv-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M0 0 L8 4 L0 8 Z" fill={accentGlow} />
            </marker>
            <linearGradient id="hero-fv-edge-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="88%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <mask id="hero-fv-vfade">
              <rect width={VB_W} height={VB_H} fill="url(#hero-fv-edge-fade)" />
            </mask>
          </defs>

          <g mask="url(#hero-fv-vfade)">
            {/* Subtle blueprint grid */}
            <g opacity="0.85">
              {Array.from({ length: 8 }, (_, i) => {
                const y = 48 + i * 16;
                const inset = i * 4;
                return (
                  <line
                    key={`h-${i}`}
                    x1={32 + inset}
                    y1={y}
                    x2={VB_W - 32 - inset}
                    y2={y}
                    stroke={i % 2 === 0 ? gridBright : grid}
                    strokeWidth="0.6"
                  />
                );
              })}
              {Array.from({ length: 13 }, (_, i) => {
                const t = i / 12;
                const x = 48 + t * 304;
                return (
                  <line
                    key={`v-${i}`}
                    x1={x}
                    y1={52}
                    x2={x - 22}
                    y2={BASE_Y + 6}
                    stroke={grid}
                    strokeWidth="0.45"
                  />
                );
              })}
            </g>

            {/* Holographic base platform */}
            <g className="hero-fv-platform">
              <path
                d="M 56 182 L 344 182 L 328 172 L 72 172 Z"
                fill="url(#hero-fv-platform)"
                stroke={platformStroke}
                strokeWidth="1"
                filter="url(#hero-fv-glow-soft)"
              />
              <line
                x1="72"
                y1="172"
                x2="328"
                y2="172"
                stroke={accent}
                strokeOpacity="0.25"
                strokeWidth="0.75"
              />
            </g>

            {/* Wide macro bars */}
            {HERO_VISUAL_MACRO_BARS.map((ratio, i) => {
              const x = CHART_LEFT + i * (MACRO_WIDTH + MACRO_GAP);
              const h = ratio * CHART_HEIGHT;
              const y = BASE_Y - h;
              return (
                <rect
                  key={`macro-${i}`}
                  x={x}
                  y={y}
                  width={MACRO_WIDTH}
                  height={h}
                  rx="1"
                  fill="url(#hero-fv-macro-bar)"
                  className="hero-fv-macro-bar"
                  style={{ animationDelay: `${i * 0.08}s` }}
                />
              );
            })}

            {/* Dense micro signal bars */}
            {HERO_VISUAL_MICRO_BARS.map((ratio, i) => {
              const x = CHART_LEFT + i * (MICRO_WIDTH + MICRO_GAP);
              const h = ratio * CHART_HEIGHT * 0.95;
              const y = BASE_Y - h;
              return (
                <rect
                  key={`micro-${i}`}
                  x={x}
                  y={y}
                  width={MICRO_WIDTH}
                  height={h}
                  fill="url(#hero-fv-micro-bar)"
                  className="hero-fv-micro-bar"
                  style={{ animationDelay: `${(i % 12) * 0.06}s` }}
                />
              );
            })}

            <polygon points={AREA_POINTS} fill="url(#hero-fv-area)" className="hero-fv-area" />

            {/* Glowing trend line + arrow */}
            <polyline
              points={TREND_POINTS}
              fill="none"
              stroke="url(#hero-fv-line)"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#hero-fv-glow-strong)"
              markerEnd="url(#hero-fv-arrow)"
              className="hero-fv-trend"
            />
            <polyline
              points={TREND_POINTS}
              fill="none"
              stroke={accentBright}
              strokeWidth="0.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="0.6"
              className="hero-fv-trend"
            />

            {HERO_VISUAL_TREND.map(([x, y], i) => (
              <g key={`node-${i}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill={accentGlow}
                  fillOpacity="0.2"
                  filter="url(#hero-fv-glow-soft)"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="2.25"
                  fill={accentBright}
                  className="hero-fv-node"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              </g>
            ))}

            {/* Arrowhead emphasis at terminus */}
            <line
              x1={prevTrend[0]}
              y1={prevTrend[1]}
              x2={lastTrend[0]}
              y2={lastTrend[1]}
              stroke={accentGlow}
              strokeWidth="2"
              strokeLinecap="round"
              filter="url(#hero-fv-glow-strong)"
              opacity="0.9"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
