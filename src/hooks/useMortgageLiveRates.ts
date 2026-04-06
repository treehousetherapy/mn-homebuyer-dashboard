import { useState, useEffect } from 'react'
import type { LiveRates } from '@/lib/types'
import { fetchLiveRates } from '@/lib/calc'

export function useMortgageLiveRates() {
  const [rate, setRate] = useState(7.0)
  const [liveRates, setLiveRates] = useState<LiveRates | null>(null)

  useEffect(() => {
    fetchLiveRates().then((r) => {
      if (r) {
        setLiveRates(r)
        setRate(r.rate30)
      }
    })
  }, [])

  return { rate, setRate, liveRates }
}
