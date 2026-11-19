import { Annoyed, Frown, Laugh, Meh, Smile, type LucideIcon } from 'lucide-react'

/** How hard the workout felt, from very easy (1) to very hard (5). */
export type Effort = 1 | 2 | 3 | 4 | 5

export const EFFORT_OPTIONS: { value: Effort; label: string; icon: LucideIcon }[] = [
  { value: 1, label: 'קל מאוד', icon: Laugh },
  { value: 2, label: 'קל', icon: Smile },
  { value: 3, label: 'בינוני', icon: Meh },
  { value: 4, label: 'קשה', icon: Frown },
  { value: 5, label: 'קשה מאוד', icon: Annoyed },
]

export type RatingKey = 'enjoyment' | 'progress' | 'continue'

export const RATING_QUESTIONS: { key: RatingKey; label: string }[] = [
  { key: 'enjoyment', label: 'נהניתי מהאימון' },
  { key: 'progress', label: 'האימון מקדם אותי ליעד' },
  { key: 'continue', label: 'אמשיך להתאמן' },
]

/** Every field is optional: busy people answer only what they care about. */
export interface WorkoutFeedback {
  workoutId: string
  /** Percent of the workout that was completed, 0-100. */
  completion: number
  effort?: Effort
  /** Star ratings, 1-5. */
  ratings: Partial<Record<RatingKey, number>>
}

export function hasAnswers({ effort, ratings }: Pick<WorkoutFeedback, 'effort' | 'ratings'>): boolean {
  return effort !== undefined || Object.keys(ratings).length > 0
}
