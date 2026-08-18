"use client"

import { Button } from "@/components/ui/button"
import type { TripState } from "@/lib/fleet-engine"

interface FilteredTabsProps {
  activeTab: "all" | "active" | "completed" | "alerts"
  onTabChange: (tab: "all" | "active" | "completed" | "alerts") => void
  tripStates: TripState[]
}

export default function FilteredTabs({ activeTab, onTabChange, tripStates }: FilteredTabsProps) {
  const activeCount = tripStates.filter((t) => t.status === "active").length
  const completedCount = tripStates.filter((t) => t.status === "completed").length
  const alertCount = tripStates.filter((t) => t.alerts.length > 0).length

  const tabs = [
    { id: "all" as const, label: "All Trips", count: tripStates.length },
    { id: "active" as const, label: "Active", count: activeCount, highlight: activeCount > 0 },
    { id: "completed" as const, label: "Completed", count: completedCount },
    { id: "alerts" as const, label: "Alerts", count: alertCount, highlight: alertCount > 0 },
  ]

  return (
    <div className="flex gap-0 border-b border-border overflow-x-auto">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          variant={activeTab === tab.id ? "default" : "ghost"}
          className={`px-6 py-3 rounded-none border-b-2 whitespace-nowrap transition-all ${
            activeTab === tab.id
              ? "border-primary text-primary bg-primary/5"
              : tab.highlight
                ? "border-transparent text-accent hover:text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.label}
          <span className="ml-2 px-2 py-0.5 bg-muted rounded-full text-xs font-semibold">{tab.count}</span>
        </Button>
      ))}
    </div>
  )
}
