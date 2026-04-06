import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { useAppContext } from '@/features/shell/RootLayout'
import { CHECKLIST } from '@/lib/data'
import { AIChatbot } from '@/components/AIChatbot'

export function MilestonesPage() {
  const { profile, checkIds, setCheckIds } = useAppContext()

  const buyerProfile = {
    annualIncome: profile.income,
    creditScore: profile.fico,
    isFirstGen: profile.firstGen,
    targetCity: profile.county,
    monthlyDebt: profile.debt,
  }

  return (
    <div className="space-y-4">
      <header className="border-b border-slate-200/70 pb-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">Phase 5</p>
        <h1 className="text-xl font-semibold text-slate-900 font-display">Close with confidence</h1>
        <p className="text-sm text-slate-600 mt-1">Milestones, documents, contacts, and your AI coach.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-4 fade-in">
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base font-semibold">Homebuying Milestones</CardTitle>
            <CardDescription className="text-xs">
              {checkIds.size}/{CHECKLIST.length} complete
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {CHECKLIST.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors ${
                  checkIds.has(item.id) ? 'bg-emerald-50' : 'hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  checked={checkIds.has(item.id)}
                  onCheckedChange={(v) => {
                    setCheckIds((prev) => {
                      const n = new Set(prev)
                      if (v) n.add(item.id)
                      else n.delete(item.id)
                      return n
                    })
                  }}
                />
                <div>
                  <p className={`text-sm ${checkIds.has(item.id) ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                    <span className="text-muted-foreground mr-1">{i + 1}.</span>
                    {item.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{item.tip}</p>
                </div>
              </div>
            ))}
            <div className="mt-4">
              <Progress value={(checkIds.size / CHECKLIST.length) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm font-semibold">Lender Document Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs">
              {[
                '2 years W-2 forms',
                '2 years federal tax returns (1040)',
                '2 months bank statements',
                '30 days recent paystubs',
                'Photo ID',
                'Social Security card or ITIN',
                'Business license (if self-employed)',
                '2 years business returns (if self-employed)',
                'YTD profit & loss (if self-employed)',
                'Gift letter (if receiving gift funds)',
              ].map((d) => (
                <div key={d} className="flex items-center gap-2 py-1 text-muted-foreground">
                  <span className="opacity-30">☐</span>
                  {d}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm font-semibold">Key Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { o: 'NeighborWorks Home Partners', p: '651-292-8710', n: 'Welcome Home DPA. Somali/Spanish/Hmong.' },
                { o: 'Dakota County CDA', p: '651-675-4472', n: 'Home Stretch education.' },
                { o: 'Minnesota Housing', p: 'mnhousing.gov', n: 'Start Up / Step Up.' },
                { o: 'MMCDC', p: 'firstgendpa.org', n: 'First-Gen DPA Fund.' },
                { o: 'MN Homeownership Center', p: 'hocmn.org', n: 'Education & advisors.' },
              ].map((c) => (
                <div key={c.o} className="p-2.5 rounded-lg border">
                  <p className="text-xs font-semibold">{c.o}</p>
                  <p className="text-xs" style={{ color: 'var(--brand-green)' }}>
                    {c.p}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{c.n}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-4">
        <AIChatbot buyerProfile={buyerProfile} />
      </div>

      <div className="text-center py-3 space-y-1">
        <p className="text-[10px] text-muted-foreground">
          Educational tool. Not financial, legal, or tax advice. Verify all details with program administrators.
        </p>
        <p className="text-[11px] text-muted-foreground font-medium">Built by Mohamud Omar</p>
      </div>
    </div>
  )
}
