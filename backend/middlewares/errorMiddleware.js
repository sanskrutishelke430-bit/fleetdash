/**
 * Centralized Error Handling Middleware for FleetDash API.
 * Intercepts all unhandled controller exceptions and formats standard JSON error responses.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose CastError (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found with ID: ${err.value}`;
  }

  // Handle Mongoose ValidationError (e.g., missing required fields, invalid enum)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Handle Mongoose Duplicate Key Error (e.g., vehicleId or licensePlate already exists)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered: ${field} must be unique (${err.keyValue[field]})`;
  }

  console.error(`[API Error] ${req.method} ${req.originalUrl} - Status ${statusCode}: ${message}`);

  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

/**
 * 404 Not Found Middleware for undefined API routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFoundHandler };
