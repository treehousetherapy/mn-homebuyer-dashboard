import { useId } from 'react'

export function Gauge({ score, label, color }: { score: number; label: string; color: string }) {
  const gid = useId().replace(/:/g, '')
  const r = 50
  const cx = 64
  const circ = 2 * Math.PI * r
  const arc = circ * 0.75
  const off = arc - (score / 100) * arc
  const endColor = '#38bdf8'
  return (
    <div className="w-full rounded-2xl bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_0_0_1px_rgba(15,23,42,0.04)]">
      <svg width="100%" height="112" viewBox="0 0 128 104" className="max-w-[200px] mx-auto overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={`${gid}-g`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
        </defs>
        <path
          d="M 14 80 A 50 50 0 1 1 114 80"
          fill="none"
          stroke="hsl(220 14% 91%)"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          d="M 14 80 A 50 50 0 1 1 114 80"
          fill="none"
          stroke={`url(#${gid}-g)`}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={arc}
          strokeDashoffset={off}
          className="gauge-anim"
        />
        <text
          x={cx}
          y="56"
          textAnchor="middle"
          fill="hsl(222 47% 11%)"
          style={{ fontSize: '26px', fontWeight: 650, fontFeatureSettings: '"tnum","lnum"' }}
        >
          {score}%
        </text>
        <text
          x={cx}
          y="78"
          textAnchor="middle"
          fill="hsl(215 16% 42%)"
          style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em' }}
        >
          {label.toUpperCase()}
        </text>
      </svg>
    </div>
  )
}
