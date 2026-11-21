import { cn } from '@/lib/utils'

/**
 * "בס״ד" in the corner of every page. Quiet by design: small and muted.
 * Place it at the start side with logical properties (the right in RTL).
 * Uses the typographic gershayim (U+05F4), never straight quotes.
 */
export function BasadMark({ className }: { className?: string }) {
  return (
    <span
      lang="he"
      translate="no"
      className={cn('select-none text-xs font-medium leading-none text-muted-foreground', className)}
    >
      {'בס\u05F4ד'}
    </span>
  )
}
