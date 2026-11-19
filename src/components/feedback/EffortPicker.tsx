import { EFFORT_OPTIONS, type Effort } from '@/lib/feedback'
import { cn } from '@/lib/utils'

interface EffortPickerProps {
  value: Effort | undefined
  onChange: (value: Effort | undefined) => void
}

/** "How did it feel?" in one tap. Tapping the chosen option again clears it. */
export function EffortPicker({ value, onChange }: EffortPickerProps) {
  return (
    <div role="group" aria-label="איך הרגשת באימון?" className="grid grid-cols-5 gap-2">
      {EFFORT_OPTIONS.map(({ value: option, label, icon: Icon }) => {
        const selected = option === value
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(selected ? undefined : option)}
            className={cn(
              'flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border px-1 py-2 text-xs font-medium outline-none transition-colors duration-(--motion-base) focus-visible:ring-3 focus-visible:ring-ring',
              selected
                ? 'border-transparent bg-brand-soft text-brand-ink'
                : 'bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <Icon className="size-6" aria-hidden="true" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
