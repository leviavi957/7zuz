import { cn } from '@/lib/utils'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Accessible name (the switch has no visible text). */
  label: string
}

/** On/off switch. The 44px hit area is larger than the visible track. */
export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="group flex size-11 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring"
    >
      <span
        className={cn(
          'flex h-7 w-12 items-center rounded-full px-1 transition-colors duration-(--motion-base)',
          checked ? 'bg-brand-graphic' : 'bg-track',
        )}
      >
        <span
          className={cn(
            'size-5 rounded-full bg-card shadow-soft transition-transform duration-(--motion-base) ease-calm',
            checked && 'translate-x-5 rtl:-translate-x-5',
          )}
        />
      </span>
    </button>
  )
}
