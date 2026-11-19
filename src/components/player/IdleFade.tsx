import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Fades its children out when idle; keyboard focus inside keeps them visible. */
export function IdleFade({
  visible,
  className,
  children,
}: {
  visible: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'transition-opacity duration-(--motion-slow) ease-calm',
        !visible && 'pointer-events-none opacity-0 focus-within:pointer-events-auto focus-within:opacity-100',
        className,
      )}
    >
      {children}
    </div>
  )
}
