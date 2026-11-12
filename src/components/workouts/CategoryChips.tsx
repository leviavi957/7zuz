import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CATEGORY_LABELS, type WorkoutCategory } from '@/mocks/workouts'

export type CategoryFilter = WorkoutCategory | 'all'

const OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'הכל' },
  ...(Object.entries(CATEGORY_LABELS) as [WorkoutCategory, string][]).map(([value, label]) => ({
    value,
    label,
  })),
]

interface CategoryChipsProps {
  value: CategoryFilter
  onChange: (value: CategoryFilter) => void
}

/** Single-select filter chips; scrolls horizontally on narrow screens. */
export function CategoryChips({ value, onChange }: CategoryChipsProps) {
  return (
    <div
      role="group"
      aria-label="סינון לפי קטגוריה"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
    >
      {OPTIONS.map(({ value: option, label }) => {
        const active = option === value
        return (
          <Button
            key={option}
            size="sm"
            variant={active ? 'default' : 'outline'}
            aria-pressed={active}
            onClick={() => onChange(option)}
          >
            {active ? <Check className="size-4" /> : null}
            {label}
          </Button>
        )
      })}
    </div>
  )
}
