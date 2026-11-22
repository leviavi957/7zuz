import { cn } from '@/lib/utils'

export interface SegmentOption<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: SegmentOption<T>[]
  label: string
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
}: SegmentedControlProps<T>) {
  const columns =
    options.length === 3 ? 'grid-cols-3' : options.length >= 4 ? 'grid-cols-4' : 'grid-cols-2'

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        'grid gap-1 rounded-2xl border border-input bg-muted/60 p-1',
        columns,
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex min-h-11 items-center justify-center rounded-xl px-3 text-base transition-colors duration-(--motion-base) outline-none focus-visible:ring-3 focus-visible:ring-ring',
              active
                ? 'bg-card font-medium text-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
