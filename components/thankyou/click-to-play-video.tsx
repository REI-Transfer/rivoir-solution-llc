"use client"

import { useRef, useState } from "react"
import { Play } from "lucide-react"

export function ClickToPlayVideo({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const handlePlay = () => {
    setPlaying(true)
    requestAnimationFrame(() => {
      ref.current?.play().catch(() => setPlaying(false))
    })
  }

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-md border border-gray-200 bg-black">
      <video
        ref={ref}
        src={src}
        controls={playing}
        playsInline
        preload="metadata"
        className="w-full block"
        style={{ aspectRatio: "16/9", objectFit: "cover" }}
        aria-label={title}
      />
      {!playing && (
        <button
          onClick={handlePlay}
          aria-label={`Play ${title}`}
          className="absolute inset-0 flex items-center justify-center bg-black/35 hover:bg-black/25 transition-colors group"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-2xl transition-transform group-hover:scale-105">
            <Play className="h-9 w-9 text-gray-900 ml-1" fill="currentColor" />
          </span>
        </button>
      )}
    </div>
  )
}
