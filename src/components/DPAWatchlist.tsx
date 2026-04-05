import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bell, CheckCircle } from 'lucide-react'

export function DPAWatchlist() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('dpa_waitlist')
      .insert({ email, first_gen: true })

    setLoading(false)

    if (error) {
      if (error.code === '23505') {
        // duplicate email — treat as success
        setSubmitted(true)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-green-800">You're on the list!</p>
            <p className="text-sm text-green-700 mt-0.5">
              We'll email you the moment the First-Gen DPA portal opens. Get your documents ready now.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-amber-50 border-amber-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="h-4 w-4 text-amber-600 shrink-0" />
        <span className="font-semibold text-amber-800">
          First-Gen DPA Fund — Portal Currently Closed
        </span>
      </div>
      <p className="text-sm text-amber-700 mb-3">
        HF 999 proposes a new $100M appropriation (2025–2026 session). Funds disappear fast —
        get notified the moment it reopens.
      </p>
      <form onSubmit={handleSignup} className="flex gap-2">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="flex-1"
          disabled={loading}
        />
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? 'Saving…' : 'Notify Me'}
        </Button>
      </form>
      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
    </div>
  )
}
