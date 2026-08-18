import type { FleetEvent, Location } from "./fleet-engine"

export interface EventGeneratorConfig {
  tripIds: string[]
  vehicleIds: string[]
  eventFrequencyMs: number
  enableRandomEvents: boolean
}

export class RealTimeEventGenerator {
  private config: EventGeneratorConfig
  private eventSequence: FleetEvent[] = []
  private activeTrips: Map<string, boolean> = new Map()
  private lastEventTime: Map<string, number> = new Map()

  constructor(config: EventGeneratorConfig) {
    this.config = config
    this.initializeTrips()
  }

  private initializeTrips() {
    this.config.tripIds.forEach((tripId) => {
      this.activeTrips.set(tripId, true)
      this.lastEventTime.set(tripId, Date.now())
    })
  }

  generateLocationPing(
    tripId: string,
    vehicleId: string,
    currentLocation: Location,
    speed: number,
    distance: number,
  ): FleetEvent {
    const now = new Date()

    // Simulate natural movement variation
    const heading = Math.random() * 360
    const speedVariation = speed * (0.9 + Math.random() * 0.2)

    // Simulate location drift (±0.0005 degrees approximately 55 meters)
    const locationDrift = {
      lat: currentLocation.lat + (Math.random() - 0.5) * 0.0005,
      lng: currentLocation.lng + (Math.random() - 0.5) * 0.0005,
    }

    return {
      event_id: `ping_${tripId}_${Date.now()}`,
      event_type: "location_ping",
      timestamp: now.toISOString(),
      vehicle_id: vehicleId,
      trip_id: tripId,
      location: locationDrift,
      movement: {
        speed_kmh: speedVariation,
        heading_degrees: heading,
        moving: speedVariation > 0.5,
      },
      distance_travelled_km: distance,
      signal_quality: this.generateSignalQuality(),
      device: {
        battery_level: Math.random() * 100,
        charging: Math.random() < 0.1,
      },
    }
  }

  generateSpeedViolation(
    tripId: string,
    vehicleId: string,
    currentLocation: Location,
    speedKmh: number,
    speedLimitKmh: number,
  ): FleetEvent {
    return {
      event_id: `violation_${tripId}_${Date.now()}`,
      event_type: "speed_violation",
      timestamp: new Date().toISOString(),
      vehicle_id: vehicleId,
      trip_id: tripId,
      location: currentLocation,
      speed_limit_kmh: speedLimitKmh,
      violation_amount_kmh: Math.max(0, speedKmh - speedLimitKmh),
    }
  }

  generateBatteryAlert(
    tripId: string,
    vehicleId: string,
    currentLocation: Location,
    batteryLevel: number,
  ): FleetEvent | null {
    if (batteryLevel > 20) return null

    return {
      event_id: `battery_${tripId}_${Date.now()}`,
      event_type: "battery_low",
      timestamp: new Date().toISOString(),
      vehicle_id: vehicleId,
      trip_id: tripId,
      location: currentLocation,
      battery_level_percent: batteryLevel,
      threshold_percent: 20,
      estimated_remaining_hours: (batteryLevel / 20) * 2,
    }
  }

  generateFuelAlert(
    tripId: string,
    vehicleId: string,
    currentLocation: Location,
    fuelLevel: number,
  ): FleetEvent | null {
    if (fuelLevel > 25) return null

    return {
      event_id: `fuel_${tripId}_${Date.now()}`,
      event_type: "fuel_level_low",
      timestamp: new Date().toISOString(),
      vehicle_id: vehicleId,
      trip_id: tripId,
      location: currentLocation,
      fuel_level_percent: fuelLevel,
      threshold_percent: 25,
      estimated_range_km: (fuelLevel / 100) * 500,
    }
  }

  generateSignalLoss(tripId: string, vehicleId: string, currentLocation: Location): FleetEvent {
    return {
      event_id: `signal_${tripId}_${Date.now()}`,
      event_type: "signal_lost",
      timestamp: new Date().toISOString(),
      vehicle_id: vehicleId,
      trip_id: tripId,
      location: currentLocation,
    }
  }

  private generateSignalQuality(): string {
    const rand = Math.random()
    if (rand < 0.7) return "excellent"
    if (rand < 0.9) return "good"
    if (rand < 0.97) return "fair"
    return "poor"
  }

  shouldGenerateRandomEvent(probability = 0.02): boolean {
    return Math.random() < probability
  }

  getEventSequence(): FleetEvent[] {
    return this.eventSequence
  }

  reset() {
    this.eventSequence = []
    this.lastEventTime.clear()
    this.initializeTrips()
  }
}
