const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const vehicleRoutes = require('./routes/vehicleRoutes');
const telemetryRoutes = require('./routes/telemetryRoutes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorMiddleware');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express Application
const app = express();

const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Parse JSON Body
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FleetDash Backend API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Root Route
app.get('/', (req, res) => {
  res.send('FleetDash Telemetry API Gateway');
});

// Mount Application Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/telemetry', telemetryRoutes);

// Register 404 Route Handler
app.use(notFoundHandler);

// Register Global Error Handling Middleware
app.use(errorHandler);

// Start Express Server
app.listen(PORT, () => {
  console.log(`[FleetDash Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
