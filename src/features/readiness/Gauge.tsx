/**
 * Gauge — symmetric 200° arc, solid fill color (no gradient to avoid
 * uneven color distribution on a curved path).
 *
 * Arc: center (80, 88), r=64, from 170° to 10° clockwise (200° sweep).
 * That places start/end symmetrically just below center-left/center-right,
 * with the open gap at the very bottom. The fill always starts at the left
 * end and progresses clockwise, matching natural left-to-right reading.
 */
export function Gauge({ score, label, color }: { score: number; label: string; color: string }) {
  const cx = 80
  const cy = 88
  const r  = 64
  const sw = 10           // stroke width

  const deg = (d: number) => (d * Math.PI) / 180
  const sAngle = deg(170)       // start: bottom-left
  const eAngle = deg(10)        // end:   bottom-right

  const sx = cx + r * Math.cos(sAngle)
  const sy = cy + r * Math.sin(sAngle)
  const ex = cx + r * Math.cos(eAngle)
  const ey = cy + r * Math.sin(eAngle)

  const arcPath = `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 1 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`
  const arcLen  = 2 * Math.PI * r * (200 / 360)
  const dashOff = arcLen * (1 - score / 100)

  return (
    <div className="w-full rounded-2xl bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_0_0_1px_rgba(15,23,42,0.04)]">
      <svg
        width="100%"
        height="96"
        viewBox="0 0 160 96"
        className="max-w-[220px] mx-auto overflow-visible"
        aria-hidden
      >
        {/* Track */}
        <path
          d={arcPath}
          fill="none"
          stroke="hsl(220 14% 91%)"
          strokeWidth={sw}
          strokeLinecap="round"
        />

        {/* Fill — solid color, no gradient (gradient looks uneven on curves) */}
        <path
          d={arcPath}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${arcLen} ${arcLen}`}
          strokeDashoffset={dashOff}
          className="gauge-anim"
        />

        {/* Score */}
        <text
          x={cx}
          y="60"
          textAnchor="middle"
          fill="hsl(222 47% 11%)"
          style={{ fontSize: '28px', fontWeight: 700, fontFeatureSettings: '"tnum","lnum"' }}
        >
          {score}%
        </text>

        {/* Label */}
        <text
          x={cx}
          y="78"
          textAnchor="middle"
          fill={color}
          style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.14em' }}
        >
          {label.toUpperCase()}
        </text>
      </svg>
    </div>
  )
}
