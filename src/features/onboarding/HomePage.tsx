import { useRouterState } from '@tanstack/react-router'
import { hasProfile } from '@/lib/profile'
import { useAppContext } from '@/features/shell/RootLayout'
import { OnboardingForm } from './OnboardingForm'

export function HomePage() {
  const { profile } = useAppContext()
  const welcomeEdit = useRouterState({
    select: (s) => new URLSearchParams(s.location.search).get('welcome') === '1',
  })

  if (welcomeEdit && hasProfile(profile)) {
    return <OnboardingForm mode="welcomeEdit" />
  }

  return <OnboardingForm mode={hasProfile(profile) ? 'saved' : 'new'} />
}
