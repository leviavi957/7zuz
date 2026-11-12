import { cn } from '@/lib/utils'

/**
 * Soft organic shapes with fine grain. Place inside a `relative isolate`
 * container; it paints behind content and ignores pointer events.
 */
export function BackgroundShapes({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
    >
      <svg
        viewBox="0 0 800 800"
        preserveAspectRatio="xMidYMid slice"
        className="size-full"
      >
        <path
          d="M640 -40c120 40 220 150 190 270s-170 150-270 120-110-150-70-250 60-180 150-140z"
          className="fill-sage opacity-80"
        />
        <path
          d="M-60 520c110-70 250-30 300 70s-10 230-130 250-240-30-270-120 10-150 100-200z"
          className="fill-brand opacity-[0.14]"
        />
        <path
          d="M300 880c40-110 190-150 300-100s150 170 90 250-250 80-340 20-90-100-50-170z"
          className="fill-sage opacity-60"
        />
      </svg>
      <svg className="absolute inset-0 size-full" style={{ opacity: 'var(--grain-opacity)' }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  )
}
