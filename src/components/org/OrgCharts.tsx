import type { ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardHeader } from '@/components/shared/Card'
import { useCssVar } from '@/hooks/useCssVar'
import type { OrgTimePoint, OrgWeekdayPoint } from '@/mocks/orgStats'

interface ChartShellProps {
  title: string
  description: string
  summary: string
  children: ReactNode
}

function ChartShell({ title, description, summary, children }: ChartShellProps) {
  return (
    <Card className="flex flex-col gap-2">
      <CardHeader title={title} description={description} className="mb-2" />
      <figure className="min-h-64 w-full" aria-label={title}>
        <p className="sr-only">{summary}</p>
        <div aria-hidden="true" className="h-64 w-full">
          {children}
        </div>
      </figure>
    </Card>
  )
}

function tooltipStyle(card: string, foreground: string, border: string) {
  return {
    backgroundColor: card || undefined,
    borderColor: border || undefined,
    borderRadius: 12,
    color: foreground || undefined,
  }
}

interface OrgLineChartProps {
  data: OrgTimePoint[]
}

export function OrgWorkoutsLineChart({ data }: OrgLineChartProps) {
  const brand = useCssVar('--brand-graphic')
  const muted = useCssVar('--muted-foreground')
  const border = useCssVar('--border')
  const card = useCssVar('--card')
  const foreground = useCssVar('--card-foreground')
  const total = data.reduce((sum, point) => sum + point.count, 0)
  const summary =
    data.length === 0
      ? 'אין נתונים לגרף האימונים לאורך זמן.'
      : `גרף קו: ${total} אימונים בתקופה שנבחרה, מ-${data[0]?.label ?? ''} עד ${data[data.length - 1]?.label ?? ''}.`

  return (
    <ChartShell
      title="אימונים לאורך זמן"
      description="מספר אימונים שהושלמו בכל יום"
      summary={summary}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={border} strokeDasharray="4 6" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: muted, fontSize: 12 }}
            axisLine={{ stroke: border }}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis
            allowDecimals={false}
            width={36}
            tick={{ fill: muted, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle(card, foreground, border)}
            labelFormatter={(label) => `יום ${String(label)}`}
            formatter={(value) => [`${String(value)} אימונים`, 'הושלמו']}
          />
          <Line
            type="monotone"
            dataKey="count"
            name="אימונים"
            stroke={brand}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: brand }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

interface OrgBarChartProps {
  data: OrgWeekdayPoint[]
}

export function OrgWeekdayBarChart({ data }: OrgBarChartProps) {
  const brand = useCssVar('--brand')
  const muted = useCssVar('--muted-foreground')
  const border = useCssVar('--border')
  const card = useCssVar('--card')
  const foreground = useCssVar('--card-foreground')
  const peak = data.reduce(
    (best, point) => (point.count > best.count ? point : best),
    data[0] ?? { weekday: 0, label: '', count: 0 },
  )
  const summary =
    data.length === 0
      ? 'אין נתונים לגרף לפי יום בשבוע.'
      : `גרף עמודות לפי ימי השבוע. היום עם הכי הרבה אימונים: ${peak.label} עם ${peak.count}.`

  return (
    <ChartShell
      title="אימונים לפי יום בשבוע"
      description="מראשון עד שבת"
      summary={summary}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={border} strokeDasharray="4 6" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: muted, fontSize: 12 }}
            axisLine={{ stroke: border }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            width={36}
            tick={{ fill: muted, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle(card, foreground, border)}
            formatter={(value) => [`${String(value)} אימונים`, 'הושלמו']}
          />
          <Bar dataKey="count" name="אימונים" fill={brand} radius={[10, 10, 4, 4]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}
