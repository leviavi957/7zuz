/**
 * PROMIS quality-of-life questionnaire wording.
 *
 * DRAFT: PENDING LEGAL / CLINICAL APPROVAL. Inspired by short PROMIS Global
 * items, but not a validated instrument. Replace with the client's approved
 * Hebrew items before launch.
 */

export interface PromisQuestion {
  id: string
  text: string
}

/** Rating 1 (worst) to 5 (best). Same labels for every question. */
export const PROMIS_SCALE: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { value: 1, label: 'גרוע מאוד' },
  { value: 2, label: 'גרוע' },
  { value: 3, label: 'בינוני' },
  { value: 4, label: 'טוב' },
  { value: 5, label: 'מצוין' },
]

export const PROMIS_QUESTIONS: PromisQuestion[] = [
  {
    id: 'physical',
    text: 'בשבוע האחרון, איך היית מדרג/ת את הבריאות הגופנית שלך?',
  },
  {
    id: 'mental',
    text: 'בשבוע האחרון, איך היית מדרג/ת את הבריאות הנפשית שלך?',
  },
  {
    id: 'fatigue',
    text: 'בשבוע האחרון, איך היית מדרג/ת את רמת העייפות שלך? (1 = עייפות קשה, 5 = ללא עייפות)',
  },
  {
    id: 'social',
    text: 'בשבוע האחרון, עד כמה היית מרוצה מהפעילויות החברתיות שלך?',
  },
  {
    id: 'overall',
    text: 'בשבוע האחרון, איך היית מדרג/ת את איכות החיים שלך בכלל?',
  },
]

export const PROMIS_COPY = {
  title: 'איכות חיים',
  intro: 'חמש שאלות קצרות על השבוע האחרון. אין תשובה נכונה או לא נכונה.',
  next: 'השאלה הבאה',
  back: 'הקודמת',
  submit: 'שליחה',
  saving: 'שומר…',
  skip: 'דלג, אמלא מאוחר יותר',
  progress: (current: number, total: number) => `שאלה ${current} מתוך ${total}`,
} as const
