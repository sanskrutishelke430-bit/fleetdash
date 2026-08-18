"use client"

import { useState } from "react"
import type { TripState } from "@/lib/fleet-engine"
import TripCard from "./trip-card"

interface TripCardsGridProps {
  tripStates: TripState[]
  lastUpdateTime?: { [key: string]: Date }
  currentTime?: Date
}

export default function TripCardsGrid({ tripStates, lastUpdateTime = {}, currentTime }: TripCardsGridProps) {
  const [expandedTripIds, setExpandedTripIds] = useState<Set<string>>(new Set())

  const isRecentlyUpdated = (tripId: string) => {
    const lastUpdate = lastUpdateTime[tripId]
    if (!lastUpdate) return false
    const now = new Date()
    return now.getTime() - lastUpdate.getTime() < 2000
  }

  const handleToggleExpand = (tripId: string) => {
    setExpandedTripIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(tripId)) {
        newSet.delete(tripId)
      } else {
        newSet.add(tripId)
      }
      return newSet
    })
  }

  if (tripStates.length === 0) {
    return (
      <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-border/50 p-8 flex flex-col items-center justify-center min-h-64">
        <div className="text-4xl mb-3">🚗</div>
        <p className="text-muted-foreground">No trips to display</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{tripStates.length} Trip(s)</h2>
          <p className="text-sm text-muted-foreground">Real-time fleet tracking data</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tripStates.map((trip) => (
          <TripCard 
            key={trip.tripId} 
            trip={trip} 
            isRecent={isRecentlyUpdated(trip.tripId)} 
            currentTime={currentTime}
            isExpanded={expandedTripIds.has(trip.tripId)}
            onToggleExpand={() => handleToggleExpand(trip.tripId)}
          />
        ))}
      </div>
    </div>
  )
}
