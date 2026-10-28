// Creates an error with an HTTP status code.
// Usage: throw createError(400, 'Email is required');
export const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};