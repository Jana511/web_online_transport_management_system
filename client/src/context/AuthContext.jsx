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

  // role = which login tab was used ("parent", "driver" or "admin")
  const login = async (email, password, role) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password, role },
    });
    saveSession(data);
    return data.user;
  };

  // role = "parent" or "driver". Drivers get no token until the admin approves them.
  const register = async ({ fullName, email, phone, password, role }) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: { fullName, email, phone, password, role },
    });
    if (data.token) {
      saveSession(data); // parents are logged in straight away
    }
    return data; // { message, user, token? }
  };

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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);