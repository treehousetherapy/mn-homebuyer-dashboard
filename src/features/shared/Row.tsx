export function Row({
  l,
  v,
  bold,
  green,
}: {
  l: string
  v: string
  bold?: boolean
  green?: boolean
}) {
  return (
    <div
      className={`flex items-baseline justify-between py-1.5 border-b border-slate-100/80 last:border-0 ${bold ? '' : 'opacity-90'}`}
    >
      <span className={`text-xs ${bold ? 'font-medium text-slate-700' : 'text-slate-500'}`}>{l}</span>
      <span
        className={`text-xs tabular-nums ${green ? 'text-sky-600 font-semibold' : ''} ${bold ? 'text-sm font-bold text-slate-900' : ''}`}
      >
        {v}
      </span>
    </div>
  )
}
