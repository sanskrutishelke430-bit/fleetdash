import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, Truck, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { vehicleApi } from '../api/fleetApi';
import { MOCK_VEHICLES } from '../data/mockData';

const Vehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    vehicleId: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    status: 'Offline',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const res = await vehicleApi.getVehicles(statusFilter !== 'All' ? { status: statusFilter } : {});
      setVehicles(res.data || MOCK_VEHICLES);
    } catch (err) {
      console.warn('Backend connection fallback to mock data:', err.message);
      let filtered = MOCK_VEHICLES;
      if (statusFilter !== 'All') {
        filtered = MOCK_VEHICLES.filter((v) => v.status === statusFilter);
      }
      setVehicles(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [statusFilter]);

  const handleOpenAddModal = () => {
    setEditingVehicle(null);
    setFormData({
      vehicleId: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      status: 'Offline',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleId: vehicle.vehicleId,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      status: vehicle.status,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.vehicleId || !formData.make || !formData.model || !formData.licensePlate) {
      setFormError('Please fill out all required vehicle information fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingVehicle) {
        await vehicleApi.updateVehicle(editingVehicle._id || editingVehicle.vehicleId, formData);
      } else {
        await vehicleApi.createVehicle(formData);
      }
      setIsModalOpen(false);
      fetchVehicles();
    } catch (err) {
      // Local fallback for offline demo testing
      if (editingVehicle) {
        setVehicles((prev) =>
          prev.map((v) => (v.vehicleId === editingVehicle.vehicleId ? { ...v, ...formData } : v))
        );
      } else {
        setVehicles((prev) => [{ ...formData, _id: Date.now().toString() }, ...prev]);
      }
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!deleteConfirmId) return;
    try {
      await vehicleApi.deleteVehicle(deleteConfirmId);
    } catch (err) {
      console.warn('Fallback deleting locally:', err.message);
    } finally {
      setVehicles((prev) => prev.filter((v) => v.vehicleId !== deleteConfirmId && v._id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  // Table Columns Definition
  const columns = [
    {
      header: 'Vehicle ID',
      accessor: 'vehicleId',
      sortable: true,
      render: (row) => (
        <span
          onClick={() => navigate(`/vehicles/${row.vehicleId}`)}
          className="font-mono font-bold text-blue-400 hover:underline cursor-pointer"
        >
          {row.vehicleId}
        </span>
      ),
    },
    {
      header: 'Make & Model',
      accessor: 'make',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-200">
            {row.make} {row.model}
          </div>
          <div className="text-xs text-slate-500 font-mono">Year {row.year}</div>
        </div>
      ),
    },
    {
      header: 'License Plate',
      accessor: 'licensePlate',
      sortable: true,
      render: (row) => <span className="font-mono text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">{row.licensePlate}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/vehicles/${row.vehicleId}`)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-blue-400 hover:bg-slate-750 transition"
            title="Inspect Telemetry"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-750 transition"
            title="Edit Vehicle"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteConfirmId(row.vehicleId || row._id)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-slate-750 transition"
            title="Delete Vehicle"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const filterTabs = ['All', 'Running', 'Idle', 'Offline'];

  return (
    <DashboardLayout>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-400" />
            Fleet Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage vehicles, license plates, and operational statuses.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
          Register New Vehicle
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === tab
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Datagrid Table */}
      <Table
        columns={columns}
        data={vehicles}
        isLoading={isLoading}
        searchPlaceholder="Search by ID, Make, Model or Plate..."
        emptyMessage="No matching vehicles registered."
      />

      {/* Add/Edit Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVehicle ? `Edit Vehicle (${editingVehicle.vehicleId})` : 'Register New Vehicle'}
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {formError}
          </div>
        )}
        <form onSubmit={handleSaveVehicle} className="space-y-4">
          <Input
            label="Vehicle ID (Unique Code)"
            name="vehicleId"
            placeholder="e.g. TRUCK-105"
            value={formData.vehicleId}
            onChange={handleFormChange}
            disabled={!!editingVehicle}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Make / Manufacturer"
              name="make"
              placeholder="Volvo, Ford, Tesla..."
              value={formData.make}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Model Name"
              name="model"
              placeholder="FH16, Transit, Semi..."
              value={formData.model}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Manufacturing Year"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleFormChange}
              required
            />
            <Input
              label="License Plate"
              name="licensePlate"
              placeholder="FL-882-99"
              value={formData.licensePlate}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Initial Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Running">Running</option>
              <option value="Idle">Idle</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              {editingVehicle ? 'Update Vehicle' : 'Save & Register'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Asset Deletion"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p>
              Are you sure you want to delete vehicle <strong>{deleteConfirmId}</strong>? This operation also purges its historical telemetry records.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteVehicle}>
              Yes, Delete Vehicle
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Vehicles;
