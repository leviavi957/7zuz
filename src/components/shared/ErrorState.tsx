import { RotateCw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'משהו השתבש',
  description = 'לא הצלחנו לטעון את התוכן. אפשר לנסות שוב.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-3 rounded-3xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center',
        className,
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-7" aria-hidden="true" />
      </span>
      <h2 className="text-xl">{title}</h2>
      <p className="max-w-sm text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button variant="outline" className="mt-2" onClick={onRetry}>
          <RotateCw />
          ניסיון חוזר
        </Button>
      ) : null}
    </div>
  )
}
