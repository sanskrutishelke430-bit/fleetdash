"use client"

import { useEffect, useRef } from "react"
import type { TripState } from "@/lib/fleet-engine"

interface InteractiveLeafletMapProps {
  tripStates: TripState[]
}

export default function InteractiveLeafletMap({ tripStates }: InteractiveLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())

  useEffect(() => {
    // Dynamically load Leaflet CSS and JS
    if (!mapContainerRef.current) return

    // Check if leaflet is already loaded
    if ((window as any).L) {
      initializeMap()
      return
    }

    // Load Leaflet CSS
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
    document.head.appendChild(link)

    // Load Leaflet JS
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"
    script.onload = initializeMap
    document.head.appendChild(script)

    return () => {
      if (mapInstanceRef.current) {
        // Clean up all markers
        markersRef.current.forEach((marker) => {
          mapInstanceRef.current.removeLayer(marker)
        })
        markersRef.current.clear()
        
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    const L = (window as any).L
    const statusColors: { [key: string]: string } = {
      active: "#70c5ff",
      completed: "#22c55e",
      cancelled: "#ff6b6b",
    }

    // Track which trip IDs are in the current state
    const currentTripIds = new Set(tripStates.map((trip) => trip.tripId))

    // Remove markers for trips that no longer exist
    markersRef.current.forEach((marker, tripId) => {
      if (!currentTripIds.has(tripId)) {
        mapInstanceRef.current.removeLayer(marker)
        markersRef.current.delete(tripId)
      }
    })

    // Update or create markers for each trip
    const bounds: any[] = []

    tripStates.forEach((trip) => {
      const existingMarker = markersRef.current.get(trip.tripId)

      const html = `
        <div style="width: 30px; height: 30px; background-color: ${statusColors[trip.status]}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; border: 3px solid white;">
          ${trip.vehicleId.slice(-1)}
        </div>
      `

      const customIcon = L.divIcon({
        html,
        iconSize: [30, 30],
        className: "custom-marker",
      })

      const popupContent = `
        <div style="font-size: 12px; min-width: 200px;">
          <strong>${trip.tripId}</strong><br/>
          Vehicle: ${trip.vehicleId}<br/>
          Status: ${trip.status.toUpperCase()}<br/>
          Speed: ${trip.currentSpeed.toFixed(1)} km/h<br/>
          Distance: ${trip.distance.toFixed(1)}/${trip.plannedDistance.toFixed(1)} km<br/>
          Battery: ${trip.battery.toFixed(0)}%<br/>
          Location: ${trip.currentLocation.lat.toFixed(4)}, ${trip.currentLocation.lng.toFixed(4)}
        </div>
      `

      if (existingMarker) {
        // Update existing marker position and icon
        existingMarker.setLatLng([trip.currentLocation.lat, trip.currentLocation.lng])
        existingMarker.setIcon(customIcon)
        existingMarker.setPopupContent(popupContent)
      } else {
        // Create new marker for new trip
        const marker = L.marker([trip.currentLocation.lat, trip.currentLocation.lng], {
          icon: customIcon,
        })
        marker.bindPopup(popupContent)
        marker.addTo(mapInstanceRef.current)
        markersRef.current.set(trip.tripId, marker)
      }

      bounds.push([trip.currentLocation.lat, trip.currentLocation.lng])
    })

    // Fit bounds to show all markers
    if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [tripStates])

  const initializeMap = () => {
    const L = (window as any).L
    if (!mapContainerRef.current || mapInstanceRef.current) return

    mapInstanceRef.current = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      preferCanvas: true,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Fleet Location Map</h3>
        <p className="text-sm text-muted-foreground">{tripStates.length} vehicles tracked</p>
      </div>
      <div
        ref={mapContainerRef}
        className="bg-card rounded-lg border border-border overflow-hidden"
        style={{ height: "500px" }}
      />
    </div>
  )
}
