import { LoaderCircle } from 'lucide-react'

export function BufferingOverlay() {
  return (
    <div
      role="status"
      className="absolute inset-0 z-20 flex items-center justify-center bg-scrim"
    >
      <div className="flex items-center gap-3 rounded-full bg-card px-5 py-3 text-base font-medium shadow-lift">
        <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        טוען...
      </div>
    </div>
  )
}
