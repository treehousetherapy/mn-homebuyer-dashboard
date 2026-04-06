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

/** Returns true when the profile has enough data to show the dashboard. */
export function hasProfile(p: Profile): boolean {
  return p.income > 0 && p.fico > 0 && p.county !== ''
}
