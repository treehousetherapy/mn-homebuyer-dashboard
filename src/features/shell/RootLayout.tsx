// src/features/shell/RootLayout.tsx
import { Outlet } from '@tanstack/react-router'
import { useState, useEffect, useMemo, createContext, useContext } from 'react'
import { AppShell } from './AppShell'
import { loadProfile, saveProfile, hasProfile, DEFAULT_PROFILE, STORAGE_KEY } from '@/lib/profile'
import { effectiveDebt, calcBuyingPower, type BuyingPower } from '@/lib/calc'
import { PROGRAMS } from '@/lib/data'
import { eligibleFor } from '@/lib/eligibility'
import { getNextAction } from '@/lib/nextAction'
import type { Profile } from '@/lib/types'

// ── App context ─────────────────────────────────────────────────────────────
export interface AppContextValue {
  profile: Profile
  setProfile: (updates: Partial<Profile>) => void
  selProgs: Set<string>
  setSelProgs: React.Dispatch<React.SetStateAction<Set<string>>>
  selectedPropertyId: number | null
  setSelectedPropertyId: (id: number | null) => void
  checkCount: number
  setCheckCount: (n: number) => void
  price: number
  setPrice: (p: number) => void
  rate: number
  setRate: (r: number) => void
  totalDPA: number
  buyingPower: BuyingPower
  effDebt: number
}

const AppContext = createContext<AppContextValue | null>(null)

/** Hook for page components to read app-wide state. */
export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used inside RootLayout')
  return ctx
}

export function RootLayout() {
  const [profile, setProfileState] = useState<Profile>(() => loadProfile() ?? DEFAULT_PROFILE)
  const [selProgs, setSelProgs] = useState<Set<string>>(new Set())
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null)
  const [checkCount, setCheckCount] = useState(0)
  const [price, setPrice] = useState(350000)
  const [rate, setRate] = useState(7.0)
  const [totalDPA, setTotalDPA] = useState(0)

  // Persist profile changes
  useEffect(() => {
    if (hasProfile(profile)) saveProfile(profile)
  }, [profile])

  // Clear legacy storage key from previous versions
  useEffect(() => {
    try { localStorage.removeItem('mn_homebuyer_profile') } catch { /* ok */ }
  }, [])

  const effDebt = useMemo(() => effectiveDebt(profile), [profile])
  const mi = profile.income / 12 || 1

  // Auto-select eligible open programs on first load
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recalculate totalDPA when selProgs or price changes
  useEffect(() => {
    let t = 0
    selProgs.forEach((id) => {
      const pr = PROGRAMS.find((x) => x.id === id)
      if (!pr) return
      let a = pr.max
      if (pr.pctCap) a = Math.min(a, price * pr.pctCap / 100)
      t += a
    })
    setTotalDPA(t)
  }, [selProgs, price])

  const buyingPower = useMemo(
    () => calcBuyingPower(profile.income / 12, effDebt, rate, totalDPA),
    [profile.income, effDebt, rate, totalDPA]
  )

  // Journey completion % — 1 point per phase with meaningful data
  const completionPct = useMemo(() => {
    let done = 0
    if (profile.income > 0 && profile.fico > 0 && profile.county !== '') done++
    if (price !== 350000 || totalDPA > 0) done++
    if (selProgs.size > 0) done++
    if (selectedPropertyId !== null) done++
    if (checkCount >= 3) done++
    return Math.round((done / 5) * 100)
  }, [profile, price, totalDPA, selProgs, selectedPropertyId, checkCount])

  const nextAction = useMemo(
    () => getNextAction(profile, selProgs, selectedPropertyId, checkCount, effDebt, mi),
    [profile, selProgs, selectedPropertyId, checkCount, effDebt, mi]
  )

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setProfileState(DEFAULT_PROFILE)
    setSelProgs(new Set())
    setSelectedPropertyId(null)
    setCheckCount(0)
    window.location.href = '/'
  }

  const appContext: AppContextValue = {
    profile,
    setProfile: (updates) => setProfileState((prev) => ({ ...prev, ...updates })),
    selProgs,
    setSelProgs,
    selectedPropertyId,
    setSelectedPropertyId,
    checkCount,
    setCheckCount,
    price,
    setPrice,
    rate,
    setRate,
    totalDPA,
    buyingPower,
    effDebt,
  }

  return (
    <AppContext.Provider value={appContext}>
      <AppShell
        completionPct={completionPct}
        hasProfile={hasProfile(profile)}
        nextAction={nextAction}
        onReset={handleReset}
      >
        <Outlet />
      </AppShell>
    </AppContext.Provider>
  )
}
