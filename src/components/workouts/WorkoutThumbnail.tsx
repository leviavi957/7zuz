import { Play } from 'lucide-react'
import type { WorkoutCategory } from '@/mocks/workouts'
import { cn } from '@/lib/utils'

const surfaceClasses: Record<WorkoutCategory, string> = {
  strength: 'bg-sage',
  flexibility: 'bg-brand-soft',
  cardio: 'bg-secondary',
  posture: 'bg-muted',
  breathing: 'bg-accent',
}

/** One abstract composition per category, drawn only with token fills/strokes. */
function Composition({ category }: { category: WorkoutCategory }) {
  switch (category) {
    case 'strength':
      return (
        <>
          <rect x="52" y="104" width="44" height="52" rx="12" className="fill-primary opacity-25" />
          <rect x="108" y="80" width="44" height="76" rx="12" className="fill-primary opacity-45" />
          <rect x="164" y="52" width="44" height="104" rx="12" className="fill-primary opacity-70" />
          <circle cx="248" cy="48" r="16" className="fill-brand" />
        </>
      )
    case 'flexibility':
      return (
        <>
          <path d="M-10 120C60 60 120 170 190 110S290 60 340 100V190H-10Z" className="fill-sage-ink opacity-25" />
          <path d="M-10 150C70 110 130 190 210 140S300 120 340 150V190H-10Z" className="fill-sage-ink opacity-40" />
          <circle cx="248" cy="52" r="18" className="fill-brand" />
        </>
      )
    case 'cardio':
      return (
        <>
          <path
            d="M20 104H92L112 56L146 140L172 84L190 104H300"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-primary opacity-60"
          />
          <circle cx="172" cy="84" r="10" className="fill-brand" />
        </>
      )
    case 'posture':
      return (
        <>
          <path d="M160 24C146 60 174 84 160 120S146 150 160 168" fill="none" strokeWidth="5" strokeLinecap="round" className="stroke-primary opacity-40" />
          {[44, 76, 108, 140].map((cy, i) => (
            <circle key={cy} cx={i % 2 === 0 ? 156 : 164} cy={cy} r="12" className="fill-primary opacity-30" />
          ))}
          <circle cx="248" cy="52" r="16" className="fill-brand" />
        </>
      )
    case 'breathing':
      return (
        <>
          <circle cx="160" cy="90" r="76" className="fill-sage-ink opacity-15" />
          <circle cx="160" cy="90" r="52" className="fill-sage-ink opacity-25" />
          <circle cx="160" cy="90" r="28" className="fill-brand" />
        </>
      )
  }
}

export function WorkoutThumbnail({
  category,
  className,
}: {
  category: WorkoutCategory
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cn('relative h-36 w-full overflow-hidden', surfaceClasses[category], className)}
    >
      <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className="size-full">
        <Composition category={category} />
      </svg>
      <span className="absolute bottom-3 start-3 flex size-9 items-center justify-center rounded-full bg-brand-solid text-brand-solid-foreground shadow-soft">
        <Play className="size-4" />
      </span>
    </div>
  )
}
