import { X } from 'lucide-react'
import { useEffect, useRef, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { PRE_WORKOUT_COPY } from '@/content/preWorkoutCopy'
import { HealthQuestionnaire } from './HealthQuestionnaire'

const FOCUSABLE = 'button:not([disabled]), input:not([disabled])'

interface PreWorkoutDialogProps {
  workoutTitle: string
  onCancel: () => void
  /** Called only after the questionnaire is completed and the acceptance is stored. */
  onComplete: () => void
}

/**
 * Modal wrapper around the questionnaire. Rendered inline (not in a portal) so
 * it also works in fullscreen. The workout starts only from `onComplete`.
 */
export function PreWorkoutDialog({ workoutTitle, onCancel, onComplete }: PreWorkoutDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') onCancel()
    if (event.key !== 'Tab' || !panelRef.current) return
    const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-scrim pt-9 sm:items-center sm:p-4"
      onKeyDown={onKeyDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={PRE_WORKOUT_COPY.title}
        tabIndex={-1}
        className="flex max-h-full min-h-0 w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border bg-card text-card-foreground shadow-lift outline-none sm:rounded-3xl"
      >
        <div className="flex shrink-0 items-center justify-end border-b px-3 py-2">
          <Button type="button" variant="ghost" size="icon" aria-label="סגירה" onClick={onCancel}>
            <X />
          </Button>
        </div>
        <HealthQuestionnaire subtitle={workoutTitle} onCancel={onCancel} onComplete={onComplete} />
      </div>
    </div>
  )
}
