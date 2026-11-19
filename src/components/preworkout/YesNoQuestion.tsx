import { cn } from '@/lib/utils'

interface YesNoQuestionProps {
  number: number
  text: string
  value: boolean | undefined
  onChange: (value: boolean) => void
}

const OPTIONS = [
  { value: false, label: 'לא' },
  { value: true, label: 'כן' },
] as const

/** A health question answered with one tap: no / yes. */
export function YesNoQuestion({ number, text, value, onChange }: YesNoQuestionProps) {
  return (
    <div role="group" aria-label={`שאלה ${number}: ${text}`} className="flex flex-col gap-2">
      <p className="flex gap-2">
        <span className="numeral w-5 shrink-0 text-muted-foreground" aria-hidden="true">
          {number}.
        </span>
        <span aria-hidden="true">{text}</span>
      </p>
      <div className="grid grid-cols-2 gap-2 ps-7">
        {OPTIONS.map((option) => {
          const selected = value === option.value
          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                'min-h-11 rounded-full border text-base font-medium outline-none transition-colors duration-(--motion-base) focus-visible:ring-3 focus-visible:ring-ring',
                selected
                  ? option.value
                    ? 'border-transparent bg-brand-soft text-brand-ink'
                    : 'border-transparent bg-sage text-sage-ink'
                  : 'bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
