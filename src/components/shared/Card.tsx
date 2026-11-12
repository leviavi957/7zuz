import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type CardTone = 'default' | 'sage' | 'brand'

const toneClasses: Record<CardTone, string> = {
  default: 'bg-card text-card-foreground',
  sage: 'bg-sage text-foreground',
  brand: 'bg-brand-soft text-foreground',
}

interface CardProps extends ComponentProps<'div'> {
  tone?: CardTone
}

export function Card({ tone = 'default', className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'relative rounded-3xl border p-5 shadow-soft md:p-6',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  )
}

interface CardHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-3', className)}>
      <div>
        <h3 className="text-lg">{title}</h3>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}
