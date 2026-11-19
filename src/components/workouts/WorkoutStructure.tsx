import { ChevronDown, ListChecks, Timer } from 'lucide-react'
import { Fragment, useId, useState } from 'react'
import { Card } from '@/components/shared/Card'
import {
  formatMinutes,
  formatSeconds,
  getTotalSeconds,
  summarizeTimeline,
  type TimelineStep,
} from '@/lib/workoutTimeline'
import { cn } from '@/lib/utils'
import { ExerciseThumb } from './ExerciseThumb'

/** Collapsed summary ("6 תרגילים · 7 דקות") that expands to the full sequence. */
export function WorkoutStructure({ steps }: { steps: TimelineStep[] }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const rows = summarizeTimeline(steps)
  const minutes = formatMinutes(getTotalSeconds(steps))

  return (
    <Card padded={false}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-16 w-full items-center gap-3 rounded-3xl p-5 text-start outline-none focus-visible:ring-3 focus-visible:ring-ring"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-sage text-sage-ink">
          <ListChecks className="size-5" aria-hidden="true" />
        </span>
        <span className="flex-1">
          <span className="block text-sm text-muted-foreground">מבנה האימון</span>
          <span className="block text-lg font-medium">
            {rows.length} תרגילים · {minutes} דקות
          </span>
        </span>
        <ChevronDown
          className={cn(
            'size-5 text-muted-foreground transition-transform duration-(--motion-base)',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      <div id={panelId} hidden={!open} className="px-5 pb-5">
        <ol className="flex flex-col">
          {rows.map((row, i) => (
            <Fragment key={`${row.exercise.id}-${i}`}>
              <li className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3">
                <span className="numeral flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm tracking-normal text-primary-foreground">
                  {i + 1}
                </span>
                <ExerciseThumb exercise={row.exercise} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{row.exercise.name}</p>
                  {row.sets > 1 && row.restSeconds > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      מנוחה של {formatSeconds(row.restSeconds)} בין הסטים
                    </p>
                  ) : null}
                </div>
                <p className="shrink-0 text-sm font-medium">
                  {formatSeconds(row.workSeconds)} × {row.sets}
                </p>
              </li>
              {row.restAfter ? (
                <li
                  aria-label={`מנוחה של ${formatSeconds(row.restSeconds)}`}
                  className="flex items-center gap-2 py-1.5 ps-4 text-sm text-sage-ink"
                >
                  <Timer className="size-4" aria-hidden="true" />
                  מנוחה {formatSeconds(row.restSeconds)}
                </li>
              ) : null}
            </Fragment>
          ))}
        </ol>
      </div>
    </Card>
  )
}
