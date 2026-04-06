// src/lib/profile.ts
import type { Profile } from './types'

export const STORAGE_KEY = 'mn_homebuyer_v2'

export const DEFAULT_PROFILE: Profile = {
  name: '',
  income: 0,
  fico: 0,
  debt: 0,
  savings: 0,
  county: '',
  household: 1,
  jobYears: 0,
  firstTime: false,
  firstGen: false,
  education: false,
  studentLoanBal: 0,
  studentLoanIDR: false,
  isSelfEmployed: false,
  debtReduce: 0,
}

export function loadProfile(): Profile | null {
  try {
    const d = localStorage.getItem(STORAGE_KEY)
    return d ? (JSON.parse(d) as Profile) : null
  } catch {
    return null
  }
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
