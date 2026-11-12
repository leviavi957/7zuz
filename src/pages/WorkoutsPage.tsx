import { SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/shared/Badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { SearchField } from '@/components/shared/SearchField'
import { Button } from '@/components/ui/button'
import { CategoryChips, type CategoryFilter } from '@/components/workouts/CategoryChips'
import { filterAndSortWorkouts } from '@/components/workouts/filter-workouts'
import { SortSelect, type SortKey } from '@/components/workouts/SortSelect'
import { WorkoutCard, WorkoutCardSkeleton } from '@/components/workouts/WorkoutCard'
import { useMockWorkouts } from '@/mocks/useMockWorkouts'

const GRID = 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3'

function countLabel(count: number): string {
  return count === 1 ? 'אימון אחד' : `${count} אימונים`
}

export default function WorkoutsPage() {
  const { status, workouts, retry } = useMockWorkouts()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [sort, setSort] = useState<SortKey>('newest')

  const visible = useMemo(
    () => filterAndSortWorkouts(workouts, { query, category, sort }),
    [workouts, query, category, sort],
  )

  const clearFilters = () => {
    setQuery('')
    setCategory('all')
    retry()
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl md:text-4xl">אימונים</h2>
          <p className="text-muted-foreground">שתי דקות של תנועה, בכל רגע ביום. בחרו אימון והתחילו.</p>
        </div>
        {status === 'ready' ? (
          <Badge variant="brand" aria-live="polite">
            {countLabel(visible.length)}
          </Badge>
        ) : null}
      </header>

      {status === 'error' ? (
        <ErrorState onRetry={retry} />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SearchField label="חיפוש אימון לפי שם" value={query} onChange={setQuery} className="flex-1" />
              <SortSelect value={sort} onChange={setSort} />
            </div>
            <CategoryChips value={category} onChange={setCategory} />
          </div>

          {status === 'loading' ? (
            <div role="status" aria-busy="true" aria-label="טוען אימונים" className={GRID}>
              {Array.from({ length: 6 }, (_, i) => (
                <WorkoutCardSkeleton key={i} />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="לא נמצאו אימונים"
              description="נסו חיפוש אחר או הסירו את הסינון."
              action={<Button variant="outline" onClick={clearFilters}>ניקוי סינון</Button>}
            />
          ) : (
            <ul className={GRID}>
              {visible.map((workout) => (
                <li key={workout.id}>
                  <WorkoutCard workout={workout} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
