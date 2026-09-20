"use client"

import { useRef, useState } from "react"
import { VolumeX } from "lucide-react"

/**
 * Standalone autoplay welcome video for the Thank You page.
 * Autoplays muted (so mobile autoplay works); a large centered button invites
 * a tap for sound. On tap: restart from 0, unmute, play with sound, hide the
 * button, and reveal the native controls so the viewer can pause.
 * Self-contained — NOT part of the multi-video follow-up selector.
 */
export function AutoplaySoundVideo({ src, className = "" }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [soundOn, setSoundOn] = useState(false)

  const enableSound = () => {
    const v = ref.current
    if (!v) return
    v.currentTime = 0
    v.muted = false
    const p = v.play()
    if (p) p.catch(() => {})
    setSoundOn(true)
  }

  return (
    <div
      className={`relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-black shadow-lg ${className}`}
    >
      <video
        ref={ref}
        src={`${src}#t=0.1`}
        autoPlay
        muted
        playsInline
        preload="metadata"
        controls={soundOn}
        className="block aspect-[9/16] w-full"
      />
      {!soundOn && (
        <button
          type="button"
          onClick={enableSound}
          aria-label="Tap for sound"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/30 transition-colors hover:bg-black/20"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 shadow-2xl transition-transform hover:scale-105">
            <VolumeX className="h-9 w-9 text-gray-900" />
          </span>
          <span className="rounded-full bg-black/55 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            Tap for sound
          </span>
        </button>
      )}
    </div>
  )
}
