const Vehicle = require('../models/Vehicle');
const Telemetry = require('../models/Telemetry');
const asyncHandler = require('../middlewares/asyncHandler');

/**
 * @desc    Get all vehicles (with optional status filtering)
 * @route   GET /api/vehicles
 * @access  Public
 */
const getVehicles = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const filter = {};

  if (status && ['Running', 'Idle', 'Offline'].includes(status)) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { vehicleId: { $regex: search, $options: 'i' } },
      { make: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } },
      { licensePlate: { $regex: search, $options: 'i' } },
    ];
  }

  const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: vehicles.length,
    data: vehicles,
  });
});

/**
 * @desc    Get vehicle details by Vehicle ID or Mongo ObjectId
 * @route   GET /api/vehicles/:id
 * @access  Public
 */
const getVehicleById = asyncHandler(async (req, res) => {
  const paramId = req.params.id;

  // Search by either vehicleId (string business key) or Mongo _id
  let vehicle = await Vehicle.findOne({
    $or: [{ vehicleId: paramId.toUpperCase() }, { _id: paramId.match(/^[0-9a-fA-F]{24}$/) ? paramId : null }],
  });

  if (!vehicle) {
    res.status(404);
    throw new Error(`Vehicle not found with ID: ${paramId}`);
  }

  // Fetch recent telemetry logs for this vehicle (latest 10)
  const recentTelemetry = await Telemetry.find({ vehicleId: vehicle.vehicleId })
    .sort({ timestamp: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    data: {
      ...vehicle.toObject(),
      recentTelemetry,
    },
  });
});

/**
 * @desc    Create a new vehicle
 * @route   POST /api/vehicles
 * @access  Public
 */
const createVehicle = asyncHandler(async (req, res) => {
  const { vehicleId, make, model, year, licensePlate, status } = req.body;

  // Validate presence of core fields
  if (!vehicleId || !make || !model || !year || !licensePlate) {
    res.status(400);
    throw new Error('Please provide vehicleId, make, model, year, and licensePlate');
  }

  // Create Vehicle Document
  const vehicle = await Vehicle.create({
    vehicleId,
    make,
    model,
    year,
    licensePlate,
    status: status || 'Offline',
  });

  res.status(201).json({
    success: true,
    message: 'Vehicle created successfully',
    data: vehicle,
  });
});

/**
 * @desc    Update vehicle details
 * @route   PUT /api/vehicles/:id
 * @access  Public
 */
const updateVehicle = asyncHandler(async (req, res) => {
  const paramId = req.params.id;

  let vehicle = await Vehicle.findOne({
    $or: [{ vehicleId: paramId.toUpperCase() }, { _id: paramId.match(/^[0-9a-fA-F]{24}$/) ? paramId : null }],
  });

  if (!vehicle) {
    res.status(404);
    throw new Error(`Vehicle not found with ID: ${paramId}`);
  }

  vehicle = await Vehicle.findByIdAndUpdate(vehicle._id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Vehicle updated successfully',
    data: vehicle,
  });
});

/**
 * @desc    Delete vehicle
 * @route   DELETE /api/vehicles/:id
 * @access  Public
 */
const deleteVehicle = asyncHandler(async (req, res) => {
  const paramId = req.params.id;

  const vehicle = await Vehicle.findOne({
    $or: [{ vehicleId: paramId.toUpperCase() }, { _id: paramId.match(/^[0-9a-fA-F]{24}$/) ? paramId : null }],
  });

  if (!vehicle) {
    res.status(404);
    throw new Error(`Vehicle not found with ID: ${paramId}`);
  }

  // Delete associated telemetry logs
  await Telemetry.deleteMany({ vehicleId: vehicle.vehicleId });
  await Vehicle.findByIdAndDelete(vehicle._id);

  res.status(200).json({
    success: true,
    message: `Vehicle ${vehicle.vehicleId} and its telemetry history were deleted successfully`,
  });
});

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
