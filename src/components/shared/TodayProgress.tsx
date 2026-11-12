import { ProgressRing } from './ProgressRing'

interface TodayProgressProps {
  done: number
  total: number
}

/** Compact "today" progress: mini ring + one readable sentence. */
export function TodayProgress({ done, total }: TodayProgressProps) {
  return (
    <div className="flex items-center gap-4">
      <ProgressRing
        value={done}
        max={total}
        label="התקדמות היום"
        ticks={false}
        showMax={false}
        className="size-20 shrink-0"
      />
      <div>
        <p className="text-sm text-muted-foreground">היום</p>
        <p className="text-lg font-medium">
          {done} מתוך {total} תרגילים
        </p>
      </div>
    </div>
  )
}
