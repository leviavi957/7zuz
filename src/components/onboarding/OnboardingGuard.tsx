import { useEffect, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/shared/Skeleton'
import { acceptanceStore } from '@/lib/acceptanceStore'
import { isTrainingRole, roleHomePath } from '@/lib/auth'
import { useSession } from '@/hooks/useSession'

const AUTH_PATHS = ['/login', '/register', '/forgot-password']

/**
 * Sends a training-role user with no health acceptance to `/onboarding`.
 * Org managers and trainers skip this entirely. Auth screens are skipped;
 * AuthGuard handles guests and non-training access to /onboarding.
 */
export function OnboardingGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const session = useSession()
  const onOnboarding = pathname.startsWith('/onboarding')
  const onAuth = AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  const trains = isTrainingRole(session?.role)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (onAuth) {
      setAllowed(true)
      return
    }

    if (!trains) {
      if (onOnboarding) {
        navigate(roleHomePath(session?.role), { replace: true })
        return
      }
      setAllowed(true)
      return
    }

    if (onOnboarding) {
      setAllowed(true)
      return
    }

    let cancelled = false
    setAllowed(false)
    acceptanceStore
      .get()
      .catch(() => null)
      .then((acceptance) => {
        if (cancelled) return
        if (!acceptance) navigate('/onboarding', { replace: true })
        else setAllowed(true)
      })
    return () => {
      cancelled = true
    }
  }, [onOnboarding, onAuth, trains, session?.role, navigate, pathname])

  if (!onOnboarding && !onAuth && !allowed) {
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
