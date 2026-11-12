import type { HeatLevel } from '@/components/shared/Heatmap'

export interface HomeData {
  name: string
  weekDone: number
  weekGoal: number
  streak: number
  streakDays: number
  monthDone: number
  monthGoal: number
  todayDone: number
  todayTotal: number
  nextReminder: string
  tip: string
  heat: HeatLevel[]
  todayIndex: number
}

const WEEKS = 12
const TODAY_INDEX = (WEEKS - 1) * 7 + 4
const RECENT: HeatLevel[] = [2, 3, 1, 3, 4, 2]

function buildHeat(): HeatLevel[] {
  const palette: HeatLevel[] = [0, 0, 1, 2, 3, 4]
  return Array.from({ length: WEEKS * 7 }, (_, i) => {
    if (i > TODAY_INDEX) return null
    if (i > TODAY_INDEX - RECENT.length) return RECENT[i - (TODAY_INDEX - RECENT.length + 1)]
    return palette[((Math.imul(i + 3, 2654435761) >>> 11) + i) % palette.length]
  })
}

export const HOME_DATA: HomeData = {
  name: 'נועה',
  weekDone: 3,
  weekGoal: 5,
  streak: 6,
  streakDays: 7,
  monthDone: 12,
  monthGoal: 20,
  todayDone: 2,
  todayTotal: 3,
  nextReminder: '10:30',
  tip: 'גוף חכם הוא גוף שזז. שתי דקות עכשיו שוות שעה של פוקוס.',
  heat: buildHeat(),
  todayIndex: TODAY_INDEX,
}
