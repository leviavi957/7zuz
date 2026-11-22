import { SegmentedControl } from '@/components/auth/SegmentedControl'
import { ORG_PERIODS, type OrgOrganization, type OrgPeriod } from '@/mocks/orgStats'

const PERIOD_OPTIONS = ORG_PERIODS.map((value) => ({
  value: String(value) as `${OrgPeriod}`,
  label: `${value} ימים`,
}))

interface OrgHeaderProps {
  organization: OrgOrganization
  period: OrgPeriod
  onPeriodChange: (period: OrgPeriod) => void
}

export function OrgHeader({ organization, period, onPeriodChange }: OrgHeaderProps) {
  return (
    <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-lg font-medium text-brand-ink"
        >
          {organization.logoInitials}
        </span>
        <div>
          <p className="text-muted-foreground">לוח בקרה ארגוני</p>
          <h2 className="text-3xl md:text-4xl">{organization.name}</h2>
        </div>
      </div>
      <div className="w-full md:max-w-sm">
        <SegmentedControl
          label="בחירת תקופה"
          value={String(period) as `${OrgPeriod}`}
          options={PERIOD_OPTIONS}
          onChange={(value) => onPeriodChange(Number(value) as OrgPeriod)}
        />
      </div>
    </header>
  )
}
