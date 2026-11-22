import { ClipboardList, HeartPulse } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HealthQuestionnaire } from '@/components/preworkout/HealthQuestionnaire'
import { PromisQuestionnaire } from '@/components/promis/PromisQuestionnaire'
import { Card, CardHeader } from '@/components/shared/Card'
import { ErrorState } from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/shared/Skeleton'
import { Button } from '@/components/ui/button'
import { usePromis } from '@/hooks/usePromis'
import { acceptanceStore, type Acceptance } from '@/lib/acceptanceStore'
import { formatHebrewDate, PROMIS_INTERVAL_DAYS } from '@/lib/promis'
import { isAcceptanceValid } from '@/lib/preWorkout'

type Panel = 'list' | 'health' | 'promis'

function QuestionnairesSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="טוען שאלונים" className="flex flex-col gap-5">
      <Skeleton className="h-40 rounded-3xl" />
      <Skeleton className="h-40 rounded-3xl" />
    </div>
  )
}

function HealthCard({
  acceptance,
  onUpdate,
}: {
  acceptance: Acceptance | null
  onUpdate: () => void
}) {
  const valid = isAcceptanceValid(acceptance)
  return (
    <Card>
      <CardHeader
        title="שאלון בריאות"
        description="שאלות קצרות והצהרת אחריות לפני אימון."
        action={
          <span className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand-ink">
            <HeartPulse className="size-5" aria-hidden="true" />
          </span>
        }
      />
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground">
          {acceptance
            ? `אישור אחרון: ${formatHebrewDate(acceptance.acceptedAt)}${valid ? '' : ' (פג תוקף)'}`
            : 'עדיין אין אישור שמור.'}
        </p>
        <Button variant="outline" className="self-start" onClick={onUpdate}>
          {acceptance ? 'עדכון שאלון הבריאות' : 'מילוי שאלון הבריאות'}
        </Button>
      </div>
    </Card>
  )
}

function PromisCard({
  latest,
  due,
  nextDueAt,
  onFill,
}: {
  latest: ReturnType<typeof usePromis>['latest']
  due: boolean
  nextDueAt: Date | null
  onFill: () => void
}) {
  return (
    <Card>
      <CardHeader
        title="איכות חיים"
        description="חמש שאלות על השבוע האחרון. ציון בין 5 ל-25."
        action={
          <span className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand-ink">
            <ClipboardList className="size-5" aria-hidden="true" />
          </span>
        }
      />
      <div className="flex flex-col gap-4">
        {latest ? (
          <div className="flex flex-col gap-1">
            <p>
              ציון אחרון:{' '}
              <span className="numeral font-medium">{latest.total}</span>
              <span className="text-muted-foreground"> מתוך 25</span>
            </p>
            <p className="text-muted-foreground">מילוי אחרון: {formatHebrewDate(latest.createdAt)}</p>
            <p className="text-muted-foreground">
              {due
                ? 'הגיע הזמן למלא שוב.'
                : nextDueAt
                  ? `המילוי הבא מומלץ מ-${formatHebrewDate(nextDueAt.toISOString())} (כל ${PROMIS_INTERVAL_DAYS} יום).`
                  : null}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground">עדיין לא מילאתם את השאלון.</p>
        )}
        <Button variant={due ? 'brand' : 'outline'} className="self-start" onClick={onFill}>
          {latest ? 'מילוי עכשיו' : 'מילוי ראשון'}
        </Button>
      </div>
    </Card>
  )
}

export default function QuestionnairesPage() {
  const [params, setParams] = useSearchParams()
  const promis = usePromis()
  const [acceptance, setAcceptance] = useState<Acceptance | null>(null)
  const [acceptanceLoaded, setAcceptanceLoaded] = useState(false)
  // `editing` is set by the cards; `?fill=promis` opens PROMIS once the list is ready.
  const [editing, setEditing] = useState<'health' | 'promis' | null>(null)
  const panel: Panel =
    editing === 'health'
      ? 'health'
      : editing === 'promis' || (params.get('fill') === 'promis' && promis.status === 'ready')
        ? 'promis'
        : 'list'

  useEffect(() => {
    let cancelled = false
    acceptanceStore.get().then((value) => {
      if (!cancelled) {
        setAcceptance(value)
        setAcceptanceLoaded(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [panel])

  const closePanel = () => {
    setEditing(null)
    if (params.get('fill')) setParams({})
    promis.refresh()
  }

  if (panel === 'health') {
    return (
      <div className="mx-auto w-full max-w-lg">
        <Card padded={false} className="overflow-hidden">
          <HealthQuestionnaire
            confirmLabel="שמירת האישור"
            onComplete={closePanel}
            onCancel={closePanel}
          />
        </Card>
      </div>
    )
  }

  if (panel === 'promis') {
    return (
      <div className="mx-auto w-full max-w-lg">
        <Card padded={false} className="overflow-hidden">
          <PromisQuestionnaire
            round={promis.nextRound}
            failSubmit={params.get('state') === 'submit-error'}
            onComplete={closePanel}
            onSkip={closePanel}
          />
        </Card>
      </div>
    )
  }

  if (promis.status === 'error') {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <header>
          <h2 className="text-3xl md:text-4xl">שאלונים</h2>
          <p className="text-muted-foreground">בריאות ואיכות חיים, במקום אחד.</p>
        </header>
        <ErrorState onRetry={promis.retry} />
      </div>
    )
  }

  if (promis.status === 'loading' || !acceptanceLoaded) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <header>
          <h2 className="text-3xl md:text-4xl">שאלונים</h2>
          <p className="text-muted-foreground">בריאות ואיכות חיים, במקום אחד.</p>
        </header>
        <QuestionnairesSkeleton />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <header>
        <h2 className="text-3xl md:text-4xl">שאלונים</h2>
        <p className="text-muted-foreground">בריאות ואיכות חיים, במקום אחד.</p>
      </header>
      <HealthCard acceptance={acceptance} onUpdate={() => setEditing('health')} />
      <PromisCard
        latest={promis.latest}
        due={promis.due}
        nextDueAt={promis.nextDueAt}
        onFill={() => setEditing('promis')}
      />
    </div>
  )
}
