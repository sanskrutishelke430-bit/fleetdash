export type PlaybackSpeed = 1 | 5 | 10

export class SimulationController {
  private animationFrameId: number | null = null
  private lastUpdateTime = 0
  private isPlaying = false
  private speed: PlaybackSpeed = 1
  private onUpdate: ((deltaMs: number) => void) | null = null
  private startRealTime = 0
  private simulationStartTime: Date
  private updateInterval = 1000 // Update every 1 second for smooth UI updates
  private lastNotificationTime = 0
  private accumulatedDelta = 0

  constructor(simulationStartTime: Date) {
    this.simulationStartTime = new Date(simulationStartTime)
  }

  play(onUpdate: (deltaMs: number) => void): void {
    if (this.isPlaying) return

    this.isPlaying = true
    this.onUpdate = onUpdate
    this.lastUpdateTime = performance.now()
    this.lastNotificationTime = performance.now()
    this.startRealTime = performance.now()
    this.accumulatedDelta = 0

    const animate = () => {
      const now = performance.now()
      const realDelta = now - this.lastUpdateTime
      const timeSinceLastNotification = now - this.lastNotificationTime
      const simulationDelta = realDelta * this.speed

      this.lastUpdateTime = now
      this.accumulatedDelta += simulationDelta

      // Notify listeners every updateInterval (1 second) for smooth UI updates
      if (timeSinceLastNotification >= this.updateInterval) {
        if (this.onUpdate) {
          this.onUpdate(this.accumulatedDelta)
        }
        this.lastNotificationTime = now
        this.accumulatedDelta = 0
      }

      this.animationFrameId = requestAnimationFrame(animate)
    }

    this.animationFrameId = requestAnimationFrame(animate)
  }

  pause(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    this.isPlaying = false
  }

  setSpeed(speed: PlaybackSpeed): void {
    this.speed = speed
  }

  getSpeed(): PlaybackSpeed {
    return this.speed
  }

  isRunning(): boolean {
    return this.isPlaying
  }

  reset(simulationStartTime: Date): void {
    this.pause()
    this.simulationStartTime = new Date(simulationStartTime)
    this.lastUpdateTime = 0
    this.startRealTime = 0
  }
}
