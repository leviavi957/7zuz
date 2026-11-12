export type WorkoutCategory = 'strength' | 'flexibility' | 'cardio' | 'posture' | 'breathing'
export type WorkoutDifficulty = 'easy' | 'medium' | 'hard'

export interface Workout {
  id: string
  title: string
  description: string
  category: WorkoutCategory
  difficulty: WorkoutDifficulty
  durationMinutes: number
  /** ISO date. */
  createdAt: string
  timesCompleted: number
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

export const WORKOUTS: Workout[] = [
  {
    id: 'neck-shoulders-release',
    title: 'שחרור צוואר וכתפיים',
    description: 'שחרור מתח מהצוואר והכתפיים אחרי שעות מול המסך.',
    category: 'posture',
    difficulty: 'easy',
    durationMinutes: 3,
    createdAt: '2026-11-02',
    timesCompleted: 5,
  },
  {
    id: 'chest-opener',
    title: 'פתיחת בית החזה',
    description: 'מתיחות עדינות שמחזירות רוחב לחזה ולכתפיים.',
    category: 'flexibility',
    difficulty: 'easy',
    durationMinutes: 4,
    createdAt: '2026-10-20',
    timesCompleted: 2,
  },
  {
    id: 'box-breathing',
    title: 'נשימת קופסה',
    description: 'ארבע נשימות מדודות להורדת קצב ולחזרה לריכוז.',
    category: 'breathing',
    difficulty: 'easy',
    durationMinutes: 3,
    createdAt: '2026-10-28',
    timesCompleted: 8,
  },
  {
    id: 'energizing-march',
    title: 'צעדה ממריצה במקום',
    description: 'הרמת דופק קלה בלי לעזוב את הפינה שלכם.',
    category: 'cardio',
    difficulty: 'easy',
    durationMinutes: 5,
    createdAt: '2026-09-30',
    timesCompleted: 0,
  },
  {
    id: 'desk-squats',
    title: 'סקוואטים ליד השולחן',
    description: 'חיזוק רגליים וישבן עם כיסא כעוגן.',
    category: 'strength',
    difficulty: 'medium',
    durationMinutes: 6,
    createdAt: '2026-10-12',
    timesCompleted: 3,
  },
  {
    id: 'upper-body-challenge',
    title: 'אתגר כוח לפלג גוף עליון',
    description: 'סבב מרוכז של שכיבות סמיכה ודחיפות לחיזוק הידיים והחזה.',
    category: 'strength',
    difficulty: 'hard',
    durationMinutes: 8,
    createdAt: '2026-11-08',
    timesCompleted: 0,
  },
  {
    id: 'lower-back-stretch',
    title: 'מתיחת גב תחתון',
    description: 'פורקת עומס מהגב אחרי ישיבה ממושכת.',
    category: 'flexibility',
    difficulty: 'easy',
    durationMinutes: 5,
    createdAt: '2026-09-18',
    timesCompleted: 6,
  },
  {
    id: 'office-hiit',
    title: 'אינטרוולים משרדיים',
    description: 'עשר דקות של פרצי מאמץ קצרים להעלאת האנרגיה.',
    category: 'cardio',
    difficulty: 'hard',
    durationMinutes: 10,
    createdAt: '2026-11-05',
    timesCompleted: 1,
  },
  {
    id: 'posture-alignment',
    title: 'יישור יציבה',
    description: 'תרגילים קצרים ליישור הגב, האגן והראש.',
    category: 'posture',
    difficulty: 'medium',
    durationMinutes: 6,
    createdAt: '2026-10-05',
    timesCompleted: 4,
  },
  {
    id: 'calming-breath',
    title: 'נשימה 4-7-8 לרגיעה',
    description: 'דפוס נשימה איטי שמרגיע את מערכת העצבים.',
    category: 'breathing',
    difficulty: 'easy',
    durationMinutes: 5,
    createdAt: '2026-08-25',
    timesCompleted: 11,
  },
  {
    id: 'hips-glutes-stretch',
    title: 'מתיחת ירכיים וישבן',
    description: 'פתיחת האגן ושחרור שרירים מכווצים מישיבה.',
    category: 'flexibility',
    difficulty: 'medium',
    durationMinutes: 7,
    createdAt: '2026-10-30',
    timesCompleted: 0,
  },
  {
    id: 'chair-core',
    title: 'ליבה ליד הכיסא',
    description: 'חיזוק שרירי הבטן והגב התחתון בתנועות מבוקרות.',
    category: 'strength',
    difficulty: 'medium',
    durationMinutes: 7,
    createdAt: '2026-09-09',
    timesCompleted: 2,
  },
]
