"use client"

import { useState, useEffect, useRef } from "react"
import { FleetTrackingEngine, type TripState } from "@/lib/fleet-engine"
import { SimulationController, type PlaybackSpeed } from "@/lib/simulation-controller"
import { SimulationStateManager } from "@/lib/simulation-state-manager"
import DashboardHeader from "@/components/dashboard-header"
import TripCardsGrid from "@/components/trip-cards-grid"
import SimulationControls from "@/components/simulation-controls"
import FleetOverview from "@/components/fleet-overview"
import FilteredTabs from "@/components/filtered-tabs"
import InteractiveLeafletMap from "@/components/interactive-leaflet-map"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function Dashboard() {
  const engineRef = useRef<FleetTrackingEngine | null>(null)
  const controllerRef = useRef<SimulationController | null>(null)
  const stateManagerRef = useRef<SimulationStateManager | null>(null)

  const [simulationState, setSimulationState] = useState({
    tripStates: [] as TripState[],
    currentTime: new Date("2025-11-03T08:00:00.000Z"),
    progress: 0,
    isPlaying: false,
    playbackSpeed: 1 as PlaybackSpeed,
    lastUpdateTime: {} as { [key: string]: Date },
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed" | "alerts">("all")
  
  const { toast } = useToast()
  const previousAlertsRef = useRef<{ [key: string]: string[] }>({})
  const previousStatusRef = useRef<{ [key: string]: string }>({})

  useEffect(() => {
    const initialize = async () => {
      const engine = new FleetTrackingEngine()
      const controller = new SimulationController(new Date("2025-11-03T08:00:00.000Z"))

      // Load trip data
      await engine.loadTripData([
        "/data/trip_1_cross_country.json",
        "/data/trip_2_urban_dense.json",
        "/data/trip_3_mountain_cancelled.json",
        "/data/trip_4_southern_technical.json",
        "/data/trip_5_regional_logistics.json",
      ])

      engine.processEventsUpToTime(engine.getCurrentTime())

      const stateManager = new SimulationStateManager(controller, engine, null as any)
      await stateManager.initialize()

      engineRef.current = engine
      controllerRef.current = controller
      stateManagerRef.current = stateManager

      const fleetState = engine.getFleetState()
      const trips = Array.from(fleetState.trips.values())
      setSimulationState(prev => ({
        ...prev,
        tripStates: trips,
      }))
      setIsLoaded(true)
    }

    initialize()
  }, [])

  useEffect(() => {
    if (!isLoaded || !stateManagerRef.current) return

    const unsubscribe = stateManagerRef.current.subscribe((state) => {
      if (engineRef.current) {
        const fleetState = engineRef.current.getFleetState()
        const trips = Array.from(fleetState.trips.values())

        const newLastUpdateTime: { [key: string]: Date } = {}
        trips.forEach((trip) => {
          if (trip.lastEvent) {
            newLastUpdateTime[trip.tripId] = new Date(trip.lastEvent.timestamp)
          }
          
          // Check for new alerts
          const previousAlerts = previousAlertsRef.current[trip.tripId] || []
          const newAlerts = trip.alerts.filter(alert => !previousAlerts.includes(alert))
          
          if (newAlerts.length > 0) {
            newAlerts.forEach(alert => {
              toast({
                title: `⚠️ Alert: ${trip.vehicleId}`,
                description: `${alert} detected on ${trip.tripId}`,
                variant: "destructive",
              })
            })
          }
          
          // Check for trip completion
          const previousStatus = previousStatusRef.current[trip.tripId]
          if (previousStatus === "active" && trip.status === "completed") {
            toast({
              title: `✅ Trip Completed`,
              description: `${trip.vehicleId} completed ${trip.tripId}. Distance: ${trip.distance.toFixed(1)} km`,
              variant: "default",
            })
          }
          
          // Update tracking refs
          previousAlertsRef.current[trip.tripId] = [...trip.alerts]
          previousStatusRef.current[trip.tripId] = trip.status
        })

        // Single state update to prevent batching issues
        setSimulationState({
          tripStates: trips,
          currentTime: state.currentTime,
          progress: state.progress,
          isPlaying: state.isRunning,
          playbackSpeed: state.speed,
          lastUpdateTime: newLastUpdateTime,
        })
      }
    })

    return () => unsubscribe()
  }, [isLoaded, toast])

  const handlePlayPause = () => {
    if (!stateManagerRef.current) return
    if (simulationState.isPlaying) {
      stateManagerRef.current.pause()
    } else {
      stateManagerRef.current.play(() => {})
    }
  }

  const handleSpeedChange = (speed: PlaybackSpeed) => {
    stateManagerRef.current?.setSpeed(speed)
  }

  const handleReset = () => {
    stateManagerRef.current?.reset()
    setSimulationState(prev => ({
      ...prev,
      lastUpdateTime: {},
      progress: 0,
      isPlaying: false,
    }))
    previousAlertsRef.current = {}
    previousStatusRef.current = {}
  }

  const filteredTrips = simulationState.tripStates.filter((trip) => {
    if (activeTab === "all") return true
    if (activeTab === "active") return trip.status === "active"
    if (activeTab === "completed") return trip.status === "completed"
    if (activeTab === "alerts") return trip.alerts.length > 0
    return true
  })

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <DashboardHeader 
        currentTime={simulationState.currentTime} 
        isPlaying={simulationState.isPlaying} 
        progress={simulationState.progress}
        playbackSpeed={simulationState.playbackSpeed}
      />

      <main className="container mx-auto px-4 py-6">
        <FilteredTabs activeTab={activeTab} onTabChange={setActiveTab} tripStates={simulationState.tripStates} />

        <div className="mt-6 space-y-6">
          <SimulationControls
            isPlaying={simulationState.isPlaying}
            speed={simulationState.playbackSpeed}
            onPlayPause={handlePlayPause}
            onSpeedChange={handleSpeedChange}
            onReset={handleReset}
          />

          {!isLoaded ? (
            <div className="bg-card rounded-lg border border-border p-8 flex flex-col items-center justify-center min-h-64">
              <div className="text-4xl mb-3 animate-spin">⚙️</div>
              <p className="text-muted-foreground">Initializing fleet tracking system...</p>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === "all" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <FleetOverview engine={engineRef.current!} tripStates={simulationState.tripStates} />
                  <InteractiveLeafletMap tripStates={simulationState.tripStates} />
                  <TripCardsGrid tripStates={filteredTrips} lastUpdateTime={simulationState.lastUpdateTime} currentTime={simulationState.currentTime} />
                </div>
              )}

              {/* Active Trips Tab */}
              {activeTab === "active" && (
                <div className="animate-in fade-in duration-300 space-y-6">
                  <TripCardsGrid tripStates={filteredTrips} lastUpdateTime={simulationState.lastUpdateTime} currentTime={simulationState.currentTime} />
                </div>
              )}

              {/* Completed Trips Tab */}
              {activeTab === "completed" && (
                <div className="animate-in fade-in duration-300 space-y-6">
                  <TripCardsGrid tripStates={filteredTrips} lastUpdateTime={simulationState.lastUpdateTime} currentTime={simulationState.currentTime} />
                </div>
              )}

              {/* Alerts Tab */}
              {activeTab === "alerts" && (
                <div className="animate-in fade-in duration-300 space-y-6">
                  {filteredTrips.length === 0 ? (
                    <div className="bg-card rounded-lg border border-border p-8 text-center">
                      <p className="text-muted-foreground">No active alerts</p>
                    </div>
                  ) : (
                    <TripCardsGrid tripStates={filteredTrips} lastUpdateTime={simulationState.lastUpdateTime} currentTime={simulationState.currentTime} />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
