const mongoose = require('mongoose');

/**
 * Vehicle Schema Definition
 * Represents a registered vehicle asset in the fleet.
 */
const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: [true, 'Vehicle ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    make: {
      type: String,
      required: [true, 'Vehicle make is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Vehicle year is required'],
      min: [1990, 'Year must be 1990 or newer'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the far future'],
    },
    licensePlate: {
      type: String,
      required: [true, 'License plate is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Running', 'Idle', 'Offline'],
        message: '{VALUE} is not a valid vehicle status',
      },
      default: 'Offline',
      index: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
