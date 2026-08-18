"use client"

import { useState, useEffect, useRef } from "react"
import type { FleetTrackingEngine, TripState } from "@/lib/fleet-engine"

interface FleetOverviewProps {
  engine: FleetTrackingEngine | null
  tripStates: TripState[]
}

export default function FleetOverview({ engine, tripStates }: FleetOverviewProps) {
  const activeTrips = tripStates.filter((t) => t.status === "active").length
  const completedTrips = tripStates.filter((t) => t.status === "completed").length
  const cancelledTrips = tripStates.filter((t) => t.status === "cancelled").length
  const totalDistance = tripStates.reduce((sum, trip) => sum + trip.distance, 0)
  const avgSpeed =
    tripStates.length > 0 ? tripStates.reduce((sum, trip) => sum + trip.currentSpeed, 0) / tripStates.length : 0
  const alertsCount = tripStates.reduce((sum, trip) => sum + trip.alerts.length, 0)
  const avgBattery =
    tripStates.length > 0 ? tripStates.reduce((sum, trip) => sum + trip.battery, 0) / tripStates.length : 0

  // Smooth animated values
  const [displayDistance, setDisplayDistance] = useState(totalDistance)
  const [displaySpeed, setDisplaySpeed] = useState(avgSpeed)
  const [displayBattery, setDisplayBattery] = useState(avgBattery)
  
  const animationFrameRef = useRef<number | null>(null)
  const distanceRef = useRef(totalDistance)
  const speedRef = useRef(avgSpeed)
  const batteryRef = useRef(avgBattery)

  useEffect(() => {
    let mounted = true
    
    const animate = () => {
      if (!mounted) return

      // Smooth interpolation for distance
      const distanceDiff = totalDistance - distanceRef.current
      if (Math.abs(distanceDiff) > 0.01) {
        distanceRef.current += distanceDiff * 0.2
        setDisplayDistance(distanceRef.current)
      } else {
        distanceRef.current = totalDistance
        setDisplayDistance(totalDistance)
      }

      // Smooth interpolation for speed
      const speedDiff = avgSpeed - speedRef.current
      if (Math.abs(speedDiff) > 0.01) {
        speedRef.current += speedDiff * 0.2
        setDisplaySpeed(speedRef.current)
      } else {
        speedRef.current = avgSpeed
        setDisplaySpeed(avgSpeed)
      }

      // Smooth interpolation for battery
      const batteryDiff = avgBattery - batteryRef.current
      if (Math.abs(batteryDiff) > 0.01) {
        batteryRef.current += batteryDiff * 0.2
        setDisplayBattery(batteryRef.current)
      } else {
        batteryRef.current = avgBattery
        setDisplayBattery(avgBattery)
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
  }, [totalDistance, avgSpeed, avgBattery])

  const metrics = [
    {
      label: "Active Trips",
      value: activeTrips,
      symbol: "▶",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Completed",
      value: completedTrips,
      symbol: "✓",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Alerts",
      value: alertsCount,
      symbol: "⚠",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Total Distance",
      value: `${displayDistance.toFixed(1)} km`,
      symbol: "📍",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Avg Speed",
      value: `${displaySpeed.toFixed(1)} km/h`,
      symbol: "⚡",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Avg Battery",
      value: `${displayBattery.toFixed(0)}%`,
      symbol: "🔋",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Fleet Overview</h2>
        <p className="text-sm text-muted-foreground">{tripStates.length} total trips monitored</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="group bg-card/80 backdrop-blur-sm rounded-lg border border-border/50 p-5 hover:border-border transition-all hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {metric.label}
                </p>
                <p className="text-3xl font-bold text-foreground font-mono">{metric.value}</p>
              </div>
              <div className={`text-2xl w-10 h-10 flex items-center justify-center rounded-lg ${metric.bgColor}`}>
                {metric.symbol}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
