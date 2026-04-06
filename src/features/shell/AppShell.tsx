// src/features/shell/AppShell.tsx
import { type ReactNode } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Sidebar } from './Sidebar'
import { TopProgress } from './TopProgress'
import { MobileNav } from './MobileNav'
import { NextStepCard } from './NextStepCard'
import type { NextAction } from '@/lib/nextAction'

interface AppShellProps {
  children: ReactNode
  completionPct: number
  hasProfile: boolean
  nextAction: NextAction
  onReset: () => void
}

export function AppShell({ children, completionPct, hasProfile, nextAction, onReset }: AppShellProps) {
  return (
    <TooltipProvider>
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar onReset={onReset} />
      </div>

      {/* Main column */}
      <div className="flex flex-1 flex-col min-h-0 overflow-auto pb-20 md:pb-0 dashboard-page-bg">
        <TopProgress completionPct={completionPct} hasProfile={hasProfile} />
        <NextStepCard action={nextAction} hasProfile={hasProfile} />

        {/* Page content */}
        <main className="flex-1 mx-auto w-full max-w-[1300px] p-4 lg:p-6 page-enter">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
    </TooltipProvider>
  )
}
