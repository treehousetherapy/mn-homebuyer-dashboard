import type { ReactNode, KeyboardEvent } from 'react'
import { Card, CardContent } from '@/components/ui/card'

export function KPI({
  label,
  value,
  sub,
  color,
  icon,
  onClick,
  semantic,
}: {
  label: string
  value: string
  sub?: string
  color?: string
  icon?: ReactNode
  onClick?: () => void
  semantic?: boolean
}) {
  return (
    <Card
      className={`dashboard-card kpi-card min-h-[108px] transition-[box-shadow,border-color] duration-200 ${
        onClick ? 'cursor-pointer focus-within:ring-2 focus-within:ring-slate-400/30' : ''
      }`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e: KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <CardContent className="p-4 h-full flex flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 mb-1">{label}</p>
            <p
              className={`text-2xl font-semibold leading-tight tabular-nums tracking-tight ${semantic && color ? '' : 'text-slate-900'}`}
              style={semantic && color ? { color } : undefined}
            >
              {value}
            </p>
            {sub && <p className="text-[11px] text-slate-500 mt-1 leading-snug">{sub}</p>}
          </div>
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
