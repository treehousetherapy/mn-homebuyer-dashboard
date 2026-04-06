// src/features/shell/MobileNav.tsx
import { Link } from '@tanstack/react-router'
import { LineChart, Wallet, Gift, Search, ClipboardCheck } from 'lucide-react'

const TABS = [
  { label: 'Get Ready',  href: '/get-ready',     Icon: LineChart },
  { label: 'Budget',     href: '/affordability', Icon: Wallet },
  { label: 'Help',       href: '/assistance',    Icon: Gift },
  { label: 'Homes',      href: '/homes',         Icon: Search },
  { label: 'Close',      href: '/milestones',    Icon: ClipboardCheck },
]

export function MobileNav() {
  const pathname = window.location.pathname

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-border/80 flex justify-around py-2 shadow-[0_-8px_30px_rgba(26,46,68,0.08)]">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
        return (
          <Link
            key={tab.href}
            to={tab.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl min-w-[3.25rem] transition-colors no-underline ${
              active ? 'text-[#2d6a2e] bg-emerald-50/60' : 'text-muted-foreground'
            }`}
          >
            <tab.Icon className="h-5 w-5" aria-hidden />
            <span className="text-[9px] font-medium leading-tight text-center">{tab.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
