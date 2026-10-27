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
  const statusCode = err.statusCode || err.status || 500;

  // Log the error in the terminal so we can debug it
  console.error(`[${statusCode}] ${err.message}`);

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Something went wrong on the server' : err.message,
    // Show technical details only while developing, never in production
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};