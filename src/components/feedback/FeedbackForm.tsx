import { CircleCheck, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/ui/button'
import {
  hasAnswers,
  RATING_QUESTIONS,
  type Effort,
  type RatingKey,
  type WorkoutFeedback,
} from '@/lib/feedback'
import { EffortPicker } from './EffortPicker'
import { StarRating } from './StarRating'

type Phase = 'editing' | 'sending' | 'error' | 'sent' | 'skipped'

interface FeedbackFormProps {
  workoutId: string
  completion: number
  onSubmit: (feedback: WorkoutFeedback) => Promise<void>
}

/** Optional, tap-only feedback. Skipping or sending both lead straight to the next actions. */
export function FeedbackForm({ workoutId, completion, onSubmit }: FeedbackFormProps) {
  const [effort, setEffort] = useState<Effort>()
  const [ratings, setRatings] = useState<Partial<Record<RatingKey, number>>>({})
  const [phase, setPhase] = useState<Phase>('editing')

  if (phase === 'skipped') return null

  if (phase === 'sent') {
    return (
      <Card tone="sage" role="status" className="flex items-center gap-3">
        <CircleCheck className="size-8 shrink-0 text-sage-ink" aria-hidden="true" />
        <div>
          <p className="text-lg font-medium">תודה על המשוב!</p>
          <p className="text-sm text-muted-foreground">הוא עוזר לנו להתאים לך אימונים טובים יותר.</p>
        </div>
      </Card>
    )
  }

  const setRating = (key: RatingKey, value: number | undefined) =>
    setRatings(({ [key]: _removed, ...rest }) => (value === undefined ? rest : { ...rest, [key]: value }))

  const send = async () => {
    setPhase('sending')
    try {
      await onSubmit({ workoutId, completion, effort, ratings })
      setPhase('sent')
    } catch {
      setPhase('error')
    }
  }

  const sending = phase === 'sending'

  return (
    <Card className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl">איך היה?</h2>
        <p className="text-sm text-muted-foreground">
          רק לחיצה או שתיים, והכול אופציונלי.
        </p>
      </div>

      <EffortPicker value={effort} onChange={setEffort} />

      <div className="flex flex-col divide-y">
        {RATING_QUESTIONS.map(({ key, label }) => (
          <div key={key} className="py-1 first:pt-0 last:pb-0">
            <StarRating label={label} value={ratings[key]} onChange={(value) => setRating(key, value)} />
          </div>
        ))}
      </div>

      {phase === 'error' ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          לא הצלחנו לשלוח את המשוב. אפשר לנסות שוב.
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button
          variant="brand"
          size="lg"
          className="flex-1"
          disabled={!hasAnswers({ effort, ratings }) || sending}
          onClick={send}
        >
          {sending ? <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : null}
          {phase === 'error' ? 'ניסיון נוסף' : 'שליחת משוב'}
        </Button>
        <Button variant="ghost" size="lg" disabled={sending} onClick={() => setPhase('skipped')}>
          דילוג
        </Button>
      </div>
    </Card>
  )
}
