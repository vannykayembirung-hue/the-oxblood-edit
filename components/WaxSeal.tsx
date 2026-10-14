/**
 * WaxSeal — the house seal of The Oxblood Edit.
 *
 * Pure inline SVG (no external assets, no gradient ids, so it can be rendered
 * from server components as well as inside the client quiz): an oxblood wax
 * body with a scalloped edge, a double antique-gold (#C6A15B) ring and the
 * "OE" monogram struck in Cinzel.
 */

interface WaxSealProps {
  /** Rendered size in pixels (square). */
  size?: number;
  /** Monogram struck into the wax. */
  monogram?: string;
  /** Extra classes on the wrapper. */
  className?: string;
  /** Marks the seal as decorative so screen readers skip it. */
  decorative?: boolean;
}

const SCALLOP_LOBES = 22;

function scallopLobes(cx: number, cy: number, radius: number, lobeRadius: number) {
  return Array.from({ length: SCALLOP_LOBES }, (_, i) => {
    const angle = (i / SCALLOP_LOBES) * Math.PI * 2;
    return {
      key: `lobe-${i}`,
      cx: Number((cx + Math.cos(angle) * radius).toFixed(2)),
      cy: Number((cy + Math.sin(angle) * radius).toFixed(2)),
      r: lobeRadius
    };
  });
}

function cardinalDiamonds(cx: number, cy: number, radius: number) {
  return [0, 90, 180, 270].map((deg) => {
    const angle = (deg * Math.PI) / 180;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    return { key: `diamond-${deg}`, transform: `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(45)` };
  });
}

export default function WaxSeal({
  size = 116,
  monogram = "OE",
  className = "",
  decorative = true
}: WaxSealProps) {
  const cx = 60;
  const cy = 60;
  const lobes = scallopLobes(cx, cy, 46, 7.4);
  const diamonds = cardinalDiamonds(cx, cy, 42.5);
  const beadRing = Array.from({ length: 44 }, (_, i) => {
    const angle = (i / 44) * Math.PI * 2;
    return `${(cx + Math.cos(angle) * 33.4).toFixed(2)},${(cy + Math.sin(angle) * 33.4).toFixed(2)}`;
  });

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : `The Oxblood Edit wax seal with monogram ${monogram}`}
      focusable="false"
    >
      {/* cast shadow */}
      <ellipse cx={cx} cy={66} rx={48} ry={46} fill="#000000" opacity="0.45" />

      {/* scalloped wax edge */}
      {lobes.map((lobe) => (
        <circle key={lobe.key} cx={lobe.cx} cy={lobe.cy} r={lobe.r} fill="#4C0E18" />
      ))}

      {/* wax body */}
      <circle cx={cx} cy={cy} r={46.5} fill="#4C0E18" />
      <circle cx={cx} cy={cy} r={44} fill="#6E1423" />
      <circle cx={cx} cy={cy} r={38} fill="#5A1120" opacity="0.9" />
      <ellipse cx={48} cy={44} rx={20} ry={13} fill="#C6A15B" opacity="0.1" />

      {/* double antique gold ring */}
      <circle
        cx={cx}
        cy={cy}
        r={40.5}
        fill="none"
        stroke="#C6A15B"
        strokeWidth="1.6"
        opacity="0.95"
      />
      <circle
        cx={cx}
        cy={cy}
        r={36}
        fill="none"
        stroke="#C6A15B"
        strokeWidth="0.9"
        opacity="0.72"
      />

      {/* bead ring between the two gold rings */}
      <polyline
        points={beadRing.join(" ")}
        fill="none"
        stroke="#C6A15B"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="0.01 4.4"
        opacity="0.5"
      />

      {diamonds.map((d) => (
        <rect
          key={d.key}
          x={-1.9}
          y={-1.9}
          width={3.8}
          height={3.8}
          fill="#C6A15B"
          opacity="0.85"
          transform={d.transform}
        />
      ))}

      {/* monogram */}
      <text
        x={cx}
        y={cy + 8.5}
        textAnchor="middle"
        fontFamily="'Cinzel', Georgia, serif"
        fontSize="21"
        fontWeight={600}
        letterSpacing="2.5"
        fill="#EDE4D0"
      >
        {monogram}
      </text>

      {/* struck rule under the monogram */}
      <line x1={44} y1={72.5} x2={76} y2={72.5} stroke="#C6A15B" strokeWidth="0.8" opacity="0.65" />
      <line x1={46} y1={43.5} x2={74} y2={43.5} stroke="#C6A15B" strokeWidth="0.8" opacity="0.45" />
    </svg>
  );
}
