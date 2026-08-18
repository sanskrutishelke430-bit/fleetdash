"use client"

import type { TripState } from "@/lib/fleet-engine"
import TripDetailsExpanded from "./trip-details-expanded"
import { useState, useEffect, useRef } from "react"

interface TripCardProps {
  trip: TripState
  isRecent?: boolean
  currentTime?: Date
  isExpanded?: boolean
  onToggleExpand?: () => void
}

export default function TripCard({ trip, isRecent = false, currentTime, isExpanded = false, onToggleExpand }: TripCardProps) {
  const progressPercent = trip.plannedDistance > 0 ? (trip.distance / trip.plannedDistance) * 100 : 0
  const statusColors = {
    active: "bg-accent text-accent-foreground",
    completed: "bg-green-500 text-white",
    cancelled: "bg-destructive text-destructive-foreground",
  }
  const [pulse, setPulse] = useState(isRecent)
  const lastEventKeyRef = useRef<string>("")

  useEffect(() => {
    if (isRecent) {
      const timer = setTimeout(() => setPulse(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isRecent])

  useEffect(() => {
    const currentKey = `${trip.distance}-${trip.currentSpeed}-${trip.battery}`
    if (lastEventKeyRef.current !== currentKey && lastEventKeyRef.current !== "") {
      setPulse(true)
      const timer = setTimeout(() => setPulse(false), 2000)
      return () => clearTimeout(timer)
    }
    lastEventKeyRef.current = currentKey
  }, [trip.distance, trip.currentSpeed, trip.battery])

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onToggleExpand?.()
  }

  return (
    <div
      className={`bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-lg transition-all ${
        pulse ? "animate-pulse ring-2 ring-primary" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{trip.vehicleId}</p>
          <p className="text-lg font-bold text-foreground mt-1">{trip.tripId}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[trip.status]}`}>
          {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
        </span>
      </div>

      <div className="space-y-4 mb-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">Progress</span>
            <span className="text-sm font-bold text-foreground">{Math.round(Math.min(progressPercent, 100))}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-primary to-accent"
              style={{
                width: `${Math.min(progressPercent, 100)}%`,
                willChange: "width",
                backfaceVisibility: "hidden",
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Distance</p>
            <p className="text-sm font-bold text-foreground font-mono">
              {trip.distance.toFixed(1)}/{trip.plannedDistance.toFixed(1)} km
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Speed</p>
            <p className="text-sm font-bold text-foreground font-mono">{trip.currentSpeed.toFixed(1)} km/h</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Battery</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground">{trip.battery.toFixed(0)}%</p>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-300 ease-out bg-green-500"
                  style={{ width: `${trip.battery}%`, willChange: "width" }}
                />
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="text-xs font-mono text-foreground">
              {trip.currentLocation.lat.toFixed(3)}, {trip.currentLocation.lng.toFixed(3)}
            </p>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2 duration-200">
          <TripDetailsExpanded trip={trip} currentTime={currentTime} />
        </div>
      )}

      <button
        type="button"
        onClick={handleButtonClick}
        className="mt-4 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
      >
        {isExpanded ? "Hide Details" : "View Details"}
      </button>

      {trip.alerts.length > 0 && (
        <div className="border-t border-border pt-3 mt-3">
          <p className="text-xs font-semibold text-destructive mb-2">Alerts ({trip.alerts.length})</p>
          <div className="flex flex-wrap gap-1">
            {trip.alerts.map((alert, idx) => (
              <span key={idx} className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">
                {alert}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
