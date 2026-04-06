// src/features/shell/TopProgress.tsx
import { Home } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

const PHASE_MAP: Record<string, { num: number; name: string }> = {
  '/get-ready':     { num: 1, name: 'Get Ready' },
  '/affordability': { num: 2, name: 'Your Budget' },
  '/assistance':    { num: 3, name: 'Help Available' },
  '/homes':         { num: 4, name: 'Find a Home' },
  '/milestones':    { num: 5, name: 'Close with Confidence' },
}

interface TopProgressProps {
  completionPct: number
  hasProfile: boolean
}

export function TopProgress({ completionPct, hasProfile }: TopProgressProps) {
  if (!hasProfile) return null

  const pathname = window.location.pathname
  const phase = Object.entries(PHASE_MAP)
    .filter(([href]) => pathname === href || pathname.startsWith(href + '/'))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1]

  return (
    <div className="h-11 flex items-center px-4 gap-4 bg-white border-b border-slate-100 shrink-0">
      <span className="text-sm font-medium text-slate-700 shrink-0">
        {phase ? `Step ${phase.num} of 5 · ${phase.name}` : 'MN Homebuyer Dashboard'}
      </span>

      <div className="flex-1 max-w-[240px]">
        <Progress value={completionPct} className="h-1.5" />
      </div>

      <div className="flex-1" />

      <Button
        variant="outline"
        size="sm"
        className="hidden sm:inline-flex h-8 gap-1.5 border-slate-200 bg-white px-3 text-slate-700 shadow-sm text-xs"
        asChild
      >
        <a href="/"><Home className="h-3.5 w-3.5" />Home</a>
      </Button>
    </div>
  )
}
