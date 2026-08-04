const express = require('express');
const router = express.Router();
const { createTelemetry, getTelemetry } = require('../controllers/telemetryController');

router.route('/')
  .get(getTelemetry)
  .post(createTelemetry);

module.exports = router;
