import { createContext, useCallback, useContext, useState } from 'react';
import { apiRequest } from '../services/api';

const AuthContext = createContext(null);

// Read the saved user from the browser (if any)
const getStoredUser = () => {
  try {
    const saved = localStorage.getItem('schoolride_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

// AuthProvider wraps the whole app and shares the login state with every page
export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('schoolride_token'));

  // Save the token and user after login or register
  const saveSession = (data) => {
    localStorage.setItem('schoolride_token', data.token);
    localStorage.setItem('schoolride_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const login = async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    saveSession(data);
    return data.user;
  };

  const register = async ({ fullName, email, phone, password }) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: { fullName, email, phone, password },
    });
    saveSession(data);
    return data.user;
  };

  // useCallback keeps the same function between renders
  const logout = useCallback(() => {
    localStorage.removeItem('schoolride_token');
    localStorage.removeItem('schoolride_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Any component can call useAuth() to get the user, token, login, register and logout
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);