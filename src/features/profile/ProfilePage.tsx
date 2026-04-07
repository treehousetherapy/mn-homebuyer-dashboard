import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useAppContext } from '@/features/shell/RootLayout'
import { COUNTIES } from '@/lib/data'
import { clamp } from '@/lib/calc'
import { logoImg } from '@/features/shared/logo'
import type { ToggleField } from '@/lib/types'

export function ProfilePage() {
  const { profile, setProfile } = useAppContext()
  const p = profile

  return (
    <div className="max-w-xl space-y-4 fade-in">
      <header className="border-b border-slate-200/70 pb-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">Account</p>
        <h1 className="text-xl font-semibold text-slate-900 font-display">Edit profile</h1>
        <p className="text-sm text-slate-600 mt-1">Update your inputs—charts and eligibility refresh automatically.</p>
      </header>

      <Card className="dashboard-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="" className="h-10 w-10 object-contain" />
            <div>
              <CardTitle className="font-display text-base">Profile</CardTitle>
              <CardDescription className="text-sm">Stored locally in your browser.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Name</Label>
              <Input value={p.name} onChange={(e) => setProfile({ name: e.target.value })} className="mt-1 h-9" />
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
                value={p.income || ''}
                onChange={(e) => setProfile({ income: +e.target.value })}
                className="mt-1 h-9"
              />
            </div>
            <div>
              <Label className="text-xs">FICO Score</Label>
              <Input
                type="number"
                value={p.fico || ''}
                onChange={(e) => setProfile({ fico: clamp(+e.target.value, 0, 850) })}
                className="mt-1 h-9"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Monthly Debt</Label>
              <Input type="number" value={p.debt || ''} onChange={(e) => setProfile({ debt: +e.target.value })} className="mt-1 h-9" />
            </div>
            <div>
              <Label className="text-xs">Savings</Label>
              <Input type="number" value={p.savings || ''} onChange={(e) => setProfile({ savings: +e.target.value })} className="mt-1 h-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Household Size</Label>
              <Input
                type="number"
                placeholder="e.g. 2"
                value={p.household || ''}
                onChange={(e) => setProfile({ household: e.target.value === '' ? 0 : clamp(+e.target.value, 1, 10) })}
                className="mt-1 h-9"
              />
            </div>
            <div>
              <Label className="text-xs">Years at Job</Label>
              <Input type="number" value={p.jobYears || ''} onChange={(e) => setProfile({ jobYears: +e.target.value })} className="mt-1 h-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Student Loan Balance</Label>
              <Input
                type="number"
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
        </CardContent>
      </Card>
    </div>
  )
}
