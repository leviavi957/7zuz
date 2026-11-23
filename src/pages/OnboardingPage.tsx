import { ArrowRight, Check, PartyPopper } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HealthQuestionnaire } from '@/components/preworkout/HealthQuestionnaire'
import { PromisQuestionnaire } from '@/components/promis/PromisQuestionnaire'
import { BackgroundShapes } from '@/components/shared/BackgroundShapes'
import { BasadMark } from '@/components/shared/BasadMark'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth'
import { cn } from '@/lib/utils'

type Step = 'health' | 'promis' | 'done'

const STEPS: { id: Exclude<Step, 'done'>; label: string }[] = [
  { id: 'health', label: 'בריאות' },
  { id: 'promis', label: 'איכות חיים' },
]

/**
 * First-login flow: health questionnaire, then PROMIS (skippable), then a calm
 * completion screen. Lives outside the app shell.
 */
export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('health')
  const [leaving, setLeaving] = useState(false)
  const stepIndex = step === 'done' ? STEPS.length : STEPS.findIndex(({ id }) => id === step)

  const leave = async () => {
    if (leaving) return
    setLeaving(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } finally {
      setLeaving(false)
    }
  }

  return (
    <div className="relative isolate flex min-h-svh flex-col bg-background">
      <BackgroundShapes />
      <BasadMark className="absolute start-4 top-3 z-10" />
      <Button
        type="button"
        variant="ghost"
        className="absolute end-3 top-2 z-10 text-muted-foreground"
        disabled={leaving}
        onClick={() => void leave()}
      >
        יציאה מהמערכת
      </Button>

      <header className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-2 pt-10">
        {step !== 'health' && step !== 'done' ? (
          <Button
            variant="ghost"
            className="self-start"
            onClick={() => setStep('health')}
          >
            <ArrowRight />
            חזרה
          </Button>
        ) : (
          <div className="h-11" aria-hidden="true" />
        )}

        {step !== 'done' ? (
          <nav aria-label="שלבי ההרשמה" className="flex items-center gap-2">
            {STEPS.map(({ id, label }, index) => {
              const current = index === stepIndex
              const done = index < stepIndex
              return (
                <div key={id} className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div
                    className={cn(
                      'h-1.5 rounded-full',
                      done || current ? 'bg-brand-graphic' : 'bg-track',
                    )}
                  />
                  <p
                    className={cn(
                      'truncate text-xs',
                      current ? 'font-medium text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {index + 1}. {label}
                  </p>
                </div>
              )
            })}
          </nav>
        ) : null}

        <div>
          <p className="text-muted-foreground">ברוכים הבאים ל-7ZUZ</p>
          <h1 className="text-3xl">
            {step === 'health'
              ? 'קודם כול, בריאות'
              : step === 'promis'
                ? 'ועכשיו, איכות חיים'
                : 'הכול מוכן'}
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-8">
        {step === 'health' ? (
          <Card padded={false} className="overflow-hidden">
            <HealthQuestionnaire
              confirmLabel="המשך"
              onComplete={() => setStep('promis')}
            />
          </Card>
        ) : null}

        {step === 'promis' ? (
          <Card padded={false} className="overflow-hidden">
            <PromisQuestionnaire
              round="baseline"
              onComplete={() => setStep('done')}
              onSkip={() => setStep('done')}
            />
          </Card>
        ) : null}

        {step === 'done' ? (
          <Card className="flex flex-col items-center gap-5 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-brand-solid text-brand-solid-foreground shadow-soft">
              <PartyPopper className="size-8" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-2xl">תודה, ונתחיל לזוז</h2>
              <p className="mt-1 text-muted-foreground">
                אפשר תמיד לעדכן את השאלונים ממסך השאלונים.
              </p>
            </div>
            <ul className="flex w-full flex-col gap-2 text-start text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-brand-ink" aria-hidden="true" />
                שאלון הבריאות נשמר
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-brand-ink" aria-hidden="true" />
                אפשר להתחיל אימון קצר בכל רגע
              </li>
            </ul>
            <Button variant="brand" size="lg" className="w-full" render={<Link to="/" replace />}>
              למסך הבית
            </Button>
          </Card>
        ) : null}
      </main>
    </div>
  )
}
