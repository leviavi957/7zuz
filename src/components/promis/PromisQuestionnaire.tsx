import { HeartHandshake } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PROMIS_COPY, PROMIS_QUESTIONS } from '@/content/promisCopy'
import { isPromisComplete, type PromisAnswers, type PromisRound } from '@/lib/promis'
import { savePromis } from '@/mocks/promis'
import { PromisRating } from './PromisRating'

function useDesktopLayout(): boolean {
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches)
  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)')
    const onChange = () => setDesktop(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return desktop
}

interface PromisQuestionnaireProps {
  round: PromisRound
  onComplete: () => void
  /** When given, a quiet skip control is shown. */
  onSkip?: () => void
  /** Pages use `?state=submit-error` to simulate a failed send. */
  failSubmit?: boolean
}

/**
 * Quality-of-life questionnaire. One question per screen on phones, all on
 * one page from `md` up. Saves through the async PROMIS API, then calls
 * `onComplete`.
 */
export function PromisQuestionnaire({
  round,
  onComplete,
  onSkip,
  failSubmit = false,
}: PromisQuestionnaireProps) {
  const desktop = useDesktopLayout()
  const [answers, setAnswers] = useState<PromisAnswers>({})
  const [index, setIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)

  const total = PROMIS_QUESTIONS.length
  const current = PROMIS_QUESTIONS[index]!
  const complete = isPromisComplete(answers)
  const currentAnswered = answers[current.id] !== undefined

  const setAnswer = (id: string, value: number) =>
    setAnswers((currentAnswers) => ({ ...currentAnswers, [id]: value }))

  const submit = async () => {
    if (!complete) return
    setSaving(true)
    setError(false)
    try {
      await savePromis({ round, answers }, failSubmit)
      onComplete()
    } catch {
      setError(true)
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 border-b p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-ink">
          <HeartHandshake className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl">{PROMIS_COPY.title}</h2>
          <p className="text-sm text-muted-foreground">{PROMIS_COPY.intro}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-5">
        {desktop ? (
          <div className="flex flex-col gap-8">
            {PROMIS_QUESTIONS.map(({ id, text }, questionIndex) => (
              <PromisRating
                key={id}
                questionId={id}
                number={questionIndex + 1}
                text={text}
                value={answers[id]}
                onChange={(value) => setAnswer(id, value)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <p className="text-sm text-muted-foreground">{PROMIS_COPY.progress(index + 1, total)}</p>
            <PromisRating
              questionId={current.id}
              number={index + 1}
              text={current.text}
              value={answers[current.id]}
              onChange={(value) => setAnswer(current.id, value)}
            />
          </div>
        )}

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            לא הצלחנו לשמור את התשובות. אפשר לנסות שוב.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 border-t p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          {desktop ? (
            <Button
              variant="brand"
              size="lg"
              className="sm:flex-1"
              disabled={!complete || saving}
              onClick={submit}
            >
              {saving ? PROMIS_COPY.saving : PROMIS_COPY.submit}
            </Button>
          ) : (
            <>
              {index < total - 1 ? (
                <Button
                  variant="brand"
                  size="lg"
                  disabled={!currentAnswered}
                  onClick={() => setIndex((value) => value + 1)}
                >
                  {PROMIS_COPY.next}
                </Button>
              ) : (
                <Button variant="brand" size="lg" disabled={!complete || saving} onClick={submit}>
                  {saving ? PROMIS_COPY.saving : PROMIS_COPY.submit}
                </Button>
              )}
              {index > 0 ? (
                <Button variant="outline" size="lg" disabled={saving} onClick={() => setIndex((value) => value - 1)}>
                  {PROMIS_COPY.back}
                </Button>
              ) : null}
            </>
          )}
        </div>

        {onSkip ? (
          <Button variant="ghost" size="lg" disabled={saving} onClick={onSkip} className="text-muted-foreground">
            {PROMIS_COPY.skip}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
