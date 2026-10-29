import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

// Custom hook: returns a request function that
//  1. automatically adds the logged-in user's token
//  2. logs the user out if the token has expired (401)
// Usage: const request = useApi();  const data = await request('/vans');
export const useApi = () => {
  const { token, logout } = useAuth();

  return useCallback(
    async (endpoint, options = {}) => {
      try {
        return await apiRequest(endpoint, { ...options, token });
      } catch (error) {
        if (error.status === 401) {
          logout(); // ProtectedRoute then sends them to the login page
        }
        throw error;
      }
    },
    [token, logout]
  );
};