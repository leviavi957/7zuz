import { cn } from '@/lib/utils'

const SPEEDS = [0.5, 0.75, 1, 1.5, 2] as const

export function SpeedControl({ value, onChange }: { value: number; onChange: (rate: number) => void }) {
  return (
    <div role="radiogroup" aria-label="מהירות ניגון" dir="ltr" className="flex items-center gap-1">
      {SPEEDS.map((speed) => {
        const active = speed === value
        return (
          <button
            key={speed}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(speed)}
            className={cn(
              'numeral min-h-11 min-w-11 rounded-full px-2 text-sm tracking-normal transition-colors duration-(--motion-base) outline-none focus-visible:ring-3 focus-visible:ring-ring',
              active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent',
            )}
          >
            {speed}×
          </button>
        )
      })}
    </div>
  )
}
