import { useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useAppContext } from '@/features/shell/RootLayout'
import { PROGRAMS } from '@/lib/data'
import { eligibleFor } from '@/lib/eligibility'
import { fmt } from '@/lib/calc'
import { DPAWatchlist } from '@/components/DPAWatchlist'

export function AssistancePage() {
  const { profile, selProgs, setSelProgs, totalDPA, price } = useAppContext()

  // Pass current price so programs over their price cap show ineligible
  const eligProgs = useMemo(
    () => PROGRAMS.map((pr) => ({ ...pr, ...eligibleFor(pr, profile, price) })),
    [profile, price],
  )

  const toggleProg = useCallback(
    (id: string) => {
      setSelProgs((prev) => {
        const n = new Set(prev)
        if (n.has(id)) n.delete(id)
        else n.add(id)
        return n
      })
    },
    [setSelProgs],
  )

  return (
    <div className="space-y-4">
      <header className="pb-5">
        <h1 className="text-2xl font-bold text-slate-800">Help Available</h1>
        <p className="text-sm text-slate-400 mt-1">Stack DPA programs you qualify for — amounts update your buying power automatically.</p>
      </header>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">
          <span className="font-bold" style={{ color: 'var(--brand-sky)' }}>
            {fmt(totalDPA)}
          </span>{' '}
          from {selProgs.size} program(s)
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={() => {
              const s = new Set<string>()
              eligProgs.forEach((x) => {
                if (x.ok) s.add(x.id)
              })
              setSelProgs(s)
            }}
          >
            Select Eligible
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setSelProgs(new Set())}>
            Clear
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 fade-in">
        {eligProgs.map((pr) => (
          <Card
            key={pr.id}
            className={`dashboard-card cursor-pointer transition-all hover:shadow-md ${
              selProgs.has(pr.id) ? 'ring-2 ring-[#2d6a2e] shadow-sm' : ''
            } ${!pr.ok ? 'opacity-50' : ''}`}
            onClick={() => toggleProg(pr.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h4 className="font-semibold text-sm">{pr.short}</h4>
                  <p className="text-[10px] text-muted-foreground">{pr.name}</p>
                </div>
                <Switch
                  checked={selProgs.has(pr.id)}
                  onCheckedChange={() => toggleProg(pr.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <p className="text-xl font-bold" style={{ color: 'var(--brand-sky)' }}>
                {fmt(pr.max)}
              </p>
              <Badge
                variant="outline"
                className={`text-[9px] mt-1 ${pr.status === 'open' ? 'bg-sky-50 text-sky-700 border-sky-200' : pr.status === 'limited' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}
              >
                {pr.status}
              </Badge>
              <Badge className={`text-[9px] mt-1 ml-1 ${pr.ok ? 'bg-sky-50 text-sky-700' : 'bg-red-50 text-red-700'}`}>
                {pr.ok ? 'Eligible' : pr.reason}
              </Badge>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] mt-2">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{pr.type}</span>
                <span className="text-muted-foreground">Income</span>
                <span className="font-medium">{pr.incomeLimit > 900000 ? 'None' : fmt(pr.incomeLimit)}</span>
                <span className="text-muted-foreground">FICO</span>
                <span className="font-medium">{pr.ficoMin || 'None'}</span>
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">{fmt(pr.priceLimit)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 border-t pt-1.5">{pr.notes}</p>
              <a
                href={`https://${pr.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {pr.url}
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      <DPAWatchlist />
    </div>
  )
}
