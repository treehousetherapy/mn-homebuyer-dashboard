import type { ReactNode, KeyboardEvent } from 'react'
import { Card, CardContent } from '@/components/ui/card'

// Cycle through brand accent colors for icon chips
const CHIP_COLORS = [
  { bg: 'bg-sky-50',    icon: 'text-sky-500'    },
  { bg: 'bg-teal-50',   icon: 'text-teal-500'   },
  { bg: 'bg-orange-50', icon: 'text-orange-500'  },
  { bg: 'bg-pink-50',   icon: 'text-pink-500'   },
  { bg: 'bg-violet-50', icon: 'text-violet-500'  },
]

let chipIndex = 0

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
  const chipColor = CHIP_COLORS[chipIndex++ % CHIP_COLORS.length]

  return (
    <Card
      className={`dashboard-card kpi-card min-h-[112px] transition-all duration-200 ${
        onClick ? 'cursor-pointer focus-within:ring-2 focus-within:ring-sky-400/30' : ''
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-1">{label}</p>
            <p
              className={`text-2xl font-bold leading-tight tabular-nums tracking-tight ${semantic && color ? '' : 'text-slate-800'}`}
              style={semantic && color ? { color } : undefined}
            >
              {value}
            </p>
            {sub && <p className="text-[11px] text-slate-400 mt-1 leading-snug">{sub}</p>}
          </div>
          {icon && (
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${chipColor.bg} ${chipColor.icon}`}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
