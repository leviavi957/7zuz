import { Bell, X } from 'lucide-react'
import { useEffect, useSyncExternalStore } from 'react'
import { Button } from '@/components/ui/button'
import { dismissToast, getToasts, subscribeToasts, type Toast } from '@/lib/toast'

const AUTO_DISMISS_MS = 10_000

function ToastItem({ toast }: { toast: Toast }) {
  useEffect(() => {
    const id = setTimeout(() => dismissToast(toast.id), AUTO_DISMISS_MS)
    return () => clearTimeout(id)
  }, [toast.id])

  return (
    <div className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-card p-3 text-card-foreground shadow-lift duration-(--motion-slow) ease-calm animate-in fade-in slide-in-from-top-2">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-ink">
        <Bell className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 self-center">
        <p className="font-medium">{toast.title}</p>
        {toast.message ? <p className="text-sm text-muted-foreground">{toast.message}</p> : null}
      </div>
      <Button variant="ghost" size="icon" aria-label="סגירה" onClick={() => dismissToast(toast.id)}>
        <X />
      </Button>
    </div>
  )
}

/** In-page messages, announced politely to screen readers. Mounted once, in the app root. */
export function Toaster() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts)

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="הודעות"
      className="pointer-events-none fixed inset-x-4 top-20 z-[60] flex flex-col items-center gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
