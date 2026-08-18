"use client"

import { useState, useEffect, useRef } from "react"

interface DashboardHeaderProps {
  currentTime: Date
  isPlaying?: boolean
  progress?: number
  playbackSpeed?: number
}

export default function DashboardHeader({ currentTime, isPlaying, progress = 0, playbackSpeed = 1 }: DashboardHeaderProps) {
  const [displayTime, setDisplayTime] = useState(currentTime)
  const [displayProgress, setDisplayProgress] = useState(progress)
  const animationFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef(currentTime.getTime())
  const targetTimeRef = useRef(currentTime.getTime())
  const lastRealTimeRef = useRef(performance.now())
  const progressRef = useRef(progress)
  const targetProgressRef = useRef(progress)
  const playbackSpeedRef = useRef(1)

  useEffect(() => {
    targetTimeRef.current = currentTime.getTime()
    // Don't reset lastRealTimeRef here to maintain smooth flow
  }, [currentTime])

  useEffect(() => {
    targetProgressRef.current = progress
  }, [progress])

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed
  }, [playbackSpeed])

  useEffect(() => {
    let mounted = true
    lastRealTimeRef.current = performance.now()
    
    const animate = (now: number) => {
      if (!mounted) return

      const realDelta = now - lastRealTimeRef.current
      lastRealTimeRef.current = now

      if (!isPlaying) {
        // When paused, just show the target values
        lastTimeRef.current = targetTimeRef.current
        setDisplayTime(new Date(targetTimeRef.current))
        progressRef.current = targetProgressRef.current
        setDisplayProgress(targetProgressRef.current)
      } else {
        // Continuously advance time based on real time delta
        // This creates smooth flowing time display
        const simulationDelta = realDelta * playbackSpeedRef.current
        const current = lastTimeRef.current
        const target = targetTimeRef.current
        
        // Add the time delta for smooth continuous flow
        let newTime = current + simulationDelta
        
        // Gently pull towards the target to stay in sync
        const diff = target - newTime
        if (Math.abs(diff) > 1000) {
          // If we're more than 1 second off, correct more aggressively
          newTime += diff * 0.1
        } else if (Math.abs(diff) > 100) {
          // Small correction for minor drift
          newTime += diff * 0.05
        }
        
        lastTimeRef.current = newTime
        setDisplayTime(new Date(newTime))

        // Animate progress
        const currentProgress = progressRef.current
        const targetProgress = targetProgressRef.current
        const progressDiff = targetProgress - currentProgress

        if (Math.abs(progressDiff) > 0.01) {
          const newProgress = currentProgress + progressDiff * 0.15
          progressRef.current = newProgress
          setDisplayProgress(newProgress)
        } else {
          progressRef.current = targetProgress
          setDisplayProgress(targetProgress)
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      mounted = false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying])

  const formatTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  }

  return (
    <header className="border-b border-border/50 bg-background backdrop-blur-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg">
              🚚
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Fleet Tracker</h1>
              <p className="text-xs text-muted-foreground">Real-time vehicle monitoring</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Simulation Time</p>
              {isPlaying && (
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Live updating" />
              )}
            </div>
            <p className="text-xl font-mono font-bold text-accent tabular-nums">{formatTime(displayTime)}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">24-Hour Simulation Progress</span>
            <span className="text-xs font-bold text-foreground tabular-nums">{displayProgress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden relative">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-primary via-accent to-primary"
              style={{
                width: `${Math.min(displayProgress, 100)}%`,
                transition: "width 0.1s linear",
              }}
            />
            {isPlaying && (
              <div
                className="absolute top-0 h-2 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                style={{
                  left: `${Math.max(0, Math.min(displayProgress - 10, 90))}%`,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
