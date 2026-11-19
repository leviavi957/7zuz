import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export interface VideoSurfaceProps {
  /** Clip URL. Without it, a calm animated placeholder is shown instead. */
  src?: string
  /** Still shown until the clip has frames. */
  posterSrc?: string
  /** Clip of the following step, preloaded while this one plays. */
  nextSrc?: string
  playbackRate: number
  paused: boolean
  onWaiting?: () => void
  onPlaying?: () => void
  /** Round the clip's frame (off in fullscreen, where the clip is shown edge to edge). */
  rounded?: boolean
  className?: string
}

function Placeholder({
  playbackRate,
  paused,
  rounded,
}: Pick<VideoSurfaceProps, 'playbackRate' | 'paused' | 'rounded'>) {
  const style = { '--stage-rate': playbackRate } as CSSProperties
  const playState: CSSProperties = { animationPlayState: paused ? 'paused' : 'running' }

  return (
    <div
      aria-hidden="true"
      className={cn('relative size-full overflow-hidden bg-secondary', rounded && 'rounded-3xl')}
      style={style}
    >
      <div
        className="stage-drift absolute -top-1/4 -start-1/4 size-[70vmax] rounded-full bg-sage-ink/15"
        style={playState}
      />
      <div
        className="stage-drift absolute -bottom-1/3 -end-1/4 size-[60vmax] rounded-full bg-brand/20 [--stage-duration:18s]"
        style={playState}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="stage-breathe absolute size-[46vmin] rounded-full border-2 border-primary/20"
          style={playState}
        />
        <div
          className="stage-breathe absolute size-[32vmin] rounded-full bg-primary/10 [--stage-duration:7s]"
          style={playState}
        />
        <div
          className="stage-breathe absolute size-[14vmin] rounded-full bg-brand/60 [--stage-duration:5s]"
          style={playState}
        />
      </div>
    </div>
  )
}

type Slots = readonly [string | undefined, string | undefined]
interface SlotState {
  slots: Slots
  active: 0 | 1
}

/**
 * Two video slots: one plays the current clip while the other preloads the
 * next one, so a step change is a swap instead of a reload.
 */
function nextSlotState(state: SlotState, src?: string, nextSrc?: string): SlotState {
  let active = state.active
  const slots: [string | undefined, string | undefined] = [...state.slots]

  if (src && slots[active] !== src) {
    active = active === 0 ? 1 : 0
    if (slots[active] !== src) slots[active] = src
  }
  slots[active === 0 ? 1 : 0] = nextSrc === slots[active] ? undefined : nextSrc

  const unchanged =
    active === state.active && slots[0] === state.slots[0] && slots[1] === state.slots[1]
  return unchanged ? state : { slots, active }
}

function useVideoSlots(src?: string, nextSrc?: string): SlotState {
  const [state, setState] = useState<SlotState>({ slots: [undefined, undefined], active: 0 })
  const next = nextSlotState(state, src, nextSrc)
  if (next !== state) setState(next)
  return next
}

interface SlotVideoProps
  extends Pick<VideoSurfaceProps, 'playbackRate' | 'paused' | 'onWaiting' | 'onPlaying'> {
  src: string
  active: boolean
  onRatio: (src: string, ratio: number) => void
}

function SlotVideo({
  src,
  active,
  playbackRate,
  paused,
  onWaiting,
  onPlaying,
  onRatio,
}: SlotVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.playbackRate = playbackRate
  }, [playbackRate, src])

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (active && !paused) void video.play().catch(() => undefined)
    else video.pause()
  }, [active, paused, src])

  // A clip that just became the stand-by one starts from its first frame.
  useEffect(() => {
    if (!active && ref.current) ref.current.currentTime = 0
  }, [active])

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      onLoadedMetadata={(event) => {
        const { videoWidth, videoHeight } = event.currentTarget
        if (videoWidth && videoHeight) onRatio(src, videoWidth / videoHeight)
      }}
      // Only the visible clip may report buffering.
      onWaiting={active ? onWaiting : undefined}
      onPlaying={active ? onPlaying : undefined}
      className={cn('absolute inset-0 size-full object-contain', !active && 'invisible')}
    />
  )
}

/** Shown until a clip reports its real size, so the layout does not jump. */
const DEFAULT_RATIO = 16 / 9

/**
 * The player's stage. The clip loops until the step ends (the player cuts it
 * by changing `src`); with no `src` the animated placeholder is shown.
 *
 * The clip is never cropped: its frame takes the clip's real aspect ratio and
 * is the largest one that fits the stage, centered. Space beside it stays
 * transparent so the screen's background shows through.
 */
export function VideoSurface({
  src,
  posterSrc,
  nextSrc,
  playbackRate,
  paused,
  onWaiting,
  onPlaying,
  rounded,
  className,
}: VideoSurfaceProps) {
  const { slots, active } = useVideoSlots(src, nextSrc)
  const [ratios, setRatios] = useState<Record<string, number>>({})
  const ratio = (src && ratios[src]) || DEFAULT_RATIO

  const onRatio = useCallback(
    (clip: string, value: number) =>
      setRatios((known) => (known[clip] === value ? known : { ...known, [clip]: value })),
    [],
  )

  // Without a clip nothing can stall, so clear any buffering left by the last one.
  useEffect(() => {
    if (!src) onPlaying?.()
  }, [src, onPlaying])

  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center [container-type:size]',
        className,
      )}
    >
      {src ? null : (
        <div className="absolute inset-0">
          <Placeholder playbackRate={playbackRate} paused={paused} rounded={rounded} />
        </div>
      )}
      <div
        style={{ aspectRatio: ratio, width: `min(100cqw, ${ratio} * 100cqh)` }}
        className={cn(
          'relative shrink-0 overflow-hidden bg-secondary transition-[width] duration-(--motion-slow) ease-calm',
          rounded && 'rounded-3xl',
          !src && 'invisible',
        )}
      >
        {src && posterSrc ? (
          <img src={posterSrc} alt="" className="absolute inset-0 size-full object-contain" />
        ) : null}
        {slots.map((slotSrc, i) =>
          slotSrc ? (
            <SlotVideo
              key={i}
              src={slotSrc}
              active={Boolean(src) && i === active}
              playbackRate={playbackRate}
              paused={paused}
              onWaiting={onWaiting}
              onPlaying={onPlaying}
              onRatio={onRatio}
            />
          ) : null,
        )}
      </div>
    </div>
  )
}