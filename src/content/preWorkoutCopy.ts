/**
 * All wording for the pre-workout health questionnaire and the liability
 * declaration lives in this file.
 *
 * DRAFT: PENDING LEGAL APPROVAL. Every line below must be reviewed and
 * approved by the client, legal counsel and a medical professional before
 * launch. When the approved text changes in substance, raise
 * `QUESTIONNAIRE_VERSION` in `src/lib/preWorkout.ts` so that everyone is asked
 * to accept it again.
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

export const PRE_WORKOUT_COPY = {
  title: 'לפני שמתחילים',
  intro: 'ארבע שאלות קצרות על איך שאת/ה מרגיש/ה היום.',
  concernNotice:
    'ענית "כן" על שאלה אחת או יותר. מומלץ להתייעץ עם רופא לפני שמתחילים. אם בכל זאת ממשיכים, עושים זאת באחריותך ועוצרים ברגע שמרגישים לא טוב.',
  safetyReminders: [
    'הפסק/י מיד אם מופיע כאב בחזה, קוצר נשימה או סחרחורת.',
    'האפליקציה אינה תחליף לייעוץ רפואי. האחריות על ביצוע האימון היא שלך.',
    'כדאי לשתות מים לפני האימון ואחריו.',
  ],
  declaration: 'קראתי והבנתי. אני מתחיל/ה את האימון באחריותי.',
  confirm: 'אישור והתחלת אימון',
  saving: 'שומר…',
  cancel: 'ביטול',
  /** Short line shown under the start button on the workout detail screen. */
  startBarSafetyLine:
    'האימון מתאים למי שמילא את שאלון הבריאות. במקרה של כאב או סחרחורת, הפסק.',
} as const
