"use client"

import type { TripState } from "@/lib/fleet-engine"

interface FleetMapProps {
  tripStates: TripState[]
}

export default function FleetMap({ tripStates }: FleetMapProps) {
  const statusColors = {
    active: "#70c5ff",
    completed: "#22c55e",
    cancelled: "#ff6b6b",
  }

  if (tripStates.length === 0) {
    return (
      <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-border/50 p-8 flex flex-col items-center justify-center min-h-96">
        <div className="text-4xl mb-3">📍</div>
        <p className="text-muted-foreground">No active trips to display on map</p>
      </div>
    )
  }

  // Calculate bounds in lat/lng
  let minLat = Number.POSITIVE_INFINITY,
    maxLat = Number.NEGATIVE_INFINITY,
    minLng = Number.POSITIVE_INFINITY,
    maxLng = Number.NEGATIVE_INFINITY

  tripStates.forEach((trip) => {
    const lat = trip.currentLocation.lat
    const lng = trip.currentLocation.lng

    // Validate coordinates are within valid ranges
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      minLat = Math.min(minLat, lat)
      maxLat = Math.max(maxLat, lat)
      minLng = Math.min(minLng, lng)
      maxLng = Math.max(maxLng, lng)
    }
  })

  // Add padding - use minimum padding for single-point maps
  const latRange = maxLat - minLat
  const lngRange = maxLng - minLng
  const minPadding = 0.1 // Minimum padding in degrees

  const latPadding = Math.max(latRange * 0.1, minPadding)
  const lngPadding = Math.max(lngRange * 0.1, minPadding)

  const mapMinLat = minLat - latPadding
  const mapMaxLat = maxLat + latPadding
  const mapMinLng = minLng - lngPadding
  const mapMaxLng = maxLng + lngPadding

  const svgWidth = 1000
  const svgHeight = 600

  // Function to convert lat/lng to SVG x/y coordinates
  // Handles both positive and negative longitude values correctly
  const lngToX = (lng: number) => {
    // Normalize longitude to 0-1 range, then scale to SVG width
    return ((lng - mapMinLng) / (mapMaxLng - mapMinLng)) * svgWidth
  }

  const latToY = (lat: number) => {
    // Invert Y axis because SVG Y increases downward but lat increases upward
    // Normalize latitude to 0-1 range, then scale to SVG height
    return ((mapMaxLat - lat) / (mapMaxLat - mapMinLat)) * svgHeight
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Fleet Location Map</h3>
        <p className="text-sm text-muted-foreground">{tripStates.length} vehicles in view</p>
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 p-6 overflow-x-auto">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: "0.5rem",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <defs>
            <marker id="arrowActive" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
              <path d="M0,0 L10,5 L0,10 Z" fill={statusColors.active} />
            </marker>
            <marker id="arrowCompleted" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
              <path d="M0,0 L10,5 L0,10 Z" fill={statusColors.completed} />
            </marker>
            <marker id="arrowCancelled" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
              <path d="M0,0 L10,5 L0,10 Z" fill={statusColors.cancelled} />
            </marker>
          </defs>

          {/* Grid lines */}
          <g stroke="rgba(255,255,255,0.05)" strokeWidth="1">
            {Array.from({ length: 10 }).map((_, i) => {
              const y = (svgHeight / 10) * i
              return <line key={`h-${i}`} x1="0" y1={y} x2={svgWidth} y2={y} />
            })}
            {Array.from({ length: 10 }).map((_, i) => {
              const x = (svgWidth / 10) * i
              return <line key={`v-${i}`} x1={x} y1="0" x2={x} y2={svgHeight} />
            })}
          </g>

          {/* Vehicles */}
          {tripStates.map((trip) => {
            const x = lngToX(trip.currentLocation.lng)
            const y = latToY(trip.currentLocation.lat)
            const color = statusColors[trip.status]
            const headingRadians = ((trip.lastEvent?.movement?.heading_degrees || 0) * Math.PI) / 180

            const markerSize = 8
            const headingLength = 15

            return (
              <g key={trip.tripId}>
                {/* Heading line */}
                <line
                  x1={x}
                  y1={y}
                  x2={x + Math.sin(headingRadians) * headingLength}
                  y2={y - Math.cos(headingRadians) * headingLength}
                  stroke={color}
                  strokeWidth="2"
                  opacity="0.6"
                />
                {/* Vehicle marker */}
                <circle cx={x} cy={y} r={markerSize} fill={color} stroke="white" strokeWidth="2" opacity="0.95" />
                {/* Vehicle label */}
                <text
                  x={x}
                  y={y - markerSize - 8}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {trip.vehicleId}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { status: "active", color: statusColors.active, label: "Active" },
          { status: "completed", color: statusColors.completed, label: "Completed" },
          { status: "cancelled", color: statusColors.cancelled, label: "Cancelled" },
        ].map((item) => (
          <div key={item.status} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
