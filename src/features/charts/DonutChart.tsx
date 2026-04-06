function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const s = (startAngle * Math.PI) / 180
  const e = (endAngle * Math.PI) / 180
  const x1 = cx + r * Math.cos(s)
  const y1 = cy + r * Math.sin(s)
  const x2 = cx + r * Math.cos(e)
  const y2 = cy + r * Math.sin(e)
  const large = endAngle - startAngle > 180 ? 1 : 0
  return `M${x1},${y1} A${r},${r},0,${large},1,${x2},${y2}`
}

export function DonutChart({
  segments,
  size = 175,
  label,
}: {
  segments: { value: number; color: string; label: string }[]
  size?: number
  label?: string
}) {
  const total = segments.reduce((a, s) => a + s.value, 0)
  if (total === 0) return null
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.33
  const sw = size * 0.085
  const gap = 1.8
  let angle = -90
  const arcs = segments.map((s) => {
    const sweep = (s.value / total) * 360
    const a0 = angle + gap / 2
    const a1 = angle + sweep - gap / 2
    angle += sweep
    return { ...s, d: arcPath(cx, cy, r, a0, a1) }
  })
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(214 30% 92%)" strokeWidth={sw} />
          {arcs.map((a, i) => (
            <path
              key={i}
              d={a.d}
              fill="none"
              stroke={a.color}
              strokeWidth={sw}
              strokeLinecap="round"
              className="chart-anim"
              style={{ filter: `drop-shadow(0 1px 2px ${a.color}33)` }}
            />
          ))}
          {label && (
            <>
              <text
                x={cx}
                y={cy + 2}
                textAnchor="middle"
                fill="hsl(222 47% 11%)"
                style={{ fontSize: size * 0.115, fontWeight: 700, fontFeatureSettings: '"tnum","lnum"' }}
              >
                {label}
              </text>
              <text
                x={cx}
                y={cy + size * 0.115}
                textAnchor="middle"
                fill="hsl(215 16% 52%)"
                style={{ fontSize: size * 0.052, fontWeight: 500, letterSpacing: '0.08em' }}
              >
                / MONTH
              </text>
            </>
          )}
        </svg>
      </div>
      <div className="w-full grid grid-cols-2 gap-x-5 gap-y-2.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 min-w-0">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span className="text-[11px] leading-tight text-slate-600 truncate">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
