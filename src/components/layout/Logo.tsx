import { cn } from '@/lib/utils'

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)} dir="ltr">
      <span className="numeral flex size-10 items-center justify-center rounded-xl bg-primary text-base text-primary-foreground">
        7Z
      </span>
      {compact ? null : (
        <span className="numeral text-xl tracking-tight text-foreground">
          7ZUZ<span className="text-brand-ink">.</span>
        </span>
      )}
      <span className="sr-only">7ZUZ</span>
    </div>
  )
}
