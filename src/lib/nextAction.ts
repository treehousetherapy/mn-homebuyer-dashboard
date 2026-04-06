// src/lib/nextAction.ts
import type { Profile } from './types'
import { PROGRAMS } from './data'

export interface NextAction {
  message: string
  cta: string
  href: string
}

/**
 * Returns the single highest-priority recommended action for this buyer.
 * First match wins. Pure function — no React dependency.
 */
export function getNextAction(
  profile: Profile,
  selProgs: Set<string>,
  selectedPropertyId: number | null,
  checkCount: number,
  effDebt: number,
  monthlyIncome: number,
): NextAction {
  const dti = monthlyIncome > 0 ? (effDebt / monthlyIncome) * 100 : 0
  const firstGenDPAClosed = PROGRAMS.find((p) => p.id === 'firstgen')?.status === 'closed'

  // Priority 1: no income entered
  if (profile.income === 0) {
    return { message: 'Enter your income to see your buying power', cta: 'Get started', href: '/get-ready' }
  }
  // Priority 2: credit too low
  if (profile.fico < 620) {
    return { message: 'Your credit score needs work — see your improvement roadmap', cta: 'See roadmap', href: '/get-ready' }
  }
  // Priority 3: no education
  if (!profile.education) {
    return { message: 'Complete homebuyer education to unlock DPA programs', cta: 'Learn more', href: '/assistance' }
  }
  // Priority 4: insufficient savings
  if (profile.savings < 5000) {
    return { message: 'Build your savings — you need at least $5K to close', cta: 'See targets', href: '/affordability' }
  }
  // Priority 5: first-gen with closed portal
  if (profile.firstGen && firstGenDPAClosed) {
    return {
      message: 'Join the First-Gen DPA alert list to be notified when the portal reopens',
      cta: 'Join list',
      href: '/assistance',
    }
  }
  // Priority 6: DTI too high
  if (dti > 43) {
    return { message: 'Reduce monthly debt to qualify for more homes', cta: 'See options', href: '/affordability' }
  }
  // Priority 7: no programs selected
  if (selProgs.size === 0) {
    return { message: 'Review programs you may qualify for', cta: 'See programs', href: '/assistance' }
  }
  // Priority 8: no property viewed
  if (selectedPropertyId === null) {
    return { message: 'Explore homes within your budget', cta: 'Browse homes', href: '/homes' }
  }
  // Priority 9: checklist under 50% (4 of 8 items)
  if (checkCount < 4) {
    return { message: 'Work through your closing checklist', cta: 'Open checklist', href: '/milestones' }
  }
  // Priority 10: default
  return { message: "You're on track — keep going!", cta: 'Continue', href: '/get-ready' }
}
