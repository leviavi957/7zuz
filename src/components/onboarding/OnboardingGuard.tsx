import { useEffect, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { acceptanceStore } from '@/lib/acceptanceStore'
import { Skeleton } from '@/components/shared/Skeleton'

const AUTH_PATHS = ['/login', '/register', '/forgot-password']

/**
 * Sends a signed-in person with no stored health acceptance to `/onboarding`.
 * Auth screens are skipped; AuthGuard handles guests.
 */
export function OnboardingGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const onOnboarding = pathname.startsWith('/onboarding')
  const onAuth = AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (onOnboarding || onAuth) {
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
  }, [onOnboarding, onAuth, navigate, pathname])

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
