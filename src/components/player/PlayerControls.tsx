import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/ui/button'
import { MusicPlayer } from '@/components/music/MusicPlayer'
import type { MusicPlayer as MusicPlayerState } from '@/components/music/useMusicPlayer'
import { SpeedControl } from './SpeedControl'

interface PlayerControlsProps {
  playing: boolean
  onTogglePlay: () => void
  onNext: () => void
  onPrevious: () => void
  rate: number
  onRateChange: (rate: number) => void
  music: MusicPlayerState
}

export function PlayerControls({
  playing,
  onTogglePlay,
  onNext,
  onPrevious,
  rate,
  onRateChange,
  music,
}: PlayerControlsProps) {
  return (
    <Card className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 p-3 md:p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="השלב הקודם" onClick={onPrevious}>
          <SkipBack className="rtl:-scale-x-100" />
        </Button>
        <Button
          variant="brand"
          size="icon-lg"
          aria-label={playing ? 'השהיה' : 'המשך'}
          onClick={onTogglePlay}
        >
          {playing ? <Pause className="size-6" /> : <Play className="size-6" />}
        </Button>
        <Button variant="ghost" size="icon" aria-label="השלב הבא" onClick={onNext}>
          <SkipForward className="rtl:-scale-x-100" />
        </Button>
      </div>
      <SpeedControl value={rate} onChange={onRateChange} />
      <MusicPlayer music={music} />
    </Card>
  )
}
