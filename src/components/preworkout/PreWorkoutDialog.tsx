import { HeartPulse, TriangleAlert } from 'lucide-react'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { HEALTH_QUESTIONS, SAFETY_REMINDERS } from '@/lib/preWorkout'
import { YesNoQuestion } from './YesNoQuestion'

const FOCUSABLE = 'button:not([disabled]), input:not([disabled])'

interface PreWorkoutDialogProps {
  workoutTitle: string
  onCancel: () => void
  /** Called only after every question is answered and the declaration is ticked. */
  onConfirm: () => void
}

/**
 * Health check shown before a workout. Rendered inline (not in a portal) so it
 * also works in fullscreen. The workout starts only from "confirm".
 */
export function PreWorkoutDialog({ workoutTitle, onCancel, onConfirm }: PreWorkoutDialogProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [declared, setDeclared] = useState(false)

  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  const answered = HEALTH_QUESTIONS.every(({ id }) => answers[id] !== undefined)
  const hasConcern = HEALTH_QUESTIONS.some(({ id }) => answers[id] === true)
  const canStart = answered && declared

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
      className="fixed inset-0 z-50 flex items-end justify-center bg-scrim sm:items-center sm:p-4"
      onKeyDown={onKeyDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="flex max-h-full w-full max-w-lg flex-col rounded-t-3xl border bg-card text-card-foreground shadow-lift outline-none sm:rounded-3xl"
      >
        <div className="flex items-center gap-3 border-b p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-ink">
            <HeartPulse className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id={titleId} className="text-xl">
              לפני שמתחילים
            </h2>
            <p className="truncate text-sm text-muted-foreground">{workoutTitle}</p>
          </div>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto p-5">
          <p className="text-muted-foreground">ארבע שאלות קצרות על איך שאת/ה מרגיש/ה היום.</p>

          {HEALTH_QUESTIONS.map(({ id, text }, index) => (
            <YesNoQuestion
              key={id}
              number={index + 1}
              text={text}
              value={answers[id]}
              onChange={(value) => setAnswers((current) => ({ ...current, [id]: value }))}
            />
          ))}

          {hasConcern ? (
            <div role="alert" className="flex gap-3 rounded-2xl bg-brand-soft p-4 text-brand-ink">
              <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <p>
                ענית &quot;כן&quot; על שאלה אחת או יותר. מומלץ להתייעץ עם רופא לפני שמתחילים. אם בכל
                זאת ממשיכים, עושים זאת באחריותך ועוצרים ברגע שמרגישים לא טוב.
              </p>
            </div>
          ) : null}

          <ul className="flex list-disc flex-col gap-1 rounded-2xl bg-muted/60 py-4 pe-4 ps-8 text-sm text-muted-foreground">
            {SAFETY_REMINDERS.map((reminder) => (
              <li key={reminder}>{reminder}</li>
            ))}
          </ul>

          <label className="flex min-h-11 cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={declared}
              onChange={(event) => setDeclared(event.target.checked)}
              className="mt-0.5 size-6 shrink-0 accent-brand-graphic"
            />
            <span>קראתי והבנתי. אני מתחיל/ה את האימון באחריותי.</span>
          </label>
        </div>

        <div className="flex flex-col gap-2 border-t p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:flex-row-reverse">
          <Button variant="brand" size="lg" className="sm:flex-1" disabled={!canStart} onClick={onConfirm}>
            אישור והתחלת אימון
          </Button>
          <Button variant="outline" size="lg" onClick={onCancel}>
            ביטול
          </Button>
        </div>
      </div>
    </div>
  )
}
