import type { Exercise } from '@/lib/workoutTimeline'

/**
 * Exercise library (mock). Each exercise is a silent clip of an avatar
 * performing it. In production `videoSrc` / `posterSrc` will be public URLs
 * from a storage bucket (for example `https://<bucket>/videos/<id>.mp4` and
 * `.../posters/<id>.jpg`); until real clips exist they stay empty and the
 * player shows its animated placeholder.
 */
export const EXERCISES: Exercise[] = [
  {
    id: 'jumping-in-place',
    name: 'קפיצות במקום',
    description: 'קפיצות קלות על קצות האצבעות להעלאת הדופק.',
    category: 'cardio',
    videoSrc: '/videos/FILE1.mp4',
    defaultDurationSeconds: 20,
  },
  {
    id: 'march-in-place',
    name: 'צעידה במקום',
    description: 'צעידה נמרצת עם הרמת ברכיים ותנועת ידיים.',
    category: 'cardio',
    defaultDurationSeconds: 30,
  },
  {
    id: 'high-knees',
    name: 'ריצה במקום עם ברכיים גבוהות',
    description: 'ריצה במקום עם הרמת ברכיים עד גובה המותניים.',
    category: 'cardio',
    defaultDurationSeconds: 20,
  },
  {
    id: 'arm-raises',
    name: 'הרמות ידיים',
    description: 'הרמת הידיים לצדדים ומעלה, בתנועה איטית ומבוקרת.',
    category: 'strength',
    videoSrc: '/videos/FILE2.mp4',
    defaultDurationSeconds: 20,
  },
  {
    id: 'wall-pushups',
    name: 'שכיבות סמיכה על הקיר',
    description: 'דחיפה מהקיר לחיזוק החזה, הכתפיים והידיים.',
    category: 'strength',
    defaultDurationSeconds: 30,
  },
  {
    id: 'chair-squat',
    name: 'סקוואט עם כיסא',
    description: 'ישיבה והתרוממות מהכיסא לחיזוק הרגליים והישבן.',
    category: 'strength',
    defaultDurationSeconds: 30,
  },
  {
    id: 'glute-bridge',
    name: 'גשר',
    description: 'הרמת האגן בשכיבה לחיזוק הישבן והגב התחתון.',
    category: 'strength',
    defaultDurationSeconds: 30,
  },
  {
    id: 'short-plank',
    name: 'פלאנק קצר',
    description: 'החזקת גוף ישר על האמות לחיזוק שרירי הליבה.',
    category: 'strength',
    defaultDurationSeconds: 20,
  },
  {
    id: 'neck-side-stretch',
    name: 'מתיחת צוואר לצדדים',
    description: 'הטיית הראש לכל צד בעדינות, בלי למשוך.',
    category: 'posture',
    defaultDurationSeconds: 20,
  },
  {
    id: 'shoulder-rolls',
    name: 'גלגול כתפיים',
    description: 'גלגול הכתפיים לאחור בתנועות רחבות ואיטיות.',
    category: 'posture',
    defaultDurationSeconds: 20,
  },
  {
    id: 'posture-reset',
    name: 'יישור גב בעמידה',
    description: 'עמידה צמודה לקיר ויישור הגב, האגן והראש.',
    category: 'posture',
    defaultDurationSeconds: 30,
  },
  {
    id: 'standing-chest-opener',
    name: 'פתיחת חזה בעמידה',
    description: 'ידיים משולבות מאחור ופתיחת בית החזה.',
    category: 'flexibility',
    defaultDurationSeconds: 30,
  },
  {
    id: 'cat-cow',
    name: 'חתול-פרה',
    description: 'קימור ועיגול של עמוד השדרה בתנועה זורמת.',
    category: 'flexibility',
    defaultDurationSeconds: 30,
  },
  {
    id: 'hip-flexor-stretch',
    name: 'מתיחת ירך קדמית',
    description: 'מתיחה בצעד קדימה לשחרור שרירי הירך מישיבה.',
    category: 'flexibility',
    defaultDurationSeconds: 30,
  },
  {
    id: 'seated-back-stretch',
    name: 'מתיחת גב תחתון בישיבה',
    description: 'התכופפות קדימה בישיבה לשחרור הגב התחתון.',
    category: 'flexibility',
    defaultDurationSeconds: 40,
  },
  {
    id: 'belly-breathing',
    name: 'נשימת בטן עמוקה',
    description: 'נשימה איטית אל הבטן, עם יד על הצלעות.',
    category: 'breathing',
    defaultDurationSeconds: 30,
  },
  {
    id: 'box-breathing',
    name: 'נשימת קופסה',
    description: 'שאיפה, עצירה, נשיפה ועצירה, ארבע שניות כל אחת.',
    category: 'breathing',
    defaultDurationSeconds: 16,
  },
  {
    id: 'breathing-478',
    name: 'נשימת 4-7-8',
    description: 'שאיפה של 4, עצירה של 7 ונשיפה של 8 להרגעה.',
    category: 'breathing',
    defaultDurationSeconds: 19,
  },
]

const BY_ID = new Map(EXERCISES.map((exercise) => [exercise.id, exercise]))

export function getExercise(id: string): Exercise | undefined {
  return BY_ID.get(id)
}
