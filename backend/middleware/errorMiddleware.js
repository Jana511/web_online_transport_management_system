// ===== 404 handler =====
// Runs when no route matched the request URL
export const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error); // pass the error to errorHandler below
};

// ===== Main error handler =====
// Express knows this is an error handler because it has 4 parameters (err, req, res, next)
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // Use the error's status code, or 500 (server error) if none was set
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message;

  // Mongoose validation error (e.g. phone number in the wrong format)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(', ');
  }

  // Duplicate value in a "unique" field (e.g. email already used)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    message = `This ${field} is already in use`;
  }

  // Invalid MongoDB ObjectId (e.g. /api/students/abc)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Log the error in the terminal so we can debug it
  console.error(`[${statusCode}] ${message}`);

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Something went wrong on the server' : message,
    // Show technical details only while developing, never in production
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};