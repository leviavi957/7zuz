import type { Workout } from '@/mocks/workouts'
import type { CategoryFilter } from './CategoryChips'
import type { SortKey } from './SortSelect'

interface Criteria {
  query: string
  category: CategoryFilter
  sort: SortKey
}

const comparators: Record<SortKey, (a: Workout, b: Workout) => number> = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  shortest: (a, b) => a.durationMinutes - b.durationMinutes,
  mostDone: (a, b) => b.timesCompleted - a.timesCompleted,
}

export function filterAndSortWorkouts(workouts: Workout[], { query, category, sort }: Criteria): Workout[] {
  const needle = query.trim().toLocaleLowerCase('he')

  return workouts
    .filter((w) => category === 'all' || w.category === category)
    .filter((w) => needle === '' || w.title.toLocaleLowerCase('he').includes(needle))
    .sort(comparators[sort])
}
