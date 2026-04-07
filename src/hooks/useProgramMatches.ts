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
        // Pass price so programs over their price cap are excluded on auto-select.
        // Closed programs are filtered by eligibleFor.
        const { ok } = eligibleFor(pr, profile, price)
        if (ok) s.add(pr.id)
      })
      return s
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalDPA = useMemo(() => {
    let t = 0
    selProgs.forEach((id) => {
      const pr = PROGRAMS.find((x) => x.id === id)
      if (!pr) return
      // Only count programs that are still eligible at the current price
      const { ok } = eligibleFor(pr, profile, price)
      if (!ok) return
      let a = pr.max
      if (pr.pctCap) a = Math.min(a, (price * pr.pctCap) / 100)
      t += a
    })
    return t
  }, [selProgs, price, profile])

  return { selProgs, setSelProgs, totalDPA }
}
