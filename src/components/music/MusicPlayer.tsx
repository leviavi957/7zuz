import { Music, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { MusicPlayer as MusicPlayerState } from './useMusicPlayer'

const UNAVAILABLE_HINT = 'מוזיקת הרקע לא זמינה כרגע'

/** Music toggle and volume slider, driven by `useMusicPlayer`. */
export function MusicPlayer({ music }: { music: MusicPlayerState }) {
  const { available, enabled, volume, toggle, setVolume } = music
  const on = available && enabled

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={on ? 'secondary' : 'ghost'}
        size="icon"
        aria-pressed={on}
        aria-disabled={!available}
        aria-label={available ? 'מוזיקת רקע' : `מוזיקת רקע. ${UNAVAILABLE_HINT}`}
        title={available ? undefined : UNAVAILABLE_HINT}
        className={cn(!available && 'opacity-50')}
        onClick={available ? toggle : undefined}
      >
        {on ? <Music /> : <VolumeX />}
      </Button>
      <div className="flex h-11 items-center">
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          disabled={!on}
          aria-label="עוצמת מוזיקה"
          onChange={(event) => setVolume(Number(event.target.value))}
          className="w-24 accent-brand-graphic disabled:opacity-50"
        />
      </div>
    </div>
  )
}
