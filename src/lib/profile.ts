// src/lib/profile.ts
import type { Profile } from './types'

export const STORAGE_KEY = 'mn_homebuyer_v3'

export const DEFAULT_PROFILE: Profile = {
  name: '',
  income: 0,
  fico: 0,
  debt: 0,
  savings: 0,
  county: '',
  household: 0,
  jobYears: 0,
  firstTime: false,
  firstGen: false,
  education: false,
  studentLoanBal: 0,
  studentLoanIDR: false,
  isSelfEmployed: false,
  debtReduce: 0,
}

const LEGACY_STORAGE_KEY = 'mn_homebuyer_profile'

export function loadProfile(): Profile | null {
  try {
    const d = localStorage.getItem(STORAGE_KEY)
    if (d) return JSON.parse(d) as Profile
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacy) {
      const parsed = JSON.parse(legacy) as Profile
      try {
        localStorage.setItem(STORAGE_KEY, legacy)
      } catch {
        /* ignore */
      }
      return parsed
    }
  } catch {
    return null
  }
  return null
}

export function saveProfile(p: Profile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    // storage not available — silent fail
  }
}

/**
 * Minimum fields required before unlocking the dashboard shell and journey routes.
 * (Stricter than a single field — name, income, valid FICO range, county, household.)
 */
export function isProfileComplete(p: Profile): boolean {
  const nameOk = p.name.trim().length > 0
  const incomeOk = p.income > 0
  const ficoOk = p.fico >= 300 && p.fico <= 850
  const countyOk = p.county !== ''
  const householdOk = p.household >= 1 && p.household <= 10
  return nameOk && incomeOk && ficoOk && countyOk && householdOk
}

/** Returns true when the profile has enough data to show the dashboard. */
export function hasProfile(p: Profile): boolean {
  return isProfileComplete(p)
}
