import { useAnimateIn } from '@/hooks/useAnimateIn'
import { cn } from '@/lib/utils'

type BarTone = 'brand' | 'primary' | 'sage'

const toneClasses: Record<BarTone, string> = {
  brand: 'bg-brand-graphic',
  primary: 'bg-primary',
  sage: 'bg-sage-ink',
}

interface ProgressBarProps {
  value: number
  max: number
  /** Visible and accessible name. */
  label: string
  /** Right-hand value text, e.g. "12 מתוך 20". */
  valueText?: string
  /** Render as N discrete segments (streak bar). */
  segments?: number
  /** Slim bar; the label stays available to screen readers only. */
  compact?: boolean
  tone?: BarTone
  className?: string
}

export function ProgressBar({
  value,
  max,
  label,
  valueText,
  segments,
  compact = false,
  tone = 'brand',
  className,
}: ProgressBarProps) {
  const ready = useAnimateIn()
  const fraction = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      className={cn('w-full', className)}
    >
      <div className={cn('mb-2 flex items-baseline justify-between gap-3', compact && 'sr-only')}>
        <span className="text-sm font-medium">{label}</span>
        {valueText ? <span className="text-sm text-muted-foreground">{valueText}</span> : null}
      </div>
      {segments ? (
        <div className="flex gap-1.5" aria-hidden="true">
          {Array.from({ length: segments }, (_, i) => (
            <span
              key={i}
              style={{ transitionDelay: `${i * 70}ms` }}
              className={cn(
                'h-3 flex-1 rounded-full transition-colors duration-(--motion-fill) ease-calm',
                ready && i < value ? toneClasses[tone] : 'bg-track',
              )}
            />
          ))}
        </div>
      ) : (
        <div className={cn('overflow-hidden rounded-full bg-track', compact ? 'h-1.5' : 'h-3')} aria-hidden="true">
          <div
            style={{ width: `${(ready ? fraction : 0) * 100}%` }}
            className={cn(
              'h-full rounded-full transition-[width] duration-(--motion-fill) ease-calm',
              toneClasses[tone],
            )}
          />
        </div>
      )}
    </div>
  )
}
