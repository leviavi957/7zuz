import { useEffect, useState, useSyncExternalStore } from 'react'
import { pickRestLine } from '@/content/restLines'
import { cn } from '@/lib/utils'
import type { TimelineStep } from '@/lib/workoutTimeline'
import { ExerciseThumb } from '@/components/workouts/ExerciseThumb'

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface RestScreenProps {
  step: TimelineStep
  remainingSeconds: number
  paused: boolean
  className?: string
}

/** Calm rest stage: breathing circle, a light Hebrew line, and what's next. */
export function RestScreen({ step, remainingSeconds, paused, className }: RestScreenProps) {
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion)
  const [line, setLine] = useState(() => pickRestLine())

  useEffect(() => {
    setLine(pickRestLine())
  }, [step.id])

  return (
    <div
      className={cn(
        'flex size-full flex-col items-center justify-center gap-6 px-4 py-6 text-center',
        className,
      )}
    >
      <div className="relative flex size-[min(52vmin,20rem)] items-center justify-center">
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-0 rounded-full bg-brand-soft',
            !reducedMotion && 'rest-breathe',
            paused && !reducedMotion && '[animation-play-state:paused]',
          )}
        />
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-[12%] rounded-full border-2 border-brand-graphic/40',
            !reducedMotion && 'rest-breathe [--rest-duration:5.5s]',
            paused && !reducedMotion && '[animation-play-state:paused]',
          )}
        />
        <div className="relative flex flex-col items-center gap-2" aria-live="polite">
          <p className="text-sm font-medium text-brand-ink">מנוחה</p>
          <p className="numeral text-6xl text-foreground md:text-7xl" aria-label={`נותרו ${remainingSeconds} שניות`}>
            {remainingSeconds}
          </p>
        </div>
      </div>

      <p className="max-w-sm text-base text-muted-foreground md:text-lg">{line}</p>

      <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 text-start shadow-soft">
        <ExerciseThumb exercise={step.exercise} />
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">הבא</p>
          <p className="truncate font-medium">{step.exercise.name}</p>
          {step.totalSets > 1 ? (
            <p className="text-sm text-muted-foreground">
              סט {step.setNumber} מתוך {step.totalSets}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
