import { Card } from '@/components/shared/Card'
import { PartyPopper, Sparkles } from 'lucide-react'
import { ProgressBar } from '@/components/shared/ProgressBar'
import type { CompletionStats } from '@/lib/completionStats'

function headline(completion: number): { title: string; description: string } {
  if (completion >= 100) {
    return { title: 'כל הכבוד, סיימת את האימון!', description: 'עוד הפסקה שהזיזה אותך קדימה.' }
  }
  if (completion >= 50) {
    return { title: `יפה! השלמת ${completion}% מהאימון`, description: 'כל תנועה באמצע היום נחשבת.' }
  }
  return { title: 'התחלת, וזה החלק הקשה', description: 'בפעם הבאה נמשיך מכאן. כל דקה נחשבת.' }
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-card/70 px-2 py-3 text-center">
      <p className="numeral text-3xl">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

interface CompletionSummaryProps {
  workoutTitle: string
  completion: number
  stats: CompletionStats
}

/** The reward: how much was done, in numbers, before asking anything. */
export function CompletionSummary({ workoutTitle, completion, stats }: CompletionSummaryProps) {
  const { title, description } = headline(completion)
  const Icon = completion >= 100 ? PartyPopper : Sparkles

  return (
    <Card tone="brand" className="flex flex-col items-center gap-5 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-brand-solid text-brand-solid-foreground shadow-soft">
        <Icon className="size-8" aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-2xl md:text-3xl">{title}</h2>
        <p className="mt-1 text-muted-foreground">{description}</p>
        <p className="mt-1 text-sm text-muted-foreground">{workoutTitle}</p>
      </div>
      <ProgressBar
        value={completion}
        max={100}
        label="השלמת האימון"
        valueText={`${completion}%`}
        className="w-full"
      />
      <div className="grid w-full grid-cols-3 gap-2">
        <Stat value={stats.minutes} label="דקות" />
        <Stat value={stats.exercises} label="תרגילים" />
        <Stat value={stats.sets} label="סטים" />
      </div>
    </Card>
  )
}
