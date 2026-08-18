export interface Location {
  lat: number
  lng: number
  accuracy_meters?: number
  altitude_meters?: number
}

export interface Movement {
  speed_kmh: number
  heading_degrees: number
  moving: boolean
}

export interface Device {
  battery_level: number
  charging: boolean
}

export interface FleetEvent {
  event_id: string
  event_type: string
  timestamp: string
  vehicle_id: string
  trip_id: string
  location: Location
  movement?: Movement
  device?: Device
  distance_travelled_km?: number
  signal_quality?: string
  overspeed?: boolean
  planned_distance_km?: number
  estimated_duration_hours?: number
  device_id?: string
  total_distance_km?: number
  duration_minutes?: number
  fuel_consumed_percent?: number
  cancellation_reason?: string
  distance_completed_km?: number
  elapsed_time_minutes?: number
  accuracy_meters?: number
  altitude_meters?: number
  telemetry?: any
  error_type?: string
  error_code?: string
  error_message?: string
  severity?: string
  battery_level_percent?: number
  threshold_percent?: number
  estimated_remaining_hours?: number
  fuel_level_percent?: number
  estimated_range_km?: number
  refuel_duration_minutes?: number
  fuel_level_after_refuel?: number
  fuel_added_percent?: number
  signal_lost_duration_seconds?: number
  signal_quality_after_recovery?: string
  speed_limit_kmh?: number
  violation_amount_kmh?: number
  stop_duration_minutes?: number
}

export interface TripState {
  tripId: string
  vehicleId: string
  status: "active" | "completed" | "cancelled"
  currentLocation: Location
  currentSpeed: number
  distance: number
  plannedDistance: number
  estimatedDuration: number
  startTime: string
  endTime?: string
  battery: number
  fuelLevel?: number
  alerts: string[]
  lastEvent: FleetEvent | null
}

export interface FleetState {
  trips: Map<string, TripState>
  events: FleetEvent[]
}

export class FleetTrackingEngine {
  private events: FleetEvent[] = []
  private tripStates: Map<string, TripState> = new Map()
  private listeners: ((state: FleetState) => void)[] = []
  private currentTime: Date
  private startTime: Date
  private lastProcessedTime: Date | null = null

  constructor() {
    this.currentTime = new Date("2025-11-03T08:00:00.000Z")
    this.startTime = new Date(this.currentTime)
  }

  private validateLocation(location: Location): boolean {
    const isValid =
      location.lat >= -90 &&
      location.lat <= 90 &&
      location.lng >= -180 &&
      location.lng <= 180

    if (!isValid) {
      console.warn(
        `[FleetTrackingEngine] Invalid coordinates detected: lat=${location.lat}, lng=${location.lng}`
      )
    }

    return isValid
  }

