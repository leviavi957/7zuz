import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const STARS = [1, 2, 3, 4, 5] as const

interface StarRatingProps {
  /** Visible question; also the group's accessible name. */
  label: string
  value: number | undefined
  onChange: (value: number | undefined) => void
}

/** One-tap 1-5 stars. Tapping the chosen star again clears it. */
export function StarRating({ label, value = 0, onChange }: StarRatingProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1"
    >
      <p className="font-medium" aria-hidden="true">
        {label}
      </p>
      <div className="flex">
        {STARS.map((star) => (
          <button
            key={star}
            type="button"
            aria-label={`${star} מתוך 5`}
            aria-pressed={star === value}
            onClick={() => onChange(star === value ? undefined : star)}
            className="flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring"
          >
            <Star
              aria-hidden="true"
              className={cn(
                'size-7 transition-colors duration-(--motion-base)',
                star <= value
                  ? 'fill-brand-graphic text-brand-graphic'
                  : 'text-muted-foreground/60',
              )}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
