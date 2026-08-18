"use client"

import type { TripState } from "@/lib/fleet-engine"

interface TripDetailsExpandedProps {
  trip: TripState
  currentTime?: Date
}

export default function TripDetailsExpanded({ trip, currentTime }: TripDetailsExpandedProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  const referenceTime = currentTime || new Date()
  const elapsedMinutes = trip.endTime
    ? (new Date(trip.endTime).getTime() - new Date(trip.startTime).getTime()) / 60000
    : (referenceTime.getTime() - new Date(trip.startTime).getTime()) / 60000

  const progressPercent = trip.plannedDistance > 0 ? (trip.distance / trip.plannedDistance) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main metrics */}
        <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚡</span>
            <span className="text-sm font-semibold text-foreground">Speed & Distance</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Current Speed</span>
              <span className="text-sm font-bold text-foreground font-mono">{trip.currentSpeed.toFixed(1)} km/h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Distance Traveled</span>
              <span className="text-sm font-bold text-foreground font-mono">
                {trip.distance.toFixed(1)} / {trip.plannedDistance.toFixed(1)} km
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercent, 100)}%`, willChange: "width" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Battery & Power */}
        <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔋</span>
            <span className="text-sm font-semibold text-foreground">Battery Status</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Battery Level</span>
              <span className="text-sm font-bold text-foreground font-mono">{trip.battery.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-yellow-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${trip.battery}%`, willChange: "width" }}
              ></div>
            </div>
            {trip.battery < 20 && <p className="text-xs text-destructive font-medium">Low battery warning</p>}
          </div>
        </div>
      </div>

      {/* Time & Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🕐</span>
            <span className="text-sm font-semibold text-foreground">Timeline</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Time</span>
              <span className="font-mono text-foreground">{formatTime(trip.startTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Elapsed</span>
              <span className="font-mono text-foreground">{elapsedMinutes.toFixed(0)} mins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Duration</span>
              <span className="font-mono text-foreground">{trip.estimatedDuration.toFixed(1)}h</span>
            </div>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📍</span>
            <span className="text-sm font-semibold text-foreground">Location</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Latitude</span>
              <span className="font-mono text-foreground">{trip.currentLocation.lat.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Longitude</span>
              <span className="font-mono text-foreground">{trip.currentLocation.lng.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="font-mono text-foreground">
                {trip.currentLocation.accuracy_meters?.toFixed(0) || "N/A"} m
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {trip.alerts.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚠</span>
            <span className="text-sm font-semibold text-destructive">Active Alerts ({trip.alerts.length})</span>
          </div>
          <div className="space-y-1">
            {trip.alerts.map((alert, idx) => (
              <p key={idx} className="text-sm text-destructive/90">
                • {alert}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
