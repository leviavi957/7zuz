/**
 * Short rest-screen lines. Trainers can edit this list freely.
 * Keep them kind, office-friendly, and free of body or performance jokes.
 */

export const REST_LINES = [
  'לגימה של מים? הגוף יגיד תודה.',
  'הכתפיים מבקשות רגע של שחרור.',
  'מותח את הצוואר בעדינות — ימינה, שמאלה.',
  'הכיסא מתגעגע אליכם. עוד רגע חוזרים.',
  'נשימה אחת איטית פנימה, ואחת החוצה.',
  'מניחים את הידיים רגע בצד. הן עבדו מספיק.',
  'מבט רחוק מהמסך — גם לעיניים מגיע הפסקה.',
  'כתף אחת למעלה, כתף שנייה. לאט לאט.',
  'עוד כמה שניות של שקט לפני הסט הבא.',
  'אפשר לחייך לעצמכם. זה גם נחשב מתיחה.',
  'גב ישר, רגליים על הרצפה — מוכנים להמשך.',
  'המים על השולחן מחכים. לגימה קטנה לא תזיק.',
  'שחרור קטן של האגרופים. אצבעות פתוחות.',
  'אוויר נקי פנימה. אתם עושים את זה יפה.',
] as const

export type RestLine = (typeof REST_LINES)[number]

/** Picks a line at random. Optional seed index for stable tests. */
export function pickRestLine(random = Math.random): RestLine {
  const index = Math.floor(random() * REST_LINES.length) % REST_LINES.length
  return REST_LINES[index]
}
