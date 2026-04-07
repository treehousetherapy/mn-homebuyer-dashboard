import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { useAppContext } from '@/features/shell/RootLayout'
import { fmt, calcMort } from '@/lib/calc'
import { Row } from '@/features/shared/Row'

export function AffordabilityPage() {
  const ctx = useAppContext()
  const {
    profile,
    price,
    setPrice,
    rate,
    setRate,
    downPct,
    setDownPct,
    loanType,
    setLoanType,
    totalDPA,
    buyingPower,
    effDebt,
    liveRates,
    taxRate,
  } = ctx
  const mi = profile.income / 12 || 1

  const mort = useMemo(
    () =>
      calcMort({
        price,
        rate,
        loanType,
        downPct,
        totalDPA,
        taxRate,
        monthlyIncome: mi,
        effectiveDebt: effDebt,
      }),
    [price, rate, loanType, downPct, totalDPA, taxRate, mi, effDebt],
  )

  const mortAlt = useMemo(
    () =>
      calcMort({
        price,
        rate,
        loanType: loanType === 'fha' ? 'conv' : 'fha',
        downPct,
        totalDPA,
        taxRate,
        monthlyIncome: mi,
        effectiveDebt: effDebt,
      }),
    [price, rate, loanType, downPct, totalDPA, taxRate, mi, effDebt],
  )

  return (
    <div className="space-y-4">
      <header className="pb-5">
        <h1 className="text-2xl font-bold text-slate-800">Your Budget</h1>
        <p className="text-sm text-slate-400 mt-1">Scenario builder, buying power, and FHA vs conventional comparison.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-4 fade-in">
        <Card className="dashboard-card overflow-hidden">
          <CardHeader className="pb-3 pt-1">
            <CardTitle className="text-base font-semibold text-slate-800">Scenario Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <div className="flex justify-between">
                <Label className="text-xs">Target Price</Label>
                <span className="text-xs font-bold">{fmt(price)}</span>
              </div>
              <Slider min={100000} max={750000} step={5000} value={[price]} onValueChange={([v]) => setPrice(v)} className="mt-2" />
            </div>
            <div>
              <div className="flex justify-between">
                <Label className="text-xs">Interest Rate</Label>
                <span className="text-xs font-bold">{rate}%</span>
              </div>
              <Slider min={4.5} max={9.5} step={0.125} value={[rate]} onValueChange={([v]) => setRate(v)} className="mt-2" />
            </div>
            <div>
              <div className="flex justify-between">
                <Label className="text-xs">Down Payment</Label>
                <span className="text-xs font-bold">{downPct}%</span>
              </div>
              <Slider min={0} max={20} step={0.5} value={[downPct]} onValueChange={([v]) => setDownPct(v)} className="mt-2" />
            </div>
            {liveRates && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 space-y-1">
                <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-widest">Live Freddie Mac Rates</p>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">30-Year Fixed</span>
                  <span className="font-bold text-emerald-700">{liveRates.rate30}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">15-Year Fixed</span>
                  <span className="font-bold text-emerald-700">{liveRates.rate15}%</span>
                </div>
                <p className="text-[9px] text-muted-foreground">Week of {liveRates.date} · Source: FRED / Freddie Mac PMMS</p>
                <div className="flex gap-1.5 mt-1">
                  <Button variant="outline" size="sm" className="text-[10px] h-6 flex-1" onClick={() => setRate(liveRates.rate30)}>
                    Use 30yr ({liveRates.rate30}%)
                  </Button>
                  <Button variant="outline" size="sm" className="text-[10px] h-6 flex-1" onClick={() => setRate(liveRates.rate15)}>
                    Use 15yr ({liveRates.rate15}%)
                  </Button>
                </div>
              </div>
            )}
            {price > 515200 && <p className="text-[10px] text-destructive">Over $515,200 First-Gen DPA limit</p>}
            <div>
              <Label className="text-xs">Loan Type</Label>
              <div className="flex gap-2 mt-1">
                {(['fha', 'conv'] as const).map((t) => (
                  <Button
                    key={t}
                    variant={loanType === t ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 text-xs h-8"
                    onClick={() => setLoanType(t)}
                  >
                    {t === 'fha' ? 'FHA (3.5%)' : 'Conventional'}
                  </Button>
                ))}
              </div>
            </div>
            <Separator />
            <div className="rounded-lg bg-muted/60 p-3 space-y-1">
              <Row l="Buying power (DTI only)" v={buyingPower.dtiMax > 0 ? fmt(buyingPower.dtiMax) : '--'} />
              <Row l="Buying power (with DPA)" v={buyingPower.totalPower > 0 ? fmt(buyingPower.totalPower) : '--'} bold />
              <Row l="Target" v={fmt(price)} />
              <Row
                l={price <= buyingPower.totalPower ? 'Within budget' : 'Over budget'}
                v={price <= buyingPower.totalPower ? '✓' : '⚠'}
                bold
                green={price <= buyingPower.totalPower}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-3 pt-1">
            <CardTitle className="text-base font-semibold text-slate-800">FHA vs Conventional</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { m: mort, label: loanType.toUpperCase() },
                { m: mortAlt, label: loanType === 'fha' ? 'CONVENTIONAL' : 'FHA' },
              ].map(({ m, label }) => (
                <div key={label}>
                  <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">{label}</h4>
                  <Row l="P&I" v={fmt(m.pi)} />
                  <Row l={`Tax (${(taxRate * 100).toFixed(1)}%)`} v={fmt(m.tax)} />
                  <Row l="Insurance" v={fmt(m.ins)} />
                  <Row l={label.includes('FHA') ? 'MIP' : 'PMI'} v={fmt(m.mip + m.pmi)} />
                  <Separator className="my-1" />
                  <Row l="Monthly" v={fmt(m.total)} bold />
                  <Row l="Back DTI" v={`${m.bDTI.toFixed(1)}%`} />
                  <Separator className="my-1" />
                  <Row l={`Down (${m.dpPct}%)`} v={fmt(m.dp)} />
                  <Row l="Closing (3%)" v={fmt(m.cc)} />
                  <Row l="DPA" v={`(${fmt(totalDPA)})`} green />
                  <Row l="Out-of-Pocket" v={fmt(m.oop)} bold />
                  <div
                    className={`mt-2 text-[10px] font-semibold px-2 py-1 rounded-lg ${
                      m.bDTI <= 43 ? 'bg-sky-50 text-sky-700' : m.bDTI <= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {m.bDTI <= 43 ? '✓ Qualifies' : m.bDTI <= 50 ? '⚡ Borderline' : '⚠ Over limit'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
