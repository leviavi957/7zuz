import { useEffect, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/shared/Skeleton'
import { acceptanceStore } from '@/lib/acceptanceStore'
import { useSession } from '@/hooks/useSession'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

/**
 * Single auth gate: guests → /login (with return URL), signed-in users on
 * auth screens → Home, non-trainers blocked from /admin.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const session = useSession()
  const publicRoute = isPublicPath(location.pathname)
  const adminBlocked = Boolean(session && location.pathname.startsWith('/admin') && session.role !== 'trainer')
  const redirecting =
    (!session && !publicRoute) || Boolean(session && publicRoute) || adminBlocked

  useEffect(() => {
    const { pathname, search } = location

    if (!session && !isPublicPath(pathname)) {
      navigate('/login', { replace: true, state: { from: `${pathname}${search}` } })
      return
    }

    if (session && isPublicPath(pathname)) {
      navigate('/', { replace: true })
      return
    }

    if (session && pathname.startsWith('/admin') && session.role !== 'trainer') {
      navigate('/', { replace: true })
    }
  }, [session, location, navigate])

  if (redirecting) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="טוען"
        className="flex min-h-svh items-center justify-center bg-background p-6"
      >
        <Skeleton className="h-10 w-48" />
      </div>
    )
  }

  return children
}

/** After a successful sign-in: onboarding if needed, else the return URL / Home. */
export async function resolvePostAuthPath(from?: string | null): Promise<string> {
  const acceptance = await acceptanceStore.get().catch(() => null)
  if (!acceptance) return '/onboarding'
  if (from && from.startsWith('/') && !isPublicPath(from)) return from
  return '/'
}