  async loadTripData(tripFiles: string[]): Promise<void> {
    try {
      for (const file of tripFiles) {
        const response = await fetch(file)
        const data: FleetEvent[] = await response.json()
        this.events.push(...data)
      }
      this.events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      console.log("[v0] Loaded", this.events.length, "total events")
    } catch (error) {
      console.error("[v0] Error loading trip data:", error)
    }
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Radius of Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  processEventsUpToTime(time: Date): FleetEvent[] {
    // Filter events to only process new ones since lastProcessedTime
    const newEvents = this.events.filter((event) => {
      const eventTime = new Date(event.timestamp)
      const afterLastProcessed = this.lastProcessedTime === null || eventTime > this.lastProcessedTime
      const beforeTargetTime = eventTime <= time
      return afterLastProcessed && beforeTargetTime
    })

    // Update trip states based on new events only
    newEvents.forEach((event) => {
      const tripId = event.trip_id

      if (!this.tripStates.has(tripId)) {
        // Validate location before creating trip state
        if (!this.validateLocation(event.location)) {
          console.warn(`[FleetTrackingEngine] Skipping trip ${tripId} initialization due to invalid location`)
          return
        }

        this.tripStates.set(tripId, {
          tripId,
          vehicleId: event.vehicle_id,
          status: "active",
          currentLocation: event.location,
          currentSpeed: event.movement?.speed_kmh || 0,
          distance: 0,
          plannedDistance: event.planned_distance_km || 0,
          estimatedDuration: event.estimated_duration_hours || 0,
          startTime: event.timestamp,
          battery: event.device?.battery_level || 100,
          fuelLevel: (event as any).fuel_level_percent || 100,
          alerts: [],
          lastEvent: event,
        })
      }

      const tripState = this.tripStates.get(tripId)!

      // Update based on event type
      if (event.event_type === "trip_started") {
        // Validate location before updating
        if (this.validateLocation(event.location)) {
          tripState.currentLocation = event.location
        }
        tripState.distance = 0
        tripState.plannedDistance = event.planned_distance_km || 0
        tripState.estimatedDuration = event.estimated_duration_hours || 0
        tripState.status = "active"
      } else if (event.event_type === "location_ping") {
        if (event.distance_travelled_km !== undefined) {
          tripState.distance = event.distance_travelled_km
        }
        // Validate location before updating
        if (this.validateLocation(event.location)) {
          tripState.currentLocation = event.location
        }
        tripState.currentSpeed = event.movement?.speed_kmh || 0
        tripState.battery = event.device?.battery_level !== undefined ? event.device.battery_level : tripState.battery
        if (event.fuel_level_percent !== undefined) {
          tripState.fuelLevel = event.fuel_level_percent
        }
      } else if (event.event_type === "trip_completed") {
        tripState.status = "completed"
        tripState.endTime = event.timestamp
        tripState.distance = event.total_distance_km || event.distance_completed_km || tripState.distance
      } else if (event.event_type === "trip_cancelled") {
        tripState.status = "cancelled"
        tripState.endTime = event.timestamp
      } else if (event.event_type === "speed_violation") {
        if (!tripState.alerts.includes("Speed Violation")) {
          tripState.alerts.push("Speed Violation")
        }
      } else if (event.event_type === "signal_lost") {
        if (!tripState.alerts.includes("Signal Lost")) {
          tripState.alerts.push("Signal Lost")
        }
      } else if (event.event_type === "battery_low") {
        if (!tripState.alerts.includes("Low Battery")) {
          tripState.alerts.push("Low Battery")
        }
      } else if (event.event_type === "fuel_level_low") {
        if (!tripState.alerts.includes("Low Fuel")) {
          tripState.alerts.push("Low Fuel")
        }
      }

      tripState.lastEvent = event
    })

    // Update lastProcessedTime after processing new events
    this.lastProcessedTime = time

    return newEvents
  }

  getFleetState(): FleetState {
    return {
      trips: this.tripStates,
      events: this.events,
    }
  }

  getCurrentTime(): Date {
    return this.currentTime
  }

  setCurrentTime(time: Date): void {
    this.currentTime = time
  }

  advanceTime(deltaMs: number): void {
    this.currentTime = new Date(this.currentTime.getTime() + deltaMs)
  }

  subscribe(listener: (state: FleetState) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  notifyListeners(): void {
    const state = this.getFleetState()
    this.listeners.forEach((listener) => listener(state))
  }

  getTotalDistance(): number {
    let total = 0
    this.tripStates.forEach((trip) => {
      total += trip.distance
    })
    return total
  }

  getActiveTrips(): number {
    let count = 0
    this.tripStates.forEach((trip) => {
      if (trip.status === "active") count++
    })
    return count
  }

  getCompletedTrips(): number {
    let count = 0
    this.tripStates.forEach((trip) => {
      if (trip.status === "completed") count++
    })
    return count
  }

  getCancelledTrips(): number {
    let count = 0
    this.tripStates.forEach((trip) => {
      if (trip.status === "cancelled") count++
    })
    return count
  }

  getProgressPercentage(tripId: string): number {
    const trip = this.tripStates.get(tripId)
    if (!trip || trip.plannedDistance === 0) return 0
    return Math.min((trip.distance / trip.plannedDistance) * 100, 100)
  }

  reset(): void {
    this.tripStates.clear()
    this.lastProcessedTime = null
  }
}
