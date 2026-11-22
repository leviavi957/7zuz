import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AuthFieldProps extends Omit<ComponentProps<'input'>, 'id'> {
  label: string
  error?: string
  hint?: string
  endAdornment?: ReactNode
  /** Keep Latin fields LTR inside the Hebrew UI. */
  ltr?: boolean
}

export function AuthField({
  label,
  error,
  hint,
  endAdornment,
  ltr = false,
  className,
  ...props
}: AuthFieldProps) {
  const id = useId()
  const errorId = error ? `${id}-error` : undefined
  const hintId = hint && !error ? `${id}-hint` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {/* dir on the wrapper so pe/end match the field direction (LTR password toggle on the right). */}
      <div className="relative" dir={ltr ? 'ltr' : undefined}>
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId ?? hintId}
          className={cn(
            'h-11 w-full rounded-2xl border bg-card px-4 text-base text-foreground shadow-soft outline-none transition-shadow duration-(--motion-base) placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring',
            error ? 'border-destructive' : 'border-input',
            endAdornment && 'pe-12',
            ltr && 'text-start',
            className,
          )}
          {...props}
        />
        {endAdornment ? (
          <div className="absolute inset-y-0 end-0 flex items-center pe-1">{endAdornment}</div>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {hint && !error ? (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
