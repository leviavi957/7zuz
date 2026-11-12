import { useAnimateIn } from '@/hooks/useAnimateIn'
import { cn } from '@/lib/utils'

const RADIUS = 76
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const TICK_COUNT = 60

interface ProgressRingProps {
  value: number
  max: number
  /** Accessible name, e.g. "אימונים השבוע". */
  label: string
  /** Small line under the numeral. */
  caption?: string
  /** Outer tick marks. */
  ticks?: boolean
  /** Show "/max" next to the numeral. */
  showMax?: boolean
  /** Sets the size, e.g. w-56. */
  className?: string
}

export function ProgressRing({
  value,
  max,
  label,
  caption,
  ticks = true,
  showMax = true,
  className,
}: ProgressRingProps) {
  const ready = useAnimateIn()
  const fraction = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0
  const offset = CIRCUMFERENCE * (1 - (ready ? fraction : 0))

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn('@container relative aspect-square', className)}
    >
      <svg viewBox="0 0 200 200" aria-hidden="true" className="size-full -rotate-90">
        {ticks
          ? Array.from({ length: TICK_COUNT }, (_, i) => {
              const active = ready && i / TICK_COUNT < fraction
              return (
                <line
                  key={i}
                  x1="100"
                  x2="100"
                  y1="3"
                  y2={i % 5 === 0 ? 11 : 8}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  transform={`rotate(${(i * 360) / TICK_COUNT} 100 100)`}
                  className={cn(
                    'transition-colors duration-(--motion-fill) ease-calm',
                    active ? 'stroke-primary' : 'stroke-track',
                  )}
                />
              )
            })
          : null}
        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          fill="none"
          strokeWidth={ticks ? 8 : 12}
          className="stroke-track"
        />
        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          fill="none"
          strokeWidth={ticks ? 8 : 12}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="stroke-brand-graphic transition-[stroke-dashoffset] duration-(--motion-fill) ease-calm"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-baseline gap-[2cqw]" dir="ltr">
          <span className="numeral text-[40cqw] text-foreground">{value}</span>
          {showMax ? (
            <span className="numeral text-[12cqw] text-muted-foreground">/{max}</span>
          ) : null}
        </div>
        {caption ? (
          <span className="mt-[2cqw] text-[6.5cqw] text-muted-foreground">{caption}</span>
        ) : null}
      </div>
    </div>
  )
}
