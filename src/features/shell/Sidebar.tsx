// src/features/shell/Sidebar.tsx
import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { LineChart, Wallet, Gift, Search, ClipboardCheck, Home, User, PenLine, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <aside
      className={`relative flex flex-col flex-shrink-0 bg-white border-r border-slate-100 transition-all duration-300 ${open ? 'w-[220px]' : 'w-[64px]'}`}
      style={{ minHeight: '100vh', position: 'sticky', top: 0 }}
    >
      {/* Toggle button — floats on the right edge */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm text-slate-400 hover:text-slate-600 transition-colors"
      >
        {open ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>

      {/* Logo / home link */}
      <Link
        to="/"
        className="flex items-center gap-3 px-4 py-5 no-underline"
        title="Go home"
      >
        <img src={logoImg} alt="" className="h-8 w-8 shrink-0 object-contain rounded-lg" />
        {open && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight text-slate-800">MN Homebuyer</p>
            <p className="text-[10px] text-slate-400 font-medium">Dashboard</p>
          </div>
        )}
      </Link>

      {/* Divider */}
      <div className="mx-3 border-t border-slate-100" />

      {/* Phase nav */}
      <nav className="flex-1 py-3 px-2">
        {open && (
          <p className="mb-1 px-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Journey
          </p>
        )}
        {PHASES.map((phase) => {
          const active = pathname === phase.href || pathname.startsWith(phase.href + '/')
          return (
            <Link
              key={phase.href}
              to={phase.href}
              title={!open ? phase.label : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 mb-0.5 transition-all duration-150 no-underline ${
                active
                  ? 'bg-sky-50 text-sky-600'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <phase.Icon
                className={`h-4 w-4 shrink-0 ${active ? 'text-sky-500' : 'text-slate-400'}`}
                aria-hidden
              />
              {open && (
                <span className={`text-[13px] font-medium leading-tight ${active ? 'text-sky-700' : ''}`}>
                  {phase.label}
                </span>
              )}
              {active && open && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 p-2 space-y-0.5">
        <Link
          to="/profile"
          title={!open ? 'Edit profile' : undefined}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 no-underline transition-colors"
        >
          <User className="h-4 w-4 shrink-0 text-slate-400" />
          {open && <span className="text-[12px] font-medium">Edit profile</span>}
        </Link>
        <Link
          to="/"
          search={{ welcome: '1' }}
          title={!open ? 'Welcome form' : undefined}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 no-underline transition-colors"
        >
          <PenLine className="h-4 w-4 shrink-0 text-slate-400" />
          {open && <span className="text-[12px] font-medium">Welcome form</span>}
        </Link>

        {!resetConfirm ? (
          <button
            type="button"
            title={!open ? 'Reset profile' : undefined}
            onClick={() => setResetConfirm(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Home className="h-4 w-4 shrink-0" />
            {open && <span className="text-[12px] font-medium">Reset profile</span>}
          </button>
        ) : (
          <div className="flex gap-1.5 px-1">
            <Button
              size="sm"
              variant="destructive"
              className="h-7 flex-1 text-[10px]"
              onClick={() => { onReset?.(); setResetConfirm(false) }}
            >
              Yes
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 flex-1 text-[10px] text-slate-500"
              onClick={() => setResetConfirm(false)}
            >
              No
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}
