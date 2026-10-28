// Base address of the backend API (from client/.env)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Sends a request to the backend and returns the JSON reply.
// Usage: await apiRequest('/auth/login', { method: 'POST', body: { email, password } })
export const apiRequest = async (endpoint, { method = 'GET', body, token } = {}) => {
  const headers = { 'Content-Type': 'application/json' };

  // Attach the login token if we have one
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch fails like this when the backend is not running
    throw new Error('Cannot reach the server. Please make sure the backend is running.');
  }

  // Read the JSON reply (or an empty object if there is none)
  const data = await response.json().catch(() => ({}));

  // response.ok is false for status codes like 400, 401, 403, 409, 500
  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong. Please try again.');
    error.status = response.status;
    throw error;
  }

  return data;
};