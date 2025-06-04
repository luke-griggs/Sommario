import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/')({
  // Redirect based on authentication status
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (session.data) {
      throw redirect({
        to: '/dashboard',
      })
    } else {
      throw redirect({
        to: '/auth',
      })
    }
  },
  component: Home,
})

function Home() {
  // This component should never render due to the redirects above
  return null
}
