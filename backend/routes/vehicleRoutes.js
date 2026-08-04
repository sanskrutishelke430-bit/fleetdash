const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');

// Map REST verbs to Controller Methods
router.route('/')
  .get(getVehicles)
  .post(createVehicle);

router.route('/:id')
  .get(getVehicleById)
  .put(updateVehicle)
  .delete(deleteVehicle);

module.exports = router;
