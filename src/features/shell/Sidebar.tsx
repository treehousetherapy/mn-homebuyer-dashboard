// src/features/shell/Sidebar.tsx
import { useState } from 'react'
import { LineChart, Wallet, Gift, Search, ClipboardCheck, Home, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

const faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null
const logoImg = faviconLink?.href ?? './logo.png'

const PHASES = [
  { num: 1, label: 'Get Ready',             href: '/get-ready',     Icon: LineChart },
  { num: 2, label: 'Your Budget',           href: '/affordability', Icon: Wallet },
  { num: 3, label: 'Help Available',        href: '/assistance',    Icon: Gift },
  { num: 4, label: 'Find a Home',           href: '/homes',         Icon: Search },
  { num: 5, label: 'Close with Confidence', href: '/milestones',    Icon: ClipboardCheck },
]

interface SidebarProps {
  onReset?: () => void
}

export function Sidebar({ onReset }: SidebarProps) {
  const [open, setOpen] = useState(true)
  const [resetConfirm, setResetConfirm] = useState(false)
  const pathname = window.location.pathname

  return (
    <aside
      className={`flex flex-col flex-shrink-0 transition-all duration-300 ${open ? 'w-[220px]' : 'w-14'}`}
      style={{ background: 'hsl(215 25% 12%)', minHeight: '100vh', position: 'sticky', top: 0 }}
    >
      {/* Header row */}
      <div className="flex items-center gap-1 border-b border-white/10 p-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/70"
          aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <span className="text-lg leading-none">≡</span>
        </button>
        <a
          href="/"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1.5 pl-1 pr-2 transition-colors hover:bg-white/10 no-underline"
          title="Go home"
        >
          <img src={logoImg} alt="" className="h-8 w-8 shrink-0 object-contain" />
          {open && (
            <span className="truncate text-sm font-semibold tracking-tight" style={{ color: '#d4a017' }}>
              MN Homebuyer
            </span>
          )}
        </a>
      </div>

      {/* Phase nav */}
      <nav className="flex-1 py-2">
        {PHASES.map((phase) => {
          const active = pathname === phase.href || pathname.startsWith(phase.href + '/')
          return (
            <a
              key={phase.href}
              href={phase.href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors border-l-2 no-underline ${
                active
                  ? 'border-[#2d6a2e] bg-white/[0.08] text-white'
                  : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
              }`}
            >
              {open && (
                <span className="text-[10px] font-medium text-white/30 w-3 shrink-0 tabular-nums">
                  {phase.num}
                </span>
              )}
              <phase.Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              {open && <span className="text-xs font-medium leading-tight">{phase.label}</span>}
            </a>
          )
        })}
      </nav>

      {/* Footer */}
      {open && (
        <div className="border-t border-white/10 p-3 space-y-1">
          <a
            href="/profile"
            className="flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-[11px] text-white/60 hover:text-white hover:bg-white/5 no-underline transition-colors"
          >
            <User className="h-3.5 w-3.5 shrink-0" />
            Edit profile
          </a>
          {!resetConfirm ? (
            <button
              type="button"
              onClick={() => setResetConfirm(true)}
              className="flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-[11px] text-white/30 hover:text-red-300 hover:bg-white/5 transition-colors"
            >
              <Home className="h-3.5 w-3.5 shrink-0" />
              Reset profile
            </button>
          ) : (
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="destructive"
                className="h-7 flex-1 text-[10px]"
                onClick={() => {
                  onReset?.()
                  setResetConfirm(false)
                }}
              >
                Yes, reset
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 flex-1 text-[10px] text-white/60 hover:text-white"
                onClick={() => setResetConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
