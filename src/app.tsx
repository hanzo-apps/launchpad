import type { ReactNode } from 'react'
import { useIam } from '@hanzo/iam/react'
import { YStack, Spinner } from '@hanzo/gui'
import { Callback } from './auth/callback'
import { Landing } from './views/landing'
import { Admin } from './views/admin'

function Center({ children }: { children: ReactNode }) {
  return (
    <YStack flex={1} minHeight="100vh" alignItems="center" justifyContent="center" backgroundColor="$background">
      {children}
    </YStack>
  )
}

/**
 * Top-level route + auth gate — no router dependency (one static SPA):
 *   /auth/callback  → finish the PKCE exchange, then land on the dashboard
 *   signed out      → the launch landing (public email capture)
 *   signed in       → the admin signups dashboard
 */
export function App() {
  const { isAuthenticated, isLoading } = useIam()

  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/auth/callback')) {
    return <Callback />
  }
  if (isLoading) {
    return (
      <Center>
        <Spinner size="large" />
      </Center>
    )
  }
  return isAuthenticated ? <Admin /> : <Landing />
}
