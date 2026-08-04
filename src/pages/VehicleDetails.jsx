import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Gauge, Fuel, Thermometer, Zap, Radio, Plus, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { Skeleton } from '../components/common/Skeleton';
import { vehicleApi, telemetryApi } from '../api/fleetApi';
import { MOCK_VEHICLES, MOCK_CHART_SERIES } from '../data/mockData';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ingestion Modal State
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);
  const [telemetryForm, setTelemetryForm] = useState({
    speed: 78,
    fuelLevel: 65,
    engineTemp: 82,
    batteryVoltage: 24.1,
    latitude: 37.7749,
    longitude: -122.4194,
    status: 'Running',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVehicleDetails = async () => {
    setIsLoading(true);
    try {
      const res = await vehicleApi.getVehicleById(id);
      setVehicle(res.data);
      setTelemetryLogs(res.data.recentTelemetry || []);
    } catch (err) {
      console.warn('Fallback to mock details for vehicle:', id);
      const found = MOCK_VEHICLES.find((v) => v.vehicleId === id || v._id === id) || MOCK_VEHICLES[0];
      setVehicle(found);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleDetails();
  }, [id]);

  const handleIngestTelemetry = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await telemetryApi.createTelemetry({
        vehicleId: vehicle?.vehicleId || id,
        ...telemetryForm,
      });
      setIsTelemetryModalOpen(false);
      fetchVehicleDetails();
    } catch (err) {
      // Local optimistic update
      const newLog = {
        _id: Date.now().toString(),
        vehicleId: vehicle?.vehicleId || id,
        ...telemetryForm,
        timestamp: new Date().toISOString(),
      };
      setTelemetryLogs((prev) => [newLog, ...prev]);
      setIsTelemetryModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const latestTelemetry = telemetryLogs[0] || {
    speed: 84.5,
    fuelLevel: 68.2,
    engineTemp: 88.0,
    batteryVoltage: 24.2,
    status: vehicle?.status || 'Running',
  };

  // Prepare series data for Recharts
  const chartData = telemetryLogs.length
    ? [...telemetryLogs]
        .reverse()
        .map((t) => ({
          time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          speed: t.speed,
          fuel: t.fuelLevel,
          temp: t.engineTemp,
        }))
    : MOCK_CHART_SERIES;

  return (
    <DashboardLayout>
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/vehicles')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono text-slate-100">{vehicle?.vehicleId || id}</h1>
              {vehicle && <Badge status={vehicle.status} />}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {vehicle?.make} {vehicle?.model} • Year {vehicle?.year} • Plate {vehicle?.licensePlate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchVehicleDetails} isLoading={isLoading}>
            Refresh Telemetry
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsTelemetryModalOpen(true)}>
            Simulate Telemetry Event
          </Button>
        </div>
      </div>

      {/* Sensor Metrics Gauge Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Speed */}
        <Card className="bg-slate-900/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vehicle Speed</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-3" />
          ) : (
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-blue-400">{latestTelemetry.speed}</span>
              <span className="text-xs text-slate-400">km/h</span>
            </div>
          )}
        </Card>

        {/* Fuel Level */}
        <Card className="bg-slate-900/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fuel / Battery</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Fuel className="w-5 h-5" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-3" />
          ) : (
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-amber-400">{latestTelemetry.fuelLevel}%</span>
              <span className="text-xs text-slate-400">remaining</span>
            </div>
          )}
        </Card>

        {/* Engine Temp */}
        <Card className="bg-slate-900/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Engine Temp</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Thermometer className="w-5 h-5" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-3" />
          ) : (
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-purple-300">{latestTelemetry.engineTemp}°C</span>
              <span className="text-xs text-slate-400">nominal</span>
            </div>
          )}
        </Card>

        {/* Battery Voltage */}
        <Card className="bg-slate-900/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Battery Voltage</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-3" />
          ) : (
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-emerald-400">{latestTelemetry.batteryVoltage}</span>
              <span className="text-xs text-slate-400">Volts DC</span>
            </div>
          )}
        </Card>
      </div>

      {/* Telemetry Stream Chart Section */}
      <Card title="Live Speed & Telemetry Trend" subtitle="Real-time telemetry timeseries values stream">
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="speed" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#speedGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Raw Logs Table */}
      <Card title="Recent Telemetry Packets" subtitle="Ingested GPS and sensor frames">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Speed (km/h)</th>
                <th className="px-4 py-3">Fuel (%)</th>
                <th className="px-4 py-3">Engine Temp</th>
                <th className="px-4 py-3">Voltage</th>
                <th className="px-4 py-3">GPS Coordinates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {telemetryLogs.map((log, idx) => (
                <tr key={log._id || idx} className="hover:bg-slate-850/40">
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-400">{log.speed}</td>
                  <td className="px-4 py-3 text-amber-400">{log.fuelLevel}%</td>
                  <td className="px-4 py-3 text-purple-300">{log.engineTemp}°C</td>
                  <td className="px-4 py-3 text-emerald-400">{log.batteryVoltage} V</td>
                  <td className="px-4 py-3 text-slate-500">
                    {log.latitude?.toFixed(4)}, {log.longitude?.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Ingest Telemetry Modal */}
      <Modal
        isOpen={isTelemetryModalOpen}
        onClose={() => setIsTelemetryModalOpen(false)}
        title={`Simulate Telemetry Packet — ${vehicle?.vehicleId || id}`}
      >
        <form onSubmit={handleIngestTelemetry} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Speed (km/h)"
              name="speed"
              type="number"
              value={telemetryForm.speed}
              onChange={(e) => setTelemetryForm({ ...telemetryForm, speed: Number(e.target.value) })}
              required
            />
            <Input
              label="Fuel Level (%)"
              name="fuelLevel"
              type="number"
              value={telemetryForm.fuelLevel}
              onChange={(e) => setTelemetryForm({ ...telemetryForm, fuelLevel: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Engine Temp (°C)"
              name="engineTemp"
              type="number"
              value={telemetryForm.engineTemp}
              onChange={(e) => setTelemetryForm({ ...telemetryForm, engineTemp: Number(e.target.value) })}
              required
            />
            <Input
              label="Battery Voltage (V)"
              name="batteryVoltage"
              type="number"
              step="0.1"
              value={telemetryForm.batteryVoltage}
              onChange={(e) => setTelemetryForm({ ...telemetryForm, batteryVoltage: Number(e.target.value) })}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="secondary" onClick={() => setIsTelemetryModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Publish Telemetry Frame
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default VehicleDetails;
