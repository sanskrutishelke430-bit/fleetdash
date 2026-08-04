const Telemetry = require('../models/Telemetry');
const Vehicle = require('../models/Vehicle');
const asyncHandler = require('../middlewares/asyncHandler');

/**
 * @desc    Ingest telemetry data point from a vehicle
 * @route   POST /api/telemetry
 * @access  Public
 */
const createTelemetry = asyncHandler(async (req, res) => {
  const {
    vehicleId,
    latitude,
    longitude,
    speed,
    fuelLevel,
    engineTemp,
    batteryVoltage,
    status,
    timestamp,
  } = req.body;

  if (!vehicleId) {
    res.status(400);
    throw new Error('vehicleId is required to record telemetry');
  }

  // Find target vehicle by string ID
  const vehicle = await Vehicle.findOne({ vehicleId: vehicleId.toUpperCase() });

  if (!vehicle) {
    res.status(404);
    throw new Error(`Cannot post telemetry. Vehicle '${vehicleId}' does not exist in registry.`);
  }

  // Create Telemetry Document
  const telemetry = await Telemetry.create({
    vehicle: vehicle._id,
    vehicleId: vehicle.vehicleId,
    latitude,
    longitude,
    speed,
    fuelLevel,
    engineTemp,
    batteryVoltage,
    status: status || vehicle.status,
    timestamp: timestamp || Date.now(),
  });

  // Automatically update current vehicle status in Vehicle master record
  if (status && vehicle.status !== status) {
    vehicle.status = status;
    await vehicle.save();
  }

  res.status(201).json({
    success: true,
    message: 'Telemetry recorded successfully',
    data: telemetry,
  });
});

/**
 * @desc    Get telemetry history logs
 * @route   GET /api/telemetry
 * @access  Public
 */
const getTelemetry = asyncHandler(async (req, res) => {
  const { vehicleId, limit = 50 } = req.query;
  const filter = {};

  if (vehicleId) {
    filter.vehicleId = vehicleId.toUpperCase();
  }

  const logs = await Telemetry.find(filter)
    .sort({ timestamp: -1 })
    .limit(Number(limit))
    .populate('vehicle', 'make model licensePlate');

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs,
  });
});

module.exports = {
  createTelemetry,
  getTelemetry,
};
