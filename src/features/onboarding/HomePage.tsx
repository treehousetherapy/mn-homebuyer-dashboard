import { useNavigate } from '@tanstack/react-router'
import { Building2, CalendarDays, Banknote, Gift, PieChart } from 'lucide-react'
import { hasProfile } from '@/lib/profile'
import { fmt, fmtK, calcMort } from '@/lib/calc'
import { useAppContext } from '@/features/shell/RootLayout'
import { OnboardingForm } from './OnboardingForm'
import { KPI } from '@/features/kpi/KPI'

export function HomePage() {
  const ctx = useAppContext()
  const { profile, price, rate, loanType, downPct, totalDPA, buyingPower, readiness, effDebt, liveRates } = ctx
  const navigate = useNavigate()

  if (!hasProfile(profile)) {
    return <OnboardingForm />
  }

  const mi = profile.income / 12 || 1
  const mort = calcMort({
    price,
    rate,
    loanType,
    downPct,
    totalDPA,
    taxRate: ctx.taxRate,
    monthlyIncome: mi,
    effectiveDebt: effDebt,
  })

  return (
    <div className="space-y-6 fade-in">
      <header className="border-b border-slate-200/70 pb-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">Your journey</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 font-display">Buyer snapshot</h1>
        <p className="mt-1 max-w-xl text-sm text-slate-600">
          Quick read on readiness, budget, and programs—pick a next step from the card above or dive into a phase.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPI
          label="Buying Power"
          value={buyingPower.totalPower > 0 ? fmtK(buyingPower.totalPower) : '--'}
          sub={`DTI: ${fmtK(buyingPower.dtiMax)} + DPA`}
          icon={<Building2 className="h-5 w-5" strokeWidth={1.5} />}
          onClick={() => navigate({ to: '/affordability' })}
        />
        <KPI
          label="Est. Monthly"
          value={profile.income > 0 ? fmt(mort.total) : '--'}
          sub={`${fmt(price)} · ${rate}%${liveRates ? ' (live)' : ''}`}
          color={mort.bDTI <= 43 ? '#15803d' : mort.bDTI <= 50 ? '#b45309' : '#b91c1c'}
          semantic
          icon={<CalendarDays className="h-5 w-5" strokeWidth={1.5} />}
          onClick={() => navigate({ to: '/affordability' })}
        />
        <KPI
          label="Cash to Close"
          value={fmt(mort.oop)}
          sub={mort.oop === 0 ? 'DPA covers all' : 'After DPA'}
          color={mort.oop === 0 ? '#15803d' : undefined}
          semantic={mort.oop === 0}
          icon={<Banknote className="h-5 w-5" strokeWidth={1.5} />}
          onClick={() => navigate({ to: '/affordability' })}
        />
        <KPI
          label="DPA Available"
          value={fmtK(totalDPA)}
          sub={`${ctx.selProgs.size} program(s)`}
          icon={<Gift className="h-5 w-5" strokeWidth={1.5} />}
          onClick={() => navigate({ to: '/assistance' })}
        />
        <KPI
          label="Readiness"
          value={`${readiness.score}%`}
          sub={readiness.label}
          color={readiness.color}
          semantic
          icon={<PieChart className="h-5 w-5" strokeWidth={1.5} />}
          onClick={() => navigate({ to: '/get-ready' })}
        />
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white/60 p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-800 mb-2">Suggested next steps</p>
        <ul className="list-disc list-inside space-y-1 text-slate-600">
          <li>Review your readiness checklist on Get Ready</li>
          <li>Adjust price and rate on Your Budget</li>
          <li>Browse homes in reach on Find a Home</li>
        </ul>
      </div>
    </div>
  )
}
