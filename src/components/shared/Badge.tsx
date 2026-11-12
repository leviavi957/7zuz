import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'neutral' | 'brand' | 'solid' | 'sage' | 'danger'

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-muted text-muted-foreground',
  brand: 'bg-brand-soft text-brand-ink',
  solid: 'bg-brand-solid text-brand-solid-foreground',
  sage: 'bg-sage text-sage-ink',
  danger: 'bg-destructive/10 text-destructive',
}

interface BadgeProps extends ComponentProps<'span'> {
  variant?: BadgeVariant
}

export function Badge({ variant = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
