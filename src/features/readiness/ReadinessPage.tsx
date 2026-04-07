import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAppContext } from '@/features/shell/RootLayout'
import { fmt, calcMort } from '@/lib/calc'
import { DonutChart } from '@/features/charts/DonutChart'
import { Gauge } from '@/features/readiness/Gauge'
import { Row } from '@/features/shared/Row'

export function ReadinessPage() {
  const ctx = useAppContext()
  const { profile, setProfile, price, rate, loanType, downPct, totalDPA, effDebt, studentDebt, taxRate, liveRates } =
    ctx
  const mi = profile.income / 12 || 1
  const readiness = ctx.readiness

  const mort = calcMort({
    price,
    rate,
    loanType,
    downPct,
    totalDPA,
    taxRate,
    monthlyIncome: mi,
    effectiveDebt: effDebt,
  })

  return (
    <div className="space-y-4">
      <header className="pb-5">
        <h1 className="text-2xl font-bold text-slate-800">Get Ready</h1>
        <p className="text-sm text-slate-400 mt-1">Mortgage readiness, debt picture, and payment at your target price.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-4 fade-in">
        <Card className="dashboard-card overflow-hidden">
          <CardHeader className="pb-3 pt-1">
            <CardTitle className="text-base font-semibold text-slate-800">Mortgage Readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex flex-col items-center gap-1">
              <Gauge score={readiness.score} label={readiness.label} color={readiness.color} />
              <p className="text-center text-[10px] leading-snug text-slate-500 max-w-[220px]">
                Strength score weights credit, DTI, savings, and other factors—not only checklist count.
              </p>
            </div>
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-100 bg-slate-50/40">
              {readiness.items.map((item) => (
                <div key={item.label} className="flex items-start gap-3 px-3 py-2.5 first:rounded-t-lg last:rounded-b-lg">
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[10px] font-bold ${
                      item.tier === 'strong'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : item.tier === 'ok'
                          ? 'border-amber-200 bg-amber-50 text-amber-900'
                          : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {item.tier === 'weak' ? '✗' : '✓'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-800">{item.label}</p>
                    <p className="text-[11px] text-slate-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            {profile.isSelfEmployed && profile.jobYears < 2 && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                Self-employed &lt;2yr: lenders require 2-year income average.
              </div>
            )}
            {studentDebt > 0 && (
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-800">
                Student loans (IDR): lenders impute {fmt(studentDebt)}/mo into DTI even if actual payment is $0.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="dashboard-card lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-3 pt-1">
            <CardTitle className="text-base font-semibold text-slate-800">Financial Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-3">Income &amp; Debt</h4>
                <Row l="Gross Monthly Income" v={fmt(profile.income / 12)} />
                <Row l="Monthly Debt" v={fmt(profile.debt)} />
                {studentDebt > 0 && <Row l="Student Loan (IDR)" v={`+ ${fmt(studentDebt)}`} />}
                {profile.debtReduce > 0 && <Row l="Debt Reduction" v={`- ${fmt(profile.debtReduce)}`} green />}
                <Separator className="my-1.5" />
                <Row l="Effective Debt" v={fmt(effDebt)} bold />
                <Row l="Current DTI (no housing)" v={`${mi > 1 ? ((effDebt / mi) * 100).toFixed(1) : '0'}%`} />
                <div className="mt-3">
                  <Label className="text-xs">Debt reduction ($/mo)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={profile.debtReduce || ''}
                    onChange={(e) => setProfile({ debtReduce: Math.max(0, +e.target.value) })}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-3">
                  Payment at {fmt(price)}
                </h4>
                <DonutChart
                  size={175}
                  label={fmt(mort.total)}
                  segments={[
                    { value: mort.pi, color: '#0ea5e9', label: `P&I ${fmt(mort.pi)}` },
                    { value: mort.tax, color: '#14b8a6', label: `Tax ${fmt(mort.tax)}` },
                    { value: mort.ins, color: '#f97316', label: `Ins ${fmt(mort.ins)}` },
                    { value: mort.mip + mort.pmi, color: '#ec4899', label: `${loanType === 'fha' ? 'MIP' : 'PMI'} ${fmt(mort.mip + mort.pmi)}` },
                  ]}
                />
                <p className="text-[10px] text-center text-slate-500 mt-2">
                  Tax: {(taxRate * 100).toFixed(2)}% ({profile.county || 'est.'} county)
                </p>
                {liveRates && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 mt-3 space-y-1">
                    <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-widest">Current Mortgage Rates</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">30-Year Fixed</span>
                      <span className="font-bold text-emerald-700">{liveRates.rate30}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">15-Year Fixed</span>
                      <span className="font-bold text-emerald-700">{liveRates.rate15}%</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground">Week of {liveRates.date} · Freddie Mac PMMS via FRED</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
