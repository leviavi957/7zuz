import { Pause } from 'lucide-react'
import { Badge } from '@/components/shared/Badge'
import { Card } from '@/components/shared/Card'
import { ProgressRing } from '@/components/shared/ProgressRing'
import type { TimelineStep } from '@/lib/workoutTimeline'

interface PlayerHudProps {
  step: TimelineStep
  remainingSeconds: number
  itemCount: number
  paused: boolean
}

/** Always visible: the circular timer and what is happening now. */
export function PlayerHud({ step, remainingSeconds, itemCount, paused }: PlayerHudProps) {
  const isRest = step.kind === 'rest'

  return (
    <Card tone={isRest ? 'sage' : 'default'} className="flex items-center gap-4 p-4 md:p-5">
      <ProgressRing
        key={step.id}
        value={remainingSeconds}
        max={step.durationSeconds}
        label={isRest ? 'זמן מנוחה שנותר' : 'זמן שנותר'}
        ticks={false}
        showMax={false}
        className="w-28 shrink-0 md:w-36 [@media(max-height:32rem)]:w-20"
      />
      <div className="flex min-w-0 flex-col items-start gap-1" aria-live="polite">
        <div className="flex flex-wrap gap-2">
          {isRest ? <Badge variant="solid">מנוחה</Badge> : null}
          {paused ? (
            <Badge>
              <Pause className="size-3.5" aria-hidden="true" />
              מושהה
            </Badge>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {isRest ? 'הבא' : `תרגיל ${step.itemIndex + 1} מתוך ${itemCount}`}
        </p>
        <h2 className="text-xl md:text-2xl">{step.exercise.name}</h2>
        {step.totalSets > 1 ? (
          <p className="text-sm font-medium">
            סט {step.setNumber} מתוך {step.totalSets}
          </p>
        ) : null}
      </div>
    </Card>
  )
}
