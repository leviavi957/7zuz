import { useEffect, useRef, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'

interface ExitDialogProps {
  completion: number
  onCancel: () => void
  onConfirm: () => void
}

/**
 * Rendered inline (not in a portal) so it stays visible in fullscreen.
 * Focus starts on "continue" and cycles between the two buttons.
 */
export function ExitDialog({ completion, onCancel, onConfirm }: ExitDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    cancelRef.current?.focus()
  }, [])

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onCancel()
    }
    if (event.key === 'Tab') {
      event.preventDefault()
      const next = document.activeElement === cancelRef.current ? confirmRef : cancelRef
      next.current?.focus()
    }
  }

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-scrim p-4"
      onKeyDown={onKeyDown}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="exit-title"
        aria-describedby="exit-description"
        className="w-full max-w-sm rounded-3xl border bg-card p-6 text-card-foreground shadow-lift"
      >
        <h2 id="exit-title" className="text-xl">
          לצאת מהאימון?
        </h2>
        <p id="exit-description" className="mt-1 text-muted-foreground">
          השלמתם {completion}% מהאימון. אפשר להמשיך מאותה נקודה, או לצאת ולעבור למשוב.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <Button ref={cancelRef} onClick={onCancel} className="sm:flex-1">
            המשך באימון
          </Button>
          <Button ref={confirmRef} variant="outline" onClick={onConfirm} className="sm:flex-1">
            יציאה
          </Button>
        </div>
      </div>
    </div>
  )
}
