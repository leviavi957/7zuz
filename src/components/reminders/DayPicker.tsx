import { DAYS, WORKDAYS } from '@/lib/reminders'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface DayPickerProps {
  value: number[]
  onChange: (days: number[]) => void
}

/** Multi-select day chips (Sunday first) with a one-tap "workdays" shortcut. */
export function DayPicker({ value, onChange }: DayPickerProps) {
  const toggle = (day: number) =>
    onChange(value.includes(day) ? value.filter((item) => item !== day) : [...value, day])

  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label="ימים בשבוע" className="grid grid-cols-7 gap-1.5">
        {DAYS.map(({ value: day, short, long }) => {
          const selected = value.includes(day)
          return (
            <button
              key={day}
              type="button"
              aria-pressed={selected}
              aria-label={`יום ${long}`}
              onClick={() => toggle(day)}
              className={cn(
                'flex min-h-11 items-center justify-center rounded-full border text-base font-medium outline-none transition-colors duration-(--motion-base) focus-visible:ring-3 focus-visible:ring-ring',
                selected
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {short}
            </button>
          )
        })}
      </div>
      <Button variant="ghost" size="sm" className="self-start" onClick={() => onChange(WORKDAYS)}>
        ימי עבודה (א׳–ה׳)
      </Button>
    </div>
  )
}
