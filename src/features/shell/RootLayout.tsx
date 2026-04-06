// src/features/shell/RootLayout.tsx
import { Outlet, Navigate, useRouterState } from '@tanstack/react-router'
import { useState, useEffect, useMemo, createContext, useContext } from 'react'
import { AppShell } from './AppShell'
import { loadProfile, saveProfile, hasProfile, DEFAULT_PROFILE, STORAGE_KEY } from '@/lib/profile'
import { effectiveDebt, calcBuyingPower, getTax, type BuyingPower } from '@/lib/calc'
import { getNextAction } from '@/lib/nextAction'
import { calcReadiness, type ReadinessScore } from '@/lib/eligibility'
import { useJourneyPhase } from '@/hooks/useJourneyPhase'
import { useProgramMatches } from '@/hooks/useProgramMatches'
import { useMortgageLiveRates } from '@/hooks/useMortgageLiveRates'
import type { Profile, LiveRates } from '@/lib/types'

// ── App context ─────────────────────────────────────────────────────────────
export interface AppContextValue {
  profile: Profile
  setProfile: (updates: Partial<Profile>) => void
  selProgs: Set<string>
  setSelProgs: React.Dispatch<React.SetStateAction<Set<string>>>
  selectedPropertyId: number | null
  setSelectedPropertyId: (id: number | null) => void
  checkIds: Set<string>
  setCheckIds: React.Dispatch<React.SetStateAction<Set<string>>>
  price: number
  setPrice: (p: number) => void
  rate: number
  setRate: (r: number) => void
  loanType: 'fha' | 'conv'
  setLoanType: React.Dispatch<React.SetStateAction<'fha' | 'conv'>>
  downPct: number
  setDownPct: (n: number) => void
  totalDPA: number
  buyingPower: BuyingPower
  effDebt: number
  liveRates: LiveRates | null
  readiness: ReadinessScore
  studentDebt: number
  taxRate: number
}

const AppContext = createContext<AppContextValue | null>(null)

/** Hook for page components to read app-wide state. */
export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used inside RootLayout')
  return ctx
}

export function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [profile, setProfileState] = useState<Profile>(() => loadProfile() ?? DEFAULT_PROFILE)
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null)
  const [checkIds, setCheckIds] = useState<Set<string>>(new Set())
  const [price, setPrice] = useState(350000)
  const [loanType, setLoanType] = useState<'fha' | 'conv'>('fha')
  const [downPct, setDownPct] = useState(3.5)

  const { rate, setRate, liveRates } = useMortgageLiveRates()
  const { selProgs, setSelProgs, totalDPA } = useProgramMatches(profile, price)

  useEffect(() => {
    if (hasProfile(profile)) saveProfile(profile)
  }, [profile])

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) {
        localStorage.removeItem('mn_homebuyer_profile')
      }
    } catch {
      /* ok */
    }
  }, [])

  const effDebt = useMemo(() => effectiveDebt(profile), [profile])
  const mi = profile.income / 12 || 1
  const studentDebt = useMemo(
    () => (profile.studentLoanIDR ? profile.studentLoanBal * 0.005 : 0),
    [profile.studentLoanBal, profile.studentLoanIDR],
  )
  const taxRate = getTax(profile.county)
  const readiness = useMemo(() => calcReadiness(profile, effDebt, mi), [profile, effDebt, mi])

  const buyingPower = useMemo(
    () => calcBuyingPower(profile.income / 12, effDebt, rate, totalDPA),
    [profile.income, effDebt, rate, totalDPA],
  )

  const checkCount = checkIds.size
  const { completionPct } = useJourneyPhase(
    profile,
    price,
    totalDPA,
    selProgs,
    selectedPropertyId,
    checkCount,
  )

  const nextAction = useMemo(
    () => getNextAction(profile, selProgs, selectedPropertyId, checkCount, effDebt, mi),
    [profile, selProgs, selectedPropertyId, checkCount, effDebt, mi],
  )

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setProfileState(DEFAULT_PROFILE)
    setSelProgs(new Set())
    setSelectedPropertyId(null)
    setCheckIds(new Set())
    window.location.href = '/'
  }

  const profileReady = hasProfile(profile)
  /** Root is always the welcome landing; other routes require a complete profile. */
  const bareLanding = pathname === '/'

  const appContext: AppContextValue = {
    profile,
    setProfile: (updates) => setProfileState((prev) => ({ ...prev, ...updates })),
    selProgs,
    setSelProgs,
    selectedPropertyId,
    setSelectedPropertyId,
    checkIds,
    setCheckIds,
    price,
    setPrice,
    rate,
    setRate,
    loanType,
    setLoanType,
    downPct,
    setDownPct,
    totalDPA,
    buyingPower,
    effDebt,
    liveRates,
    readiness,
    studentDebt,
    taxRate,
  }

  if (!profileReady && pathname !== '/') {
    return (
      <AppContext.Provider value={appContext}>
        <Navigate to="/" replace />
      </AppContext.Provider>
    )
  }

  if (bareLanding) {
    return (
      <AppContext.Provider value={appContext}>
        <div className="min-h-screen landing-shell">
          <Outlet />
        </div>
      </AppContext.Provider>
    )
  }

  return (
    <AppContext.Provider value={appContext}>
      <AppShell
        completionPct={completionPct}
        hasProfile
        nextAction={nextAction}
        onReset={handleReset}
      >
        <Outlet />
      </AppShell>
    </AppContext.Provider>
  )
}
