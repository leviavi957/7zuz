import { ChevronDown } from 'lucide-react'
import { useId } from 'react'

export type SortKey = 'newest' | 'shortest' | 'mostDone'

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'הכי חדש' },
  { value: 'shortest', label: 'הקצר ביותר' },
  { value: 'mostDone', label: 'הכי נעשה' },
]

export function SortSelect({ value, onChange }: { value: SortKey; onChange: (value: SortKey) => void }) {
  const id = useId()

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm text-muted-foreground">
        מיון
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value as SortKey)}
          className="h-11 appearance-none rounded-full border border-input bg-card ps-4 pe-10 text-base text-foreground shadow-soft outline-none focus-visible:ring-3 focus-visible:ring-ring"
        >
          {OPTIONS.map(({ value: option, label }) => (
            <option key={option} value={option}>
              {label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute inset-y-0 end-3 my-auto size-4 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
