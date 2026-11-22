import { useEffect, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/shared/Skeleton'
import { acceptanceStore } from '@/lib/acceptanceStore'
import {
  canAccessWorkouts,
  getSession,
  isTrainingRole,
  roleHomePath,
  type Role,
} from '@/lib/auth'
import { useSession } from '@/hooks/useSession'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

function canAccessAdmin(role: Role): boolean {
  return role === 'trainer'
}

function canAccessOrg(role: Role): boolean {
  return role === 'org_manager' || role === 'trainer'
}

/** Home, reminders, profile, questionnaires, onboarding — training roles only. */
function isTrainingOnlyPath(pathname: string): boolean {
  if (pathname === '/') return true
  return (
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/questionnaires') ||
    pathname.startsWith('/reminders') ||
    pathname.startsWith('/profile')
  )
}

function isWorkoutsPath(pathname: string): boolean {
  return pathname === '/workouts' || pathname.startsWith('/workouts/')
}

function isFeedbackPath(pathname: string): boolean {
  return /^\/workouts\/[^/]+\/feedback(?:\/|$)/.test(pathname)
}

/**
 * Single auth gate: guests → /login, signed-in users on auth screens → role
 * home, and role-restricted routes (/org, /admin, workouts, training-only).
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const session = useSession()
  const publicRoute = isPublicPath(location.pathname)
  const pathname = location.pathname

  const adminBlocked = Boolean(
    session && pathname.startsWith('/admin') && !canAccessAdmin(session.role),
  )
  const orgBlocked = Boolean(
    session && pathname.startsWith('/org') && !canAccessOrg(session.role),
  )
  const trainingBlocked = Boolean(
    session && !isTrainingRole(session.role) && isTrainingOnlyPath(pathname),
  )
  const workoutsBlocked = Boolean(
    session && isWorkoutsPath(pathname) && !canAccessWorkouts(session.role),
  )
  const feedbackBlocked = Boolean(
    session && isFeedbackPath(pathname) && !isTrainingRole(session.role),
  )
  const redirecting =
    (!session && !publicRoute) ||
    Boolean(session && publicRoute) ||
    adminBlocked ||
    orgBlocked ||
    trainingBlocked ||
    workoutsBlocked ||
    feedbackBlocked

  useEffect(() => {
    const { pathname: path, search } = location

    if (!session && !isPublicPath(path)) {
      navigate('/login', { replace: true, state: { from: `${path}${search}` } })
      return
    }

    if (session && isPublicPath(path)) {
      navigate(roleHomePath(session.role), { replace: true })
      return
    }

    if (session && !isTrainingRole(session.role) && isTrainingOnlyPath(path)) {
      navigate(roleHomePath(session.role), { replace: true })
      return
    }

    if (session && isWorkoutsPath(path) && !canAccessWorkouts(session.role)) {
      navigate(roleHomePath(session.role), { replace: true })
      return
    }

    if (session && isFeedbackPath(path) && !isTrainingRole(session.role)) {
      navigate(roleHomePath(session.role), { replace: true })
      return
    }

    if (session && path.startsWith('/admin') && !canAccessAdmin(session.role)) {
      navigate(roleHomePath(session.role), { replace: true })
      return
    }

    if (session && path.startsWith('/org') && !canAccessOrg(session.role)) {
      navigate(roleHomePath(session.role), { replace: true })
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

/** After a successful sign-in: onboarding if a training role needs it, else role home. */
export async function resolvePostAuthPath(from?: string | null): Promise<string> {
  const session = await getSession()
  const home = roleHomePath(session?.role)

  if (isTrainingRole(session?.role)) {
    const acceptance = await acceptanceStore.get().catch(() => null)
    if (!acceptance) return '/onboarding'
  }

  if (from && from.startsWith('/') && !isPublicPath(from)) {
    if (from.startsWith('/org') && session && !canAccessOrg(session.role)) return home
    if (from.startsWith('/admin') && session && !canAccessAdmin(session.role)) return home
    if (isTrainingOnlyPath(from) && session && !isTrainingRole(session.role)) return home
    if (isWorkoutsPath(from) && session && !canAccessWorkouts(session.role)) return home
    if (isFeedbackPath(from) && session && !isTrainingRole(session.role)) return home
    return from
  }
  return home
}
