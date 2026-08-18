# 🚚 Fleet Tracker - Real-time Vehicle Monitoring System

A modern, real-time fleet tracking and monitoring system built with Next.js, featuring live vehicle updates, trip management, and comprehensive analytics.

![Fleet Tracker](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwind-css)

## 📽️ Demo
- 🌐 Live Demo: https://fleet-tracking-dashboard-blush.vercel.app
---

## ✨ Features

### 🎯 Core Features

- **Real-time Vehicle Tracking**: Monitor vehicle locations, speed, and status with smooth 60fps updates
- **Interactive Map Visualization**: View fleet locations on an interactive Leaflet map with live updates
- **Trip Management**: Track active, completed, and cancelled trips with detailed metrics
- **Live Simulation**: Playback historical trip data with adjustable speed (1x, 5x, 10x)
- **Alert System**: Real-time toast notifications for alerts and trip completions
- **Comprehensive Analytics**: Fleet overview with distance, speed, battery, and alert metrics

### 📊 Dashboard Components

#### Fleet Overview
- Active, completed, and cancelled trip counts
- Total distance traveled across all vehicles
- Average speed and battery levels
- Real-time alert monitoring
- Smooth animated metric updates

#### Trip Cards
- Individual trip details with progress tracking
- Real-time updates for distance, speed, battery, and location
- Expandable detail views with timeline information
- Visual pulse indicators for recent updates
- Alert badges for active warnings
- Independent expand/collapse (multiple cards can be open)

#### Interactive Map
- Real-time vehicle position updates
- Vehicle heading indicators
- Color-coded status (active, completed, cancelled)
- Clickable markers with trip details
- Auto-zoom to fit all vehicles

#### Simulation Controls
- Play/Pause functionality
- Speed adjustment (1x, 5x, 10x)
- Reset simulation
- Progress bar showing 24-hour simulation timeline
- Live simulation time counter

### 🎨 User Experience

- **Smooth Animations**: 60fps updates with interpolated transitions
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Mode Support**: Optimized for dark theme
- **Visual Feedback**: Pulse effects, hover states, and loading indicators
- **Tab Navigation**: Filter trips by status (All, Active, Completed, Alerts)

## 🏗️ Technical Architecture

### Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 18
- **Styling**: Tailwind CSS 4
- **Maps**: Leaflet.js
- **State Management**: React Hooks (useState, useEffect, useRef)
- **Animation**: CSS Transitions + requestAnimationFrame
- **Analytics**: Vercel Analytics

### Project Structure

```
fleet-tracker/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles
├── components/
│   ├── dashboard-header.tsx        # Header with time and progress
│   ├── simulation-controls.tsx     # Play/pause/speed controls
│   ├── fleet-overview.tsx          # Metrics overview
│   ├── trip-cards-grid.tsx         # Grid of trip cards
│   ├── trip-card.tsx               # Individual trip card
│   ├── trip-details-expanded.tsx   # Expanded trip details
│   ├── interactive-leaflet-map.tsx # Leaflet map integration
│   ├── filtered-tabs.tsx           # Tab navigation
│   └── ui/                         # Reusable UI components
├── lib/
│   ├── fleet-engine.ts             # Core fleet tracking logic
│   ├── simulation-controller.ts    # Animation frame controller
│   ├── simulation-state-manager.ts # State management
│   └── real-time-event-generator.ts # Event generation
├── public/
│   └── data/                  # JSON trip data files
└── hooks/
    └── use-toast.ts                # Toast notification hook
```

### Key Components

#### FleetTrackingEngine
- Processes trip events incrementally
- Maintains trip state (location, speed, battery, alerts)
- Validates coordinates and data integrity
- Supports reset and time advancement

#### SimulationController
- Manages animation frame loop at 60fps
- Handles playback speed (1x, 5x, 10x)
- Provides play/pause/reset functionality
- Calculates time deltas for smooth updates

#### SimulationStateManager
- Bridges controller and engine
- Notifies subscribers of state changes
- Manages simulation progress tracking
- Handles event processing coordination

### Performance Optimizations

1. **Unified State Updates**: Single atomic state update prevents React batching delays
2. **Animation Frame Management**: Independent 60fps loops for smooth interpolation
3. **Incremental Event Processing**: Only processes new events since last update
4. **Memoized Calculations**: Refs used for intermediate animation values
5. **Efficient Re-renders**: Controlled components with minimal prop changes

### Data Flow

```
SimulationController (60fps)
    ↓
SimulationStateManager
    ↓
FleetTrackingEngine (processes events)
    ↓
React State Update (atomic)
    ↓
Components Re-render
    ↓
Animation Frames (smooth interpolation)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AnujKV123/fleet-tracking-dashboard.git
cd fleet-tracker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm run start
```

### Running Tests

```bash
npm run test
```

## 📁 Data Format

Trip data is stored in JSON format in `public/trip-data/`. Each trip file contains an array of events:

```json
[
  {
    "event_id": "evt_001",
    "event_type": "trip_started",
    "timestamp": "2025-11-03T08:00:00.000Z",
    "vehicle_id": "VEH-001",
    "trip_id": "TRIP-001",
    "location": {
      "lat": 28.6139,
      "lng": 77.2090
    },
    "movement": {
      "speed_kmh": 0,
      "heading_degrees": 0,
      "moving": false
    },
    "device": {
      "battery_level": 100,
      "charging": false
    }
  }
]
```

### Event Types

- `trip_started`: Trip initialization
- `location_ping`: Regular position update
- `trip_completed`: Trip finished successfully
- `trip_cancelled`: Trip cancelled
- `speed_violation`: Speed limit exceeded
- `battery_low`: Low battery warning
- `fuel_level_low`: Low fuel warning
- `signal_lost`: GPS signal lost
- `signal_recovered`: GPS signal restored

## 🎮 Usage

### Basic Operations

 - **Start Simulation**: Click the Play button
 - **Adjust Speed**: Select 1x, 5x, or 10x playback speed
 - **Pause**: Click the Pause button
 - **Reset**: Click Reset to restart from beginning
 - **View Details**: Click "View Details" on any trip card
 - **Filter Trips**: Use tabs to filter by All, Active, Completed, or Alerts

## 📈 Future Enhancements

- [ ] Historical playback with date picker
- [ ] Export trip data to CSV/PDF
- [ ] Custom alert rules and thresholds
- [ ] Multi-language support
- [ ] Keyboard shortcuts
- [ ] Route replay with polylines
- [ ] Geofencing and zone management
- [ ] Driver behavior analytics
- [ ] Fuel consumption tracking
- [ ] Maintenance scheduling

---

Made with ❤️ using Next.js and TypeScript
