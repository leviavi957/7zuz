// DEMO ONLY — "Preview as company". To remove: delete src/components/demo/
// and the <BrandPreview /> usage in layout/TopBar.tsx.
import { Palette } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import './brand-presets.css'

const PRESETS = [
  { id: 'default', label: 'ברירת מחדל (שמפניה)' },
  { id: 'violet', label: 'סגול' },
  { id: 'red', label: 'אדום' },
  { id: 'teal', label: 'טורקיז' },
  { id: 'orange', label: 'כתום' },
] as const

type PresetId = (typeof PRESETS)[number]['id']

function applyPreset(id: PresetId) {
  const root = document.documentElement
  if (id === 'default') root.removeAttribute('data-brand')
  else root.setAttribute('data-brand', id)
}

export function BrandPreview() {
  const [active, setActive] = useState<PresetId>('default')

  const choose = (id: PresetId) => {
    setActive(id)
    applyPreset(id)
  }

  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" size="icon" aria-label="תצוגה כחברה (דמו)" />}
      >
        <Palette />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">תצוגה כחברה</span>
          <Badge variant="danger">דמו בלבד</Badge>
        </div>
        <p className="text-muted-foreground">מחליף את צבע המותג (--brand) בזמן אמת.</p>
        <div role="radiogroup" aria-label="צבע מותג" className="flex flex-col gap-1">
          {PRESETS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active === id}
              onClick={() => choose(id)}
              className={cn(
                'flex min-h-11 items-center gap-3 rounded-xl px-2 text-start text-base hover:bg-accent',
                active === id && 'bg-secondary font-medium',
              )}
            >
              <SwatchDot id={id} />
              {label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** Shows the preset's own --brand by scoping the attribute to the dot. */
function SwatchDot({ id }: { id: PresetId }) {
  return (
    <span
      aria-hidden="true"
      data-brand-dot={id}
      className="size-5 rounded-full bg-brand ring-1 ring-border"
    />
  )
}
