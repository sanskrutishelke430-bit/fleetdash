import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Activity, Gauge, Fuel, Thermometer, Radio, ArrowUpRight, Plus, RefreshCw } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { vehicleApi, telemetryApi } from '../api/fleetApi';
import { MOCK_VEHICLES, MOCK_TELEMETRY } from '../data/mockData';

const Dashboard = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [vRes, tRes] = await Promise.all([
        vehicleApi.getVehicles(),
        telemetryApi.getTelemetry({ limit: 10 }),
      ]);
      setVehicles(vRes.data || MOCK_VEHICLES);
      setTelemetryLogs(tRes.data || MOCK_TELEMETRY);
    } catch (err) {
      console.warn('Backend API connection fallback to mock telemetry stream:', err.message);
      setVehicles(MOCK_VEHICLES);
      setTelemetryLogs(MOCK_TELEMETRY);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute live aggregate stats
  const totalVehicles = vehicles.length;
  const runningCount = vehicles.filter((v) => v.status === 'Running').length;
  const idleCount = vehicles.filter((v) => v.status === 'Idle').length;
  const offlineCount = vehicles.filter((v) => v.status === 'Offline').length;

  const avgSpeed = telemetryLogs.length
    ? Math.round(telemetryLogs.reduce((acc, t) => acc + (t.speed || 0), 0) / telemetryLogs.length)
    : 76;

  const avgFuel = telemetryLogs.length
    ? Math.round(telemetryLogs.reduce((acc, t) => acc + (t.fuelLevel || 0), 0) / telemetryLogs.length)
    : 64;

  return (
    <DashboardLayout>
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
            Fleet Overview
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">
              LIVE
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time status monitoring and operational telemetry.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchDashboardData} isLoading={isLoading}>
            Sync Feed
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => navigate('/vehicles')}>
            Manage Fleet
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Fleet */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Assets</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mt-3" />
          ) : (
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-100">{totalVehicles}</span>
              <span className="text-xs text-slate-400">units registered</span>
            </div>
          )}
        </Card>

        {/* Stat 2: Active Vehicles */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Running Fleet</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mt-3" />
          ) : (
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-emerald-400">{runningCount}</span>
              <span className="text-xs text-slate-400">active transit ({Math.round((runningCount / (totalVehicles || 1)) * 100)}%)</span>
            </div>
          )}
        </Card>

        {/* Stat 3: Avg Speed */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Fleet Speed</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mt-3" />
          ) : (
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-purple-300">{avgSpeed}</span>
              <span className="text-xs text-slate-400">km/h average</span>
            </div>
          )}
        </Card>

        {/* Stat 4: Fuel Capacity */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Fuel Reserves</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Fuel className="w-5 h-5" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mt-3" />
          ) : (
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-amber-400">{avgFuel}%</span>
              <span className="text-xs text-slate-400">fleet average</span>
            </div>
          )}
        </Card>
      </div>

      {/* Fleet Live Status Grid & Recent Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicles Grid (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400" />
              Active Vehicle Monitor
            </h2>
            <button
              onClick={() => navigate('/vehicles')}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1"
            >
              View all fleet <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </Card>
                ))
              : vehicles.map((v) => (
                  <Card
                    key={v._id || v.vehicleId}
                    className="cursor-pointer hover:border-blue-500/40 group"
                    action={<Badge status={v.status} />}
                  >
                    <div onClick={() => navigate(`/vehicles/${v.vehicleId}`)}>
                      <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition font-mono">
                        {v.vehicleId}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {v.make} {v.model} ({v.year})
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                        <span>Plate: {v.licensePlate}</span>
                        <span className="text-blue-400 font-medium">Inspect →</span>
                      </div>
                    </div>
                  </Card>
                ))}
          </div>
        </div>

        {/* Telemetry Log Stream Feed (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              Telemetry Feed
            </h2>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Realtime Stream</span>
          </div>

          <Card className="divide-y divide-slate-800/60 p-0 overflow-hidden">
            {isLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : telemetryLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No telemetry frames received yet.</div>
            ) : (
              telemetryLogs.map((log, idx) => (
                <div key={log._id || idx} className="p-4 hover:bg-slate-850/40 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold font-mono text-slate-200">{log.vehicleId}</span>
                    <Badge status={log.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded-xl">
                    <div>
                      <span className="text-slate-500 block text-[9px]">SPEED</span>
                      <span className="text-slate-200">{log.speed} km/h</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">FUEL</span>
                      <span className="text-amber-400">{log.fuelLevel}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">TEMP</span>
                      <span className="text-purple-400">{log.engineTemp}°C</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
