import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-3xl border border-dashed bg-card/60 px-6 py-12 text-center',
        className,
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-sage text-sage-ink">
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <h2 className="text-xl">{title}</h2>
      {description ? <p className="max-w-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
