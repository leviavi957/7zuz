import { Check, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, type BadgeVariant } from '@/components/shared/Badge'
import { Card } from '@/components/shared/Card'
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  type Workout,
  type WorkoutDifficulty,
} from '@/mocks/workouts'
import { WorkoutThumbnail } from './WorkoutThumbnail'

const difficultyVariant: Record<WorkoutDifficulty, BadgeVariant> = {
  easy: 'sage',
  medium: 'brand',
  hard: 'solid',
}

export function WorkoutCard({ workout }: { workout: Workout }) {
  const { id, title, description, category, difficulty, durationMinutes, timesCompleted } = workout

  return (
    <Link
      to={`/workouts/${id}`}
      className="group block h-full rounded-3xl outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card padded={false} className="flex h-full flex-col overflow-hidden transition-[box-shadow,border-color,transform] duration-(--motion-base) ease-calm group-hover:border-brand-graphic group-hover:shadow-lift motion-safe:group-hover:-translate-y-0.5">
        <WorkoutThumbnail category={category} />
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={difficultyVariant[difficulty]}>{DIFFICULTY_LABELS[difficulty]}</Badge>
            <Badge>{CATEGORY_LABELS[category]}</Badge>
            {timesCompleted > 0 ? (
              <Badge variant="sage">
                <Check className="size-3.5" aria-hidden="true" />
                בוצע {timesCompleted > 1 ? `${timesCompleted} פעמים` : 'פעם אחת'}
              </Badge>
            ) : null}
          </div>
          <div>
            <h3 className="text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <p className="mt-auto flex items-center gap-1.5 text-sm font-medium">
            <Clock className="size-4 text-brand-ink" aria-hidden="true" />
            {durationMinutes} דק&apos;
          </p>
        </div>
      </Card>
    </Link>
  )
}

export function WorkoutCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-soft" aria-hidden="true">
      <div className="h-36 bg-muted motion-safe:animate-pulse" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-5 w-24 rounded-full bg-muted motion-safe:animate-pulse" />
        <div className="h-6 w-3/4 rounded-xl bg-muted motion-safe:animate-pulse" />
        <div className="h-4 w-full rounded-xl bg-muted motion-safe:animate-pulse" />
      </div>
    </div>
  )
}
