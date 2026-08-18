"use client"

import type { PlaybackSpeed } from "@/lib/simulation-controller"
import { Button } from "@/components/ui/button"

interface SimulationControlsProps {
  isPlaying: boolean
  speed: PlaybackSpeed
  onPlayPause: () => void
  onSpeedChange: (speed: PlaybackSpeed) => void
  onReset: () => void
}

export default function SimulationControls({
  isPlaying,
  speed,
  onPlayPause,
  onSpeedChange,
  onReset,
}: SimulationControlsProps) {
  const speeds: PlaybackSpeed[] = [1, 5, 10]

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-border/50 p-4 shadow-lg shadow-black/20">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={onPlayPause}
            className="px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary/70 text-primary-foreground"
          >
            {isPlaying ? (
              <>
                <span className="mr-2">⏸</span>
                Pause
              </>
            ) : (
              <>
                <span className="mr-2">▶</span>
                Play
              </>
            )}
          </Button>

          <Button onClick={onReset} variant="outline" className="px-4 bg-transparent">
            <span className="mr-2">🔄</span>
            Reset
          </Button>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 rounded-lg">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Speed</span>
          <div className="flex gap-2">
            {speeds.map((s) => (
              <Button
                key={s}
                onClick={() => onSpeedChange(s)}
                variant={speed === s ? "default" : "outline"}
                size="sm"
                className={`w-12 font-bold ${
                  speed === s ? "bg-accent text-accent-foreground" : "bg-muted/50 text-foreground hover:bg-muted"
                }`}
              >
                {s}x
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
