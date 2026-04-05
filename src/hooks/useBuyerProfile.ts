import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface BuyerProfile {
  annualIncome: number
  creditScore: number
  isFirstGen: boolean
  targetCity: string
  monthlyDebt: number
}

const DEFAULT_PROFILE: BuyerProfile = {
  annualIncome: 0,
  creditScore: 640,
  isFirstGen: false,
  targetCity: '',
  monthlyDebt: 0,
}

export function useBuyerProfile() {
  const [profile, setProfileState] = useState<BuyerProfile>(DEFAULT_PROFILE)
  const [loading, setLoading] = useState(true)

  // Load profile from Supabase on mount
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfileState({
          annualIncome: data.annual_income ?? 0,
          creditScore: data.credit_score ?? 640,
          isFirstGen: data.is_first_gen ?? false,
          targetCity: data.target_city ?? '',
          monthlyDebt: data.monthly_debt ?? 0,
        })
      }
      setLoading(false)
    })
  }, [])

  // Save profile to Supabase and update local state
  const setProfile = async (updates: Partial<BuyerProfile>) => {
    const next = { ...profile, ...updates }
    setProfileState(next)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('user_profiles').upsert({
      id: user.id,
      annual_income: next.annualIncome,
      credit_score: next.creditScore,
      is_first_gen: next.isFirstGen,
      target_city: next.targetCity,
      monthly_debt: next.monthlyDebt,
    })
  }

  return { profile, setProfile, loading }
}
