import type { SimulationController, PlaybackSpeed } from "./simulation-controller"
import type { FleetTrackingEngine } from "./fleet-engine"
import type { RealTimeEventGenerator } from "./real-time-event-generator"

export interface SimulationState {
  isRunning: boolean
  currentTime: Date
  speed: PlaybackSpeed
  progress: number
  eventCount: number
  activeTrips: number
  completedTrips: number
}

export class SimulationStateManager {
  private controller: SimulationController
  private engine: FleetTrackingEngine
  private eventGenerator: RealTimeEventGenerator
  private state: SimulationState
  private stateListeners: ((state: SimulationState) => void)[] = []
  private initialized = false

  constructor(controller: SimulationController, engine: FleetTrackingEngine, eventGenerator: RealTimeEventGenerator) {
    this.controller = controller
    this.engine = engine
    this.eventGenerator = eventGenerator
    this.state = {
      isRunning: false,
      currentTime: new Date("2025-11-03T08:00:00.000Z"),
      speed: 1,
      progress: 0,
      eventCount: 0,
      activeTrips: 0,
      completedTrips: 0,
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return
    this.initialized = true
    this.updateState()
  }

  play(onUpdate: (deltaMs: number) => void): void {
    this.state.isRunning = true
    this.notifyListeners()

    let frameCount = 0
    this.controller.play((deltaMs) => {
      this.engine.advanceTime(deltaMs)

      // Process events incrementally up to current simulation time
      this.engine.processEventsUpToTime(this.engine.getCurrentTime())

      this.state.currentTime = new Date(this.engine.getCurrentTime())
      this.state.eventCount = this.engine.getFleetState().events.length
      this.state.activeTrips = this.engine.getActiveTrips()
      this.state.completedTrips = this.engine.getCompletedTrips()

      // Calculate progress (24-hour simulation)
      const start = new Date("2025-11-03T08:00:00.000Z")
      const elapsed = this.state.currentTime.getTime() - start.getTime()
      this.state.progress = Math.min(100, (elapsed / (24 * 60 * 60 * 1000)) * 100)

      // Notify listeners every frame for smooth updates
      frameCount++
      this.notifyListeners()
      onUpdate(deltaMs)
    })
  }

  pause(): void {
    this.controller.pause()
    this.state.isRunning = false
    this.notifyListeners()
  }

  setSpeed(speed: PlaybackSpeed): void {
    this.controller.setSpeed(speed)
    this.state.speed = speed
    this.notifyListeners()
  }

  reset(): void {
    this.controller.reset(new Date("2025-11-03T08:00:00.000Z"))
    this.engine.reset()
    this.state = {
      isRunning: false,
      currentTime: new Date("2025-11-03T08:00:00.000Z"),
      speed: 1,
      progress: 0,
      eventCount: 0,
      activeTrips: 0,
      completedTrips: 0,
    }
    this.eventGenerator.reset()
    this.notifyListeners()
  }

  subscribe(listener: (state: SimulationState) => void): () => void {
    this.stateListeners.push(listener)
    return () => {
      this.stateListeners = this.stateListeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners(): void {
    this.stateListeners.forEach((listener) => listener(this.state))
  }

  private updateState(): void {
    this.state.currentTime = new Date(this.engine.getCurrentTime())
    this.state.activeTrips = this.engine.getActiveTrips()
    this.state.eventCount = this.engine.getFleetState().events.length
    this.notifyListeners()
  }

  getState(): SimulationState {
    return this.state
  }
}
