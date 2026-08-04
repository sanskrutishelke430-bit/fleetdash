/**
 * Higher-order function to wrap async Express route handlers.
 * Catches rejected promises and forwards errors to the global error middleware via next().
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
