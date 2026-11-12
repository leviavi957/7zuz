import type { ReactNode } from 'react'
import { Badge } from '@/components/shared/Badge'
import { cn } from '@/lib/utils'

export function Section({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <div>
        <h2 id={id} className="text-2xl">
          {title}
        </h2>
        {description ? <p className="text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

function Panel({ mode, children }: { mode: 'light' | 'dark'; children: ReactNode }) {
  return (
    <div className={cn(mode, 'flex flex-col gap-4 rounded-3xl border bg-background p-5 text-foreground')}>
      <Badge variant="neutral" className="self-start">
        {mode === 'light' ? 'מצב בהיר' : 'מצב כהה'}
      </Badge>
      {children}
    </div>
  )
}

/** Renders its children twice, forced into light and dark, side by side. */
export function ModePair({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel mode="light">{children}</Panel>
      <Panel mode="dark">{children}</Panel>
    </div>
  )
}

export function Label({ children }: { children: ReactNode }) {
  return <p className="text-sm font-medium text-muted-foreground">{children}</p>
}
