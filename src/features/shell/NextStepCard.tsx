// src/features/shell/NextStepCard.tsx
import { useState } from 'react'
import { X } from 'lucide-react'
import type { NextAction } from '@/lib/nextAction'

const DISMISS_KEY = 'nextStepDismissed'

interface NextStepCardProps {
  action: NextAction
  hasProfile: boolean
}

export function NextStepCard({ action, hasProfile }: NextStepCardProps) {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISS_KEY) === '1'
  )

  if (!hasProfile || dismissed) return null

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="mx-4 mt-3 flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 shadow-sm shadow-emerald-900/5">
      {/* Pulse dot */}
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>

      {/* Message */}
      <p className="flex-1 text-sm text-emerald-900 leading-snug">{action.message}</p>

      {/* CTA */}
      <a
        href={action.href}
        className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors no-underline whitespace-nowrap"
      >
        {action.cta} →
      </a>

      {/* Dismiss */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss recommendation"
        className="shrink-0 text-emerald-600/60 hover:text-emerald-700 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
