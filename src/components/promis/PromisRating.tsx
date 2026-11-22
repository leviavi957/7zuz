import { PROMIS_SCALE } from '@/content/promisCopy'
import { cn } from '@/lib/utils'

interface PromisRatingProps {
  questionId: string
  number: number
  text: string
  value: number | undefined
  onChange: (value: number) => void
}

/**
 * One PROMIS item: a radio group of five large, Hebrew-labeled options.
 * Selection is not color alone — the pressed state also changes weight and
 * the accessible name carries the label.
 */
export function PromisRating({ questionId, number, text, value, onChange }: PromisRatingProps) {
  const name = `promis-${questionId}`

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="flex gap-2 text-start text-lg font-medium">
        <span className="numeral w-6 shrink-0 text-muted-foreground" aria-hidden="true">
          {number}.
        </span>
        <span>{text}</span>
      </legend>
      <div role="radiogroup" aria-label={`שאלה ${number}`} className="grid gap-2">
        {PROMIS_SCALE.map((option) => {
          const selected = value === option.value
          const id = `${name}-${option.value}`
          return (
            <label
              key={option.value}
              htmlFor={id}
              className={cn(
                'flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 outline-none transition-colors duration-(--motion-base) has-focus-visible:ring-3 has-focus-visible:ring-ring',
                selected
                  ? 'border-transparent bg-brand-soft font-medium text-brand-ink'
                  : 'bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="size-5 shrink-0 accent-brand-graphic"
              />
              <span className="numeral w-5 shrink-0" aria-hidden="true">
                {option.value}
              </span>
              <span>{option.label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
