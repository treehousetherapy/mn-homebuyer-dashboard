// src/router.tsx
import {
  createRouter,
  createRootRoute,
  createRoute,
} from '@tanstack/react-router'
import { RootLayout } from './features/shell/RootLayout'

// Root route — renders AppShell for all children
const rootRoute = createRootRoute({
  component: RootLayout,
})

// Placeholder page component until Plans C/D replace them
function Placeholder({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center fade-in">
      <p className="text-xl font-semibold text-slate-700">{name}</p>
      <p className="text-sm text-slate-500 mt-2">Page coming in Plan C</p>
    </div>
  )
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Placeholder name="Home" />,
})

const getReadyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/get-ready',
  component: () => <Placeholder name="Get Ready" />,
})

const affordabilityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/affordability',
  component: () => <Placeholder name="Your Budget" />,
})

const assistanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/assistance',
  component: () => <Placeholder name="Help Available" />,
})

const homesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/homes',
  component: () => <Placeholder name="Find a Home" />,
})

const milestonesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/milestones',
  component: () => <Placeholder name="Close with Confidence" />,
})

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => <Placeholder name="Profile" />,
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
