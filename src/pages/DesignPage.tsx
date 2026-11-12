import { Bell, Dumbbell, Play, RotateCw } from 'lucide-react'
import { useState } from 'react'
import { Badge, type BadgeVariant } from '@/components/shared/Badge'
import { Card, CardHeader } from '@/components/shared/Card'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Heatmap } from '@/components/shared/Heatmap'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { ProgressRing } from '@/components/shared/ProgressRing'
import { Skeleton } from '@/components/shared/Skeleton'
import { StretchIllustration } from '@/components/shared/StretchIllustration'
import { TodayProgress } from '@/components/shared/TodayProgress'
import { Button } from '@/components/ui/button'
import { HOME_DATA } from '@/mocks/home'
import { Label, ModePair, Section } from './design/DesignLayout'

const COLOR_TOKENS = [
  'background', 'card', 'primary', 'secondary', 'muted', 'accent', 'border', 'destructive',
  'sage', 'sage-ink', 'brand', 'brand-solid', 'brand-graphic', 'brand-ink', 'brand-soft', 'track',
  'heat-0', 'heat-1', 'heat-2', 'heat-3', 'heat-4',
]

const RADII = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
}
const BADGES: { variant: BadgeVariant; label: string }[] = [
  { variant: 'neutral', label: 'ניטרלי' },
  { variant: 'brand', label: 'מותג' },
  { variant: 'solid', label: 'מותג מלא' },
  { variant: 'sage', label: 'הצלחה' },
  { variant: 'danger', label: 'שגיאה' },
]
const BUTTON_VARIANTS = ['default', 'brand', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const
const BUTTON_LABELS: Record<(typeof BUTTON_VARIANTS)[number], string> = {
  default: 'ראשי',
  brand: 'מותג',
  secondary: 'משני',
  outline: 'קו מתאר',
  ghost: 'שקוף',
  destructive: 'מחיקה',
  link: 'קישור',
}

function Swatch({ token }: { token: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-12 rounded-xl border" style={{ background: `var(--${token})` }} />
      <code className="text-xs text-muted-foreground" dir="ltr">
        --{token}
      </code>
    </div>
  )
}

function ColorSection() {
  return (
    <Section id="colors" title="צבעים" description="שנהב חם, פטרול עמוק כדיו וכפתור ראשי, מרווה כגוון תומך, ו-brand אחד כמבטא.">
      <ModePair>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {COLOR_TOKENS.map((token) => (
            <Swatch key={token} token={token} />
          ))}
        </div>
      </ModePair>
    </Section>
  )
}

function BrandSection() {
  return (
    <Section
      id="brand"
      title="צבע מותג ונגישות"
      description="משתנה אחד, --brand, מניע את כל המבטאים. הנגזרות מבטיחות ניגודיות AA לכל צבע חברה: brand-solid (רקע עם טקסט), brand-ink (טקסט), brand-graphic (טבעות, פסים, סימונים). נסו את 'תצוגה כחברה' בסרגל העליון."
    >
      <ModePair>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="brand">
            <Play />
            כפתור מותג
          </Button>
          <Badge variant="solid">מותג מלא</Badge>
          <Badge variant="brand">מותג רך</Badge>
          <span className="font-medium text-brand-ink">טקסט במותג (brand-ink)</span>
        </div>
        <ProgressBar label="בר במותג (brand-graphic)" valueText="60%" value={6} max={10} />
      </ModePair>
    </Section>
  )
}

function TypographySection() {
  return (
    <Section id="type" title="טיפוגרפיה" description="Sora למספרים וכותרות לטיניות, Rubik לכותרות בעברית, Heebo לטקסט רץ. מספרים גדולים עם ריווח הדוק, ושורות נוחות לעברית.">
      <Card className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>מספרים (Sora, numeral)</Label>
          <p className="numeral text-8xl">128</p>
          <p className="numeral text-5xl text-muted-foreground">3/5</p>
        </div>
        <div className="flex flex-col gap-2">
          <Label>כותרות (Sora + Rubik)</Label>
          <h1 className="text-4xl">Heading 1 · כותרת ראשית</h1>
          <h2 className="text-2xl">Heading 2 · כותרת משנית</h2>
          <h3 className="text-lg">Heading 3 · כותרת קטנה</h3>
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label>טקסט רץ (Heebo, גובה שורה 1.7)</Label>
          <p className="max-w-prose">
            תנועה קצרה באמצע יום העבודה משפרת ריכוז, מצב רוח ואנרגיה. שתי דקות של מתיחות, נשימה
            ותרגילים פשוטים מספיקות כדי להרגיש את ההבדל.
          </p>
          <p className="text-sm text-muted-foreground">טקסט משני קטן להסברים ולכיתובים.</p>
        </div>
      </Card>
    </Section>
  )
}

function ShapeSection() {
  return (
    <Section id="shape" title="רדיוס, צללים ותנועה" description="כל הערכים הם טוקנים: --radius, --elevation-1/2, --motion-*.">
      <Card className="flex flex-col gap-6">
        <div>
          <Label>רדיוס</Label>
          <div className="mt-2 flex flex-wrap gap-3">
            {Object.entries(RADII).map(([r, cls]) => (
              <div key={r} className="flex flex-col items-center gap-1.5">
                <div className={`size-16 border bg-secondary ${cls}`} />
                <code className="text-xs text-muted-foreground" dir="ltr">{r}</code>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label>צללים</Label>
          <div className="mt-2 flex gap-4">
            <div className="flex h-20 w-32 items-center justify-center rounded-2xl bg-card text-sm shadow-soft">shadow-soft</div>
            <div className="flex h-20 w-32 items-center justify-center rounded-2xl bg-card text-sm shadow-lift">shadow-lift</div>
          </div>
        </div>
        <div>
          <Label>תנועה</Label>
          <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2" dir="ltr">
            <li><code>--motion-fast</code> 150ms · hover, focus</li>
            <li><code>--motion-base</code> 200ms · צבעים, תפריטים</li>
            <li><code>--motion-slow</code> 250ms · סרגל צד, מעבר עמוד</li>
            <li><code>--motion-fill</code> 600ms · טבעות ופסים, פעם אחת</li>
          </ul>
          <p className="mt-2 text-sm text-muted-foreground">עם prefers-reduced-motion כל המעברים מתקצרים למינימום.</p>
        </div>
      </Card>
    </Section>
  )
}

function ButtonSection() {
  return (
    <Section id="buttons" title="כפתורים" description="גובה מינימלי 44px בכל הגדלים, מיקוד נראה (הקישו Tab).">
      <ModePair>
        <div className="flex flex-wrap gap-3">
          {BUTTON_VARIANTS.map((v) => (
            <Button key={v} variant={v}>{BUTTON_LABELS[v]}</Button>
          ))}
        </div>
        <Label>מושבת וגדלים</Label>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>מושבת</Button>
          <Button size="sm">קטן</Button>
          <Button size="lg">גדול</Button>
          <Button size="icon" variant="outline" aria-label="תזכורות"><Bell /></Button>
        </div>
      </ModePair>
      <Section id="badges" title="תגיות">
        <ModePair>
          <div className="flex flex-wrap gap-2">
            {BADGES.map(({ variant, label }) => (
              <Badge key={variant} variant={variant}>{label}</Badge>
            ))}
          </div>
        </ModePair>
      </Section>
    </Section>
  )
}

function ProgressSection() {
  const [run, setRun] = useState(0)

  return (
    <Section id="progress" title="התקדמות" description="אלמנט הגיבור. הטבעות והפסים נטענים באנימציה פעם אחת.">
      <div>
        <Button variant="outline" onClick={() => setRun((n) => n + 1)}>
          <RotateCw />
          הפעלת האנימציה מחדש
        </Button>
      </div>
      <div key={run} className="flex flex-col gap-4">
        <ModePair>
          <Label>טבעת: ריקה, באמצע, מלאה</Label>
          <div className="flex flex-wrap items-center gap-4">
            <ProgressRing value={0} max={5} label="אימונים (ריק)" className="w-40" />
            <ProgressRing value={3} max={5} label="אימונים" caption="אימונים השבוע" className="w-52" />
            <ProgressRing value={5} max={5} label="אימונים (מלא)" className="w-40" />
          </div>
          <Label>היום (מיני)</Label>
          <TodayProgress done={2} total={3} />
        </ModePair>
        <ModePair>
          <Label>פס יעד: ריק, חלקי, מלא</Label>
          <ProgressBar label="יעד חודשי" valueText="0 מתוך 20" value={0} max={20} />
          <ProgressBar label="יעד חודשי" valueText="12 מתוך 20" value={12} max={20} tone="primary" />
          <ProgressBar label="יעד חודשי" valueText="20 מתוך 20" value={20} max={20} tone="sage" />
          <Label>פס רצף (מקטעים)</Label>
          <ProgressBar label="רצף ימים" valueText="6 ימים ברצף" value={6} max={7} segments={7} />
          <ProgressBar label="רצף ימים" valueText="אין רצף עדיין" value={0} max={7} segments={7} />
        </ModePair>
      </div>
    </Section>
  )
}

function HeatmapSection() {
  return (
    <Section id="heatmap" title="מפת פעילות" description="12 שבועות, 4 רמות עצימות, והיום מודגש בצבע המותג. ימים עתידיים מקווקווים.">
      <ModePair>
        <Card>
          <Heatmap levels={HOME_DATA.heat} todayIndex={HOME_DATA.todayIndex} label="מפת פעילות של 12 שבועות" />
        </Card>
      </ModePair>
    </Section>
  )
}

function CardSection() {
  return (
    <Section id="cards" title="כרטיסים">
      <ModePair>
        <Card><CardHeader title="כרטיס רגיל" description="משטח ראשי" /></Card>
        <Card tone="sage"><CardHeader title="כרטיס מרווה" description="גוון תומך" /></Card>
        <Card tone="brand"><CardHeader title="כרטיס מותג" description="גוון רך של המבטא" /></Card>
      </ModePair>
    </Section>
  )
}

function StatesSection() {
  return (
    <Section id="states" title="מצבים: טעינה, ריק, שגיאה" description="כל מסך חייב את שלושתם. בדף הבית: ‎?state=loading‎, ‎?state=empty‎, ‎?state=error‎.">
      <ModePair>
        <Label>Skeleton</Label>
        <Card className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        </Card>
        <EmptyState icon={Dumbbell} title="אין עדיין אימונים" description="האימון הראשון שלכם יופיע כאן." action={<Button variant="brand">התחלת אימון</Button>} />
        <ErrorState onRetry={() => undefined} />
      </ModePair>
    </Section>
  )
}

function IllustrationSection() {
  return (
    <Section id="illustration" title="איור" description="קו אחיד של 2px, דיו ב-currentColor ומבטא אחד ב-brand. דקורטיבי בלבד (aria-hidden), מתאים לרוחב 120–320px.">
      <ModePair>
        <div className="flex flex-wrap items-end gap-6">
          <StretchIllustration className="w-30" />
          <StretchIllustration className="w-52" />
          <StretchIllustration className="w-80 max-w-full" />
        </div>
      </ModePair>
    </Section>
  )
}

export default function DesignPage() {
  return (
    <div className="flex flex-col gap-12">
      <p className="max-w-prose text-muted-foreground">
        תיעוד חי של מערכת העיצוב. כל הטוקנים נמצאים ב-<code dir="ltr">src/index.css</code>. כל רכיב מוצג במצב בהיר וכהה.
      </p>
      <ColorSection />
      <BrandSection />
      <TypographySection />
      <ShapeSection />
      <ButtonSection />
      <IllustrationSection />
      <ProgressSection />
      <HeatmapSection />
      <CardSection />
      <StatesSection />
    </div>
  )
}
