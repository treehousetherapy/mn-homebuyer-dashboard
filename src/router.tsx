// src/router.tsx
import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import { RootLayout } from './features/shell/RootLayout'
import { HomePage } from './features/onboarding/HomePage'
import { ReadinessPage } from './features/readiness/ReadinessPage'
import { AffordabilityPage } from './features/affordability/AffordabilityPage'
import { AssistancePage } from './features/assistance/AssistancePage'
import { HomesPage } from './features/homes/HomesPage'
import { MilestonesPage } from './features/milestones/MilestonesPage'
import { ProfilePage } from './features/profile/ProfilePage'

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const getReadyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/get-ready',
  component: ReadinessPage,
})

const affordabilityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/affordability',
  component: AffordabilityPage,
})

const assistanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/assistance',
  component: AssistancePage,
})

const homesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/homes',
  component: HomesPage,
})

const milestonesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/milestones',
  component: MilestonesPage,
})

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  getReadyRoute,
  affordabilityRoute,
  assistanceRoute,
  homesRoute,
  milestonesRoute,
  profileRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
