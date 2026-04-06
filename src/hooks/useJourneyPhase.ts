import { useMemo } from 'react'
import type { Profile } from '@/lib/types'

/**
 * Journey completion % — one checkpoint per phase (matches RootLayout / design spec).
 */
export function useJourneyPhase(
  profile: Profile,
  price: number,
  totalDPA: number,
  selProgs: Set<string>,
  selectedPropertyId: number | null,
  checkCount: number,
) {
  const completionPct = useMemo(() => {
    let done = 0
    if (profile.income > 0 && profile.fico > 0 && profile.county !== '') done++
    if (price !== 350000 || totalDPA > 0) done++
    if (selProgs.size > 0) done++
    if (selectedPropertyId !== null) done++
    if (checkCount >= 3) done++
    return Math.round((done / 5) * 100)
  }, [profile, price, totalDPA, selProgs, selectedPropertyId, checkCount])

  return { completionPct }
}
