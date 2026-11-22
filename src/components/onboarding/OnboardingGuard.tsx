import { useEffect, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { acceptanceStore } from '@/lib/acceptanceStore'
import { Skeleton } from '@/components/shared/Skeleton'

/**
 * Sends a person with no stored health acceptance to `/onboarding` the first
 * time they open the app. After onboarding saves an acceptance, this never
 * redirects again. The pre-workout questionnaire keeps its own rules.
 */
export function OnboardingGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const onOnboarding = pathname.startsWith('/onboarding')
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (onOnboarding) return
    let cancelled = false
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
  }, [onOnboarding, navigate, pathname])

  if (!onOnboarding && !allowed) {
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
