const mongoose = require('mongoose');

/**
 * Telemetry Schema Definition
 * Stores real-time stream snapshots sent by fleet vehicles.
 */
const telemetrySchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Associated Mongo Vehicle ObjectId reference is required'],
      index: true,
    },
    vehicleId: {
      type: String,
      required: [true, 'Vehicle String ID is required'],
      trim: true,
      uppercase: true,
      index: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude coordinate is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude coordinate is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
    },
    speed: {
      type: Number,
      required: [true, 'Speed is required'],
      min: [0, 'Speed cannot be negative'],
    },
    fuelLevel: {
      type: Number,
      required: [true, 'Fuel level is required'],
      min: [0, 'Fuel level cannot be less than 0%'],
      max: [100, 'Fuel level cannot exceed 100%'],
    },
    engineTemp: {
      type: Number,
      required: [true, 'Engine temperature is required'],
    },
    batteryVoltage: {
      type: Number,
      required: [true, 'Battery voltage is required'],
      min: [0, 'Battery voltage cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['Running', 'Idle', 'Offline'],
        message: '{VALUE} is not a valid telemetry status',
      },
      default: 'Running',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Index for High-Performance Time-Series Queries per Vehicle
telemetrySchema.index({ vehicleId: 1, timestamp: -1 });

const Telemetry = mongoose.model('Telemetry', telemetrySchema);

module.exports = Telemetry;
