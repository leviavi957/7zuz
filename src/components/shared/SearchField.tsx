import { Search, X } from 'lucide-react'
import { useId } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  /** Accessible name and placeholder. */
  label: string
  className?: string
}

export function SearchField({ value, onChange, label, className }: SearchFieldProps) {
  const id = useId()

  return (
    <div className={cn('relative', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute inset-y-0 start-4 my-auto size-5 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        id={id}
        type="text"
        inputMode="search"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        className="h-11 w-full rounded-full border border-input bg-card ps-12 pe-12 text-base text-foreground shadow-soft outline-none transition-shadow duration-(--motion-base) placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring"
      />
      {value ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="ניקוי חיפוש"
          onClick={() => onChange('')}
          className="absolute inset-y-0 end-0"
        >
          <X />
        </Button>
      ) : null}
    </div>
  )
}
