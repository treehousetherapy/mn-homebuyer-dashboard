import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useAppContext } from '@/features/shell/RootLayout'
import { COUNTIES } from '@/lib/data'
import { clamp } from '@/lib/calc'
import { isProfileComplete } from '@/lib/profile'
import { logoImg } from '@/features/shared/logo'
import type { ToggleField } from '@/lib/types'

export function OnboardingForm({ mode = 'new' }: { mode?: 'new' | 'welcomeEdit' }) {
  const { profile, setProfile } = useAppContext()
  const navigate = useNavigate()
  const p = profile

  const canContinue = isProfileComplete(p)
  const isEdit = mode === 'welcomeEdit'

  const handlePrimary = () => {
    if (!canContinue) return
    if (isEdit) {
      navigate({ to: '/', replace: true })
      return
    }
    navigate({ to: '/get-ready' })
  }

  const handleCancelEdit = () => {
    navigate({ to: '/', replace: true })
  }

  return (
    <div className="landing-shell flex min-h-screen flex-col items-stretch justify-center py-8 fade-in">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_minmax(0,28rem)] lg:items-center lg:gap-12">
        <div className="space-y-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Minnesota · First-time &amp; first-gen buyers
          </p>
          <h1
            className="font-display text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl"
            style={{ color: 'var(--brand-navy)' }}
          >
            A clear path from readiness to closing.
          </h1>
          <p className="max-w-md text-base leading-relaxed text-slate-600">
            Model buying power, stack DPA programs, and compare scenarios in one place—built like a data workspace,
            not a generic calculator.
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-green)]" />
              Live rate context and county tax estimates
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-green)]" />
              Program eligibility against your profile
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-green)]" />
              Your inputs stay in this browser unless you choose otherwise
            </li>
          </ul>
        </div>
        <Card className="dashboard-card w-full border-slate-200/90 shadow-xl shadow-slate-900/5">
          <CardHeader className="space-y-1 border-b border-slate-100 pb-4 pt-6 sm:px-8">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="" className="h-11 w-11 object-contain" />
              <div>
                <CardTitle className="font-display text-lg font-semibold tracking-tight text-slate-900">
                  {isEdit ? 'Welcome form' : 'Create your profile'}
                </CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  {isEdit
                    ? 'Update the details you entered on the welcome screen.'
                    : 'Used to personalize every chart and estimate below.'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pb-6 pt-4 sm:px-8">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Name</Label>
                <Input
                  placeholder="First name"
                  value={p.name}
                  onChange={(e) => setProfile({ name: e.target.value })}
                  className="mt-1 h-9"
                />
              </div>
              <div>
                <Label className="text-xs">County</Label>
                <Select value={p.county} onValueChange={(v) => setProfile({ county: v })}>
                  <SelectTrigger className="mt-1 h-9">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTIES.filter(Boolean).map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Annual Gross Income</Label>
                <Input
                  type="number"
                  placeholder="e.g. 90000"
                  value={p.income || ''}
                  onChange={(e) => setProfile({ income: +e.target.value })}
                  className="mt-1 h-9"
                />
              </div>
              <div>
                <Label className="text-xs">FICO Score (300–850)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 640"
                  value={p.fico || ''}
                  onChange={(e) => {
                    const raw = e.target.value
                    setProfile({ fico: raw === '' ? 0 : clamp(+raw, 0, 850) })
                  }}
                  className="mt-1 h-9"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Monthly Debt Payments</Label>
                <Input
                  type="number"
                  placeholder="e.g. 800"
                  value={p.debt || ''}
                  onChange={(e) => setProfile({ debt: +e.target.value })}
                  className="mt-1 h-9"
                />
              </div>
              <div>
                <Label className="text-xs">Savings</Label>
                <Input
                  type="number"
                  placeholder="e.g. 10000"
                  value={p.savings || ''}
                  onChange={(e) => setProfile({ savings: +e.target.value })}
                  className="mt-1 h-9"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Household Size</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={p.household || ''}
                  onChange={(e) => setProfile({ household: clamp(+e.target.value, 1, 10) })}
                  className="mt-1 h-9"
                />
              </div>
              <div>
                <Label className="text-xs">Years at Job</Label>
                <Input
                  type="number"
                  placeholder="2"
                  value={p.jobYears || ''}
                  onChange={(e) => setProfile({ jobYears: +e.target.value })}
                  className="mt-1 h-9"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Student Loan Balance</Label>
                <Input
                  type="number"
                  placeholder="e.g. 40000"
                  value={p.studentLoanBal || ''}
                  onChange={(e) => setProfile({ studentLoanBal: +e.target.value })}
                  className="mt-1 h-9"
                />
              </div>
              <div className="flex items-end pb-1">
                <div className="flex items-center gap-2">
                  <Switch checked={p.studentLoanIDR} onCheckedChange={(v) => setProfile({ studentLoanIDR: v })} />
                  <Label className="text-[10px] text-muted-foreground leading-tight">On IDR plan</Label>
                </div>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              {(
                [
                  ['First-time homebuyer', 'firstTime'],
                  ['First-generation buyer', 'firstGen'],
                  ['Completed homebuyer education', 'education'],
                  ['Self-employed / commission', 'isSelfEmployed'],
                ] as [string, ToggleField][]
              ).map(([label, key]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-xs">{label}</Label>
                  <Switch checked={Boolean(p[key])} onCheckedChange={(v) => setProfile({ [key]: v })} />
                </div>
              ))}
            </div>
            {!canContinue && (
              <p className="text-xs text-destructive leading-relaxed">
                Complete all required fields: your name, county, annual income, FICO between 300 and 850, and household
                size (1–10) before continuing.
              </p>
            )}
            <div className="flex flex-col gap-2">
              <Button
                className="w-full h-11 font-semibold brand-btn text-white shadow-md"
                disabled={!canContinue}
                onClick={handlePrimary}
              >
                {isEdit ? 'Save and return home' : 'Continue to dashboard'}
              </Button>
              {isEdit && (
                <Button type="button" variant="ghost" className="w-full h-9 text-sm" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
            <p className="text-center text-[11px] text-slate-500">Educational tool only. Not financial, legal, or tax advice.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
