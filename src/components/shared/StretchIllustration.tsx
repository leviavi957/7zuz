import { cn } from '@/lib/utils'

/**
 * Decorative line illustration: a person stretching beside a desk, laptop and
 * plant. Ink follows `currentColor`; the single highlight (the motion arc)
 * uses the brand accent. Size it with a width class (120–320px works well).
 */
export function StretchIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn('h-auto [&_*]:[vector-effect:non-scaling-stroke]', className)}
    >
      {/* floor */}
      <path d="M16 204H304" />

      {/* person: side stretch, one arm arcing overhead, other hand on hip */}
      <circle cx="91" cy="74" r="9" />
      <path d="M98 134C100 116 98 102 93 84" />
      <path d="M94 90C112 78 112 48 88 34" />
      <path d="M94 93L79 111L94 127" />
      <path d="M98 134C92 160 85 182 80 204" />
      <path d="M98 134C106 160 113 182 116 204" />

      {/* desk */}
      <path d="M168 142H304" />
      <path d="M180 142V204" />
      <path d="M292 142V204" />

      {/* laptop */}
      <path d="M198 138H274" />
      <path d="M212 138L222 98H264L260 138" />

      {/* plant */}
      <path d="M279 142L282 126H298L301 142" />
      <path d="M290 126V106" />
      <path d="M290 126C290 116 284 110 277 106" />
      <path d="M290 126C291 116 297 110 305 107" />

      {/* the one brand highlight: stretch arc on the leaning side */}
      <path d="M68 62C61 74 61 90 68 102" className="stroke-brand-graphic" />
    </svg>
  )
}
