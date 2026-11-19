/**
 * Pre-workout health check. The wording below is a working draft: the
 * questions and the disclaimer must be reviewed and approved by the client
 * (and legal / a medical professional) before launch.
 */

export interface HealthQuestion {
  id: string
  text: string
}

export const HEALTH_QUESTIONS: HealthQuestion[] = [
  {
    id: 'doctor',
    text: 'האם רופא אמר לך שיש לך בעיית לב, או שעליך להימנע מפעילות גופנית?',
  },
  {
    id: 'symptoms',
    text: 'האם את/ה חש/ה כאב בחזה, קוצר נשימה חריג או סחרחורת בזמן מאמץ?',
  },
  {
    id: 'pain',
    text: 'האם יש לך כאב או פציעה (גב, צוואר, מפרקים) שתנועה עלולה להחמיר?',
  },
  {
    id: 'condition',
    text: 'האם את/ה בהיריון, אחרי ניתוח לאחרונה, או נוטל/ת תרופות שמשפיעות על מאמץ?',
  },
]

export const SAFETY_REMINDERS: string[] = [
  'הפסק/י מיד אם מופיע כאב בחזה, קוצר נשימה או סחרחורת.',
  'האפליקציה אינה תחליף לייעוץ רפואי. האחריות על ביצוע האימון היא שלך.',
  'כדאי לשתות מים לפני האימון ואחריו.',
]

/**
 * When to ask. For now: before every workout, so the screen is easy to
 * review. Refine here later (for example once per period) without touching
 * the screens.
 */
export function needsQuestionnaire(): boolean {
  return true
}
