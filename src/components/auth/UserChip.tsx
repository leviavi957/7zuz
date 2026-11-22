import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { sessionChipLabel, signOut, type Session } from '@/lib/auth'
import { cn } from '@/lib/utils'

interface UserChipProps {
  session: Session
  /** Compact icon-only sign-out when the sidebar is collapsed. */
  compact?: boolean
  className?: string
}

export function UserChip({ session, compact = false, className }: UserChipProps) {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const label = sessionChipLabel(session)

  const leave = async () => {
    if (busy) return
    setBusy(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } finally {
      setBusy(false)
    }
  }

  if (compact) {
    return (
      <div className={cn('flex flex-col items-center gap-1', className)}>
        <span
          title={label}
          className="flex size-11 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground"
        >
          {label.slice(0, 1)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="יציאה"
          disabled={busy}
          onClick={leave}
        >
          <LogOut />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex min-h-11 items-center gap-3 rounded-2xl bg-secondary/70 px-3 text-sm">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft font-medium text-brand-ink">
          {label.slice(0, 1)}
        </span>
        <span className="min-w-0 truncate font-medium">{label}</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        className="w-full justify-start text-muted-foreground"
        disabled={busy}
        onClick={leave}
      >
        <LogOut />
        יציאה
      </Button>
    </div>
  )
}
