import { useState, useEffect, useMemo } from 'react'
import type { Profile } from '@/lib/types'
import { PROGRAMS } from '@/lib/data'
import { eligibleFor } from '@/lib/eligibility'

export function useProgramMatches(profile: Profile, price: number) {
  const [selProgs, setSelProgs] = useState<Set<string>>(new Set())

  useEffect(() => {
    setSelProgs((prev) => {
      if (prev.size > 0) return prev
      const s = new Set<string>()
      PROGRAMS.forEach((pr) => {
        const { ok } = eligibleFor(pr, profile)
        if (ok && pr.status !== 'closed') s.add(pr.id)
      })
      return s
    })
  // Intentionally once on mount for auto-select
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalDPA = useMemo(() => {
    let t = 0
    selProgs.forEach((id) => {
      const pr = PROGRAMS.find((x) => x.id === id)
      if (!pr) return
      let a = pr.max
      if (pr.pctCap) a = Math.min(a, (price * pr.pctCap) / 100)
      t += a
    })
    return t
  }, [selProgs, price])

  return { selProgs, setSelProgs, totalDPA }
}
