import { Maximize, Minimize, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMusicPlayer } from '@/components/music/useMusicPlayer'
import { BackgroundShapes } from '@/components/shared/BackgroundShapes'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAutoHide } from '@/hooks/useAutoHide'
import { useDebouncedFlag } from '@/hooks/useDebouncedFlag'
import { useFullscreen } from '@/hooks/useFullscreen'
import { findNextWorkStep, formatSeconds } from '@/lib/workoutTimeline'
import { getWorkoutSteps } from '@/mocks/workoutSteps'
import type { Workout } from '@/mocks/workouts'
import { BufferingOverlay } from './BufferingOverlay'
import { ExitDialog } from './ExitDialog'
import { IdleFade } from './IdleFade'
import { PlayerControls } from './PlayerControls'
import { PlayerHud } from './PlayerHud'
import { usePlayerShortcuts } from './usePlayerShortcuts'
import { useWorkoutPlayback } from './useWorkoutPlayback'
import { VideoSurface } from './VideoSurface'

const HIDE_AFTER_MS = 3000
const BUFFERING_DELAY_MS = 450
const BUFFERING_PREVIEW_MS = 4000

export function WorkoutPlayer({ workout }: { workout: Workout }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const previewBuffering = params.get('state') === 'buffering'

  const rootRef = useRef<HTMLDivElement>(null)
  const steps = useMemo(() => getWorkoutSteps(workout), [workout])

  const [paused, setPaused] = useState(false)
  const [rate, setRate] = useState(1)
  const [exitOpen, setExitOpen] = useState(false)
  const [videoWaiting, setVideoWaiting] = useState(false)
  const [previewStall, setPreviewStall] = useState(previewBuffering)
  const showBuffering = useDebouncedFlag(videoWaiting || previewStall, BUFFERING_DELAY_MS)

  // ?state=buffering simulates a short network stall.
  useEffect(() => {
    if (!previewBuffering) return
    const id = setTimeout(() => setPreviewStall(false), BUFFERING_PREVIEW_MS)
    return () => clearTimeout(id)
  }, [previewBuffering])

  const goToFeedback = useCallback(
    (completion: number) =>
      navigate(`/workouts/${workout.id}/feedback?completion=${completion}`, { replace: true }),
    [navigate, workout.id],
  )
  const finish = useCallback(() => goToFeedback(100), [goToFeedback])

  // The video must keep playing while buffering, or `playing` would never fire.
  const videoPaused = paused || exitOpen
  const running = !videoPaused && !(videoWaiting || previewStall)
  const music = useMusicPlayer({ src: workout.musicSrc, playing: !videoPaused })
  const playback = useWorkoutPlayback({ steps, rate, running, onFinish: finish })
  const { step } = playback
  const upNext = step.kind === 'work' ? findNextWorkStep(steps, playback.index) : undefined

  const onWaiting = useCallback(() => setVideoWaiting(true), [])
  const onPlaying = useCallback(() => setVideoWaiting(false), [])

  const controls = useAutoHide(HIDE_AFTER_MS, exitOpen)
  const fullscreen = useFullscreen(rootRef)

  const togglePlay = useCallback(() => setPaused((value) => !value), [])
  const openExit = useCallback(() => setExitOpen(true), [])

  usePlayerShortcuts(
    {
      togglePlay,
      next: playback.next,
      previous: playback.previous,
      toggleFullscreen: fullscreen.supported ? fullscreen.toggle : undefined,
      openExit,
      onActivity: controls.reveal,
    },
    !exitOpen,
  )

  // The clip is never cropped and never covered: the header, stage and
  // controls each get their own area (controls move beside the stage on short
  // wide screens). Fullscreen only drops the roomy padding and the rounded frame.
  const fs = fullscreen.isFullscreen

  return (
    <div
      ref={rootRef}
      onPointerMove={controls.reveal}
      className={cn(
        'fixed inset-0 z-50 isolate grid grid-rows-[auto_minmax(0,1fr)_auto] gap-3 overflow-hidden bg-background p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] text-foreground landscape:min-[40rem]:grid-cols-[minmax(0,1fr)_22rem] landscape:min-[40rem]:grid-rows-[auto_minmax(0,1fr)]',
        !fs && 'md:p-6',
      )}
    >
      <BackgroundShapes />

      {/* One tap on the stage toggles the controls. */}
      <div onClick={controls.toggle} className="relative col-start-1 row-start-2 min-h-0">
        <VideoSurface
          src={step.exercise.videoSrc}
          posterSrc={step.exercise.posterSrc}
          nextSrc={steps[playback.index + 1]?.exercise.videoSrc}
          playbackRate={rate}
          paused={videoPaused}
          onWaiting={onWaiting}
          onPlaying={onPlaying}
          rounded={!fs}
        />
      </div>

      <ProgressBar
        compact
        label="התקדמות באימון"
        valueText={`${playback.completion}%`}
        value={Math.round(playback.overallElapsed)}
        max={Math.round(playback.total)}
        className="absolute inset-x-0 top-0 z-10"
      />

      <IdleFade
        visible={controls.visible}
        className="col-start-1 row-start-1 flex items-center justify-between gap-2"
      >
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="secondary" size="icon" aria-label="יציאה מהאימון" onClick={openExit}>
            <X />
          </Button>
          <p className="truncate rounded-full bg-card px-4 py-2 text-sm font-medium shadow-soft">
            {workout.title}
          </p>
        </div>
        {fullscreen.supported ? (
          <Button
            variant="secondary"
            size="icon"
            aria-label={fs ? 'יציאה ממסך מלא' : 'מסך מלא'}
            onClick={fullscreen.toggle}
          >
            {fs ? <Minimize /> : <Maximize />}
          </Button>
        ) : null}
      </IdleFade>

      <div className="col-start-1 row-start-3 flex min-h-0 flex-col gap-3 landscape:min-[40rem]:col-start-2 landscape:min-[40rem]:row-span-2 landscape:min-[40rem]:row-start-1 landscape:min-[40rem]:justify-end">
        <PlayerHud
          step={step}
          remainingSeconds={playback.remainingSeconds}
          itemCount={workout.items.length}
          paused={paused}
        />
        <IdleFade visible={controls.visible} className="flex flex-col gap-2">
          {upNext ? (
            <p className="self-start rounded-full bg-card px-4 py-2 text-sm shadow-soft">
              הבא: <span className="font-medium">{upNext.exercise.name}</span> ·{' '}
              {formatSeconds(upNext.durationSeconds)}
            </p>
          ) : null}
          <PlayerControls
            playing={!paused}
            onTogglePlay={togglePlay}
            onNext={playback.next}
            onPrevious={playback.previous}
            rate={rate}
            onRateChange={setRate}
            music={music}
          />
        </IdleFade>
      </div>

      {showBuffering ? <BufferingOverlay /> : null}
      {exitOpen ? (
        <ExitDialog
          completion={playback.completion}
          onCancel={() => setExitOpen(false)}
          onConfirm={() => goToFeedback(playback.completion)}
        />
      ) : null}
    </div>
  )
}
