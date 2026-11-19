import type { StepExercise } from '@/lib/workoutTimeline'
import { WorkoutThumbnail } from './WorkoutThumbnail'

/** Small exercise preview: its poster, or the abstract placeholder when there is none. */
export function ExerciseThumb({ exercise }: { exercise: StepExercise }) {
  return exercise.posterSrc ? (
    <img
      src={exercise.posterSrc}
      alt=""
      className="h-10 w-14 shrink-0 rounded-xl bg-muted object-cover"
    />
  ) : (
    <WorkoutThumbnail
      category={exercise.category ?? 'posture'}
      showPlay={false}
      className="h-10 w-14 shrink-0 rounded-xl"
    />
  )
}
