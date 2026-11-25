import type { WorkoutItem } from '@/lib/workoutTimeline'

export type WorkoutCategory = 'strength' | 'flexibility' | 'cardio' | 'posture' | 'breathing'
export type WorkoutDifficulty = 'easy' | 'medium' | 'hard'

export interface Workout {
  id: string
  title: string
  description: string
  category: WorkoutCategory
  difficulty: WorkoutDifficulty
  /** ISO date. */
  createdAt: string
  timesCompleted: number
  /** The workout structure (references library exercises). Duration is computed from it. */
  items: WorkoutItem[]
  /** Optional per-workout track; falls back to the app-wide one in config/music.ts. */
  musicSrc?: string
}

export const CATEGORY_LABELS: Record<WorkoutCategory, string> = {
  strength: 'כוח',
  flexibility: 'גמישות',
  cardio: 'אירובי',
  posture: 'יציבה וצוואר',
  breathing: 'נשימה',
}

export const DIFFICULTY_LABELS: Record<WorkoutDifficulty, string> = {
  easy: 'קל',
  medium: 'בינוני',
  hard: 'קשה',
}

const item = (
  exerciseId: string,
  sets: number,
  restSeconds: number,
  durationSeconds?: number,
): WorkoutItem => ({ exerciseId, sets, restSeconds, durationSeconds })
export const WORKOUTS: Workout[] = [
  {
    id: 'neck-shoulders-release',
    title: 'שחרור צוואר וכתפיים',
    description: 'שחרור מתח מהצוואר והכתפיים אחרי שעות מול המסך.',
    category: 'posture',
    difficulty: 'easy',
    createdAt: '2026-11-02',
    timesCompleted: 5,
    items: [item('neck-side-stretch', 2, 5), item('shoulder-rolls', 2, 5), item('standing-chest-opener', 1, 0)],
  },
  {
    id: 'chest-opener',
    title: 'פתיחת בית החזה',
    description: 'מתיחות עדינות שמחזירות רוחב לחזה ולכתפיים.',
    category: 'flexibility',
    difficulty: 'easy',
    createdAt: '2026-10-20',
    timesCompleted: 2,
    items: [item('standing-chest-opener', 2, 10), item('shoulder-rolls', 2, 10, 25), item('neck-side-stretch', 2, 8), item('belly-breathing', 1, 0)],
  },
  {
    id: 'box-breathing',
    title: 'נשימת קופסה',
    description: 'ארבע נשימות מדודות להורדת קצב ולחזרה לריכוז.',
    category: 'breathing',
    difficulty: 'easy',
    createdAt: '2026-10-28',
    timesCompleted: 8,
    items: [item('belly-breathing', 1, 5), item('box-breathing', 6, 4)],
  },
  {
    id: 'energizing-march',
    title: 'צעדה ממריצה במקום',
    description: 'הרמת דופק קלה בלי לעזוב את הפינה שלכם.',
    category: 'cardio',
    difficulty: 'easy',
    createdAt: '2026-09-30',
    timesCompleted: 0,
    // Demo timeline: 6 work + 5 rests (10s work / 10s rest, two exercises × 3 sets).
    items: [item('jumping-in-place', 3, 10, 10), item('wall-pushups', 3, 10, 10)],
  },
  {
    id: 'jump-and-raise',
    title: 'קפיצות והרמות ידיים',
    description: 'שילוב קצר של קפיצות במקום והרמות ידיים — שני הסרטונים הדמו.',
    category: 'cardio',
    difficulty: 'easy',
    createdAt: '2026-11-25',
    timesCompleted: 0,
    items: [item('jumping-in-place', 3, 10, 10), item('arm-raises', 3, 10, 10)],
  },
  {
    id: 'desk-squats',
    title: 'סקוואטים ליד השולחן',
    description: 'חיזוק רגליים וישבן עם כיסא כעוגן.',
    category: 'strength',
    difficulty: 'medium',
    createdAt: '2026-10-12',
    timesCompleted: 3,
    items: [item('chair-squat', 3, 15), item('jumping-in-place', 3, 5, 10), item('hip-flexor-stretch', 2, 10)],
  },
  {
    id: 'upper-body-challenge',
    title: 'אתגר כוח לפלג גוף עליון',
    description: 'סבב מרוכז של שכיבות סמיכה ודחיפות לחיזוק הידיים והחזה.',
    category: 'strength',
    difficulty: 'hard',
    createdAt: '2026-11-08',
    timesCompleted: 0,
    items: [item('wall-pushups', 3, 15), item('arm-raises', 3, 10), item('short-plank', 3, 10), item('standing-chest-opener', 1, 0)],
  },
  {
    id: 'lower-back-stretch',
    title: 'מתיחת גב תחתון',
    description: 'פורקת עומס מהגב אחרי ישיבה ממושכת.',
    category: 'flexibility',
    difficulty: 'easy',
    createdAt: '2026-09-18',
    timesCompleted: 6,
    items: [item('cat-cow', 2, 10), item('glute-bridge', 2, 10), item('seated-back-stretch', 1, 0)],
  },
  {
    id: 'office-hiit',
    title: 'אינטרוולים משרדיים',
    description: 'עשר דקות של פרצי מאמץ קצרים להעלאת האנרגיה.',
    category: 'cardio',
    difficulty: 'hard',
    createdAt: '2026-11-05',
    timesCompleted: 1,
    items: [item('jumping-in-place', 4, 10), item('high-knees', 4, 10), item('chair-squat', 4, 10, 20), item('march-in-place', 1, 0, 60)],
  },
  {
    id: 'posture-alignment',
    title: 'יישור יציבה',
    description: 'תרגילים קצרים ליישור הגב, האגן והראש.',
    category: 'posture',
    difficulty: 'medium',
    createdAt: '2026-10-05',
    timesCompleted: 4,
    items: [item('posture-reset', 2, 10), item('shoulder-rolls', 3, 8), item('cat-cow', 2, 5, 20), item('belly-breathing', 1, 0)],
  },
  {
    id: 'calming-breath',
    title: 'נשימה 4-7-8 לרגיעה',
    description: 'דפוס נשימה איטי שמרגיע את מערכת העצבים.',
    category: 'breathing',
    difficulty: 'easy',
    createdAt: '2026-08-25',
    timesCompleted: 11,
    items: [item('belly-breathing', 1, 5), item('breathing-478', 4, 6), item('shoulder-rolls', 1, 0, 30)],
  },
  {
    id: 'hips-glutes-stretch',
    title: 'מתיחת ירכיים וישבן',
    description: 'פתיחת האגן ושחרור שרירים מכווצים מישיבה.',
    category: 'flexibility',
    difficulty: 'medium',
    createdAt: '2026-10-30',
    timesCompleted: 0,
    items: [item('hip-flexor-stretch', 2, 10), item('glute-bridge', 3, 8, 25), item('seated-back-stretch', 2, 10, 35), item('cat-cow', 1, 0, 40)],
  },
  {
    id: 'chair-core',
    title: 'ליבה ליד הכיסא',
    description: 'חיזוק שרירי הבטן והגב התחתון בתנועות מבוקרות.',
    category: 'strength',
    difficulty: 'medium',
    createdAt: '2026-09-09',
    timesCompleted: 2,
    items: [item('short-plank', 3, 10), item('march-in-place', 3, 8, 25), item('glute-bridge', 3, 8, 25), item('seated-back-stretch', 1, 0, 30)],
  },
]
