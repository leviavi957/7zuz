import { Activity, CheckCircle2, Flame, Users } from 'lucide-react'
import { Card } from '@/components/shared/Card'
import type { OrgKpis } from '@/mocks/orgStats'

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

interface OrgKpiCardsProps {
  kpis: OrgKpis
}

const CARDS: {
  key: keyof OrgKpis
  label: string
  icon: typeof Flame
  format: (kpis: OrgKpis) => string
}[] = [
  {
    key: 'workoutsCompleted',
    label: 'אימונים שהושלמו',
    icon: CheckCircle2,
    format: (k) => String(k.workoutsCompleted),
  },
  {
    key: 'participationRate',
    label: 'שיעור השתתפות',
    icon: Users,
    format: (k) => formatPercent(k.participationRate),
  },
  {
    key: 'averageEffort',
    label: 'מאמץ ממוצע',
    icon: Flame,
    format: (k) => (k.averageEffort > 0 ? k.averageEffort.toFixed(1) : '—'),
  },
  {
    key: 'completionRate',
    label: 'שיעור השלמה',
    icon: Activity,
    format: (k) => formatPercent(k.completionRate),
  },
]

export function OrgKpiCards({ kpis }: OrgKpiCardsProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map(({ key, label, icon: Icon, format }) => (
        <li key={key}>
          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">{label}</p>
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                <Icon className="size-5" aria-hidden="true" />
              </span>
            </div>
            <p className="numeral text-3xl font-medium tracking-tight">{format(kpis)}</p>
          </Card>
        </li>
      ))}
    </ul>
  )
}
