import { HeartPulse, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { HEALTH_QUESTIONS, PRE_WORKOUT_COPY } from '@/content/preWorkoutCopy'
import { recordAcceptance } from '@/lib/preWorkout'
import { YesNoQuestion } from './YesNoQuestion'

interface HealthQuestionnaireProps {
  /** Called after every question is answered, the declaration is ticked and the acceptance is stored. */
  onComplete: () => void
  /** When given, a cancel button is shown. */
  onCancel?: () => void
  /** Optional line under the title, for example the workout name. */
  subtitle?: string
  /** Override for the confirm button; defaults to the pre-workout wording. */
  confirmLabel?: string
}

/**
 * The health questionnaire with its liability declaration, without any
 * surrounding container, so it can sit in a dialog now and be an onboarding
 * step later. It records the acceptance itself.
 */
export function HealthQuestionnaire({
  onComplete,
  onCancel,
  subtitle,
  confirmLabel = PRE_WORKOUT_COPY.confirm,
}: HealthQuestionnaireProps) {
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [declared, setDeclared] = useState(false)
  const [saving, setSaving] = useState(false)

  const answered = HEALTH_QUESTIONS.every(({ id }) => answers[id] !== undefined)
  const hasConcern = HEALTH_QUESTIONS.some(({ id }) => answers[id] === true)

  const confirm = async () => {
    setSaving(true)
    try {
      await recordAcceptance()
    } catch {
      // The user did confirm; failing to remember it only means being asked again next time.
    }
    onComplete()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-ink">
          <HeartPulse className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl">{PRE_WORKOUT_COPY.title}</h2>
          {subtitle ? <p className="truncate text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5">
        <p className="text-muted-foreground">{PRE_WORKOUT_COPY.intro}</p>

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
            <p>{PRE_WORKOUT_COPY.concernNotice}</p>
          </div>
        ) : null}

        <ul className="flex list-disc flex-col gap-1 rounded-2xl bg-muted/60 py-4 pe-4 ps-8 text-sm text-muted-foreground">
          {PRE_WORKOUT_COPY.safetyReminders.map((reminder) => (
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
          <span>{PRE_WORKOUT_COPY.declaration}</span>
        </label>
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:flex-row-reverse">
        <Button
          variant="brand"
          size="lg"
          className="sm:flex-1"
          disabled={!answered || !declared || saving}
          onClick={confirm}
        >
          {saving ? PRE_WORKOUT_COPY.saving : confirmLabel}
        </Button>
        {onCancel ? (
          <Button variant="outline" size="lg" disabled={saving} onClick={onCancel}>
            {PRE_WORKOUT_COPY.cancel}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
