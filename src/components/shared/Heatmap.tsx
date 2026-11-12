import { cn } from '@/lib/utils'

/** 0–4 = activity intensity, null = a future day. */
export type HeatLevel = 0 | 1 | 2 | 3 | 4 | null

interface HeatmapProps {
  /** Day-major list, week by week (Sunday first). Length = weeks × 7. */
  levels: HeatLevel[]
  /** Index in `levels` that is today. */
  todayIndex: number
  /** Accessible summary of the whole chart. */
  label: string
  className?: string
}

const levelClasses = ['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4'] as const
const DAY_LABELS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']

export function Heatmap({ levels, todayIndex, label, className }: HeatmapProps) {
  return (
    <div role="img" aria-label={label} className={cn('w-full max-w-xl', className)}>
      <div className="flex gap-2">
        <div className="grid grid-rows-7 gap-1 text-xs text-muted-foreground" aria-hidden="true">
          {DAY_LABELS.map((day, i) => (
            <span key={day} className="flex items-center">
              {i % 2 === 0 ? day : ''}
            </span>
          ))}
        </div>
        <div className="grid flex-1 grid-flow-col grid-rows-7 gap-1" aria-hidden="true">
          {levels.map((level, i) => (
            <span
              key={i}
              className={cn(
                'aspect-square rounded-[0.3rem]',
                level === null ? 'border border-dashed border-border' : levelClasses[level],
                i === todayIndex && 'bg-brand-graphic ring-2 ring-brand-graphic ring-offset-2 ring-offset-card',
              )}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2 text-xs text-muted-foreground" aria-hidden="true">
        <span>פחות</span>
        {levelClasses.map((cls) => (
          <span key={cls} className={cn('size-3.5 rounded-[0.25rem]', cls)} />
        ))}
        <span>יותר</span>
        <span className="ms-3 flex items-center gap-1.5">
          <span className="size-3.5 rounded-[0.25rem] bg-brand-graphic" />
          היום
        </span>
      </div>
    </div>
  )
}
