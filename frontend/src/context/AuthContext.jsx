import { createContext, useContext, useState, useCallback } from 'react';
import { loginRequest } from '../api';
import { disconnectSocket } from '../socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ecohome_token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('ecohome_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [error, setError] = useState('');

  const login = useCallback(async (username, password) => {
    setError('');
    try {
      const data = await loginRequest(username, password);
      localStorage.setItem('ecohome_token', data.token);
      localStorage.setItem('ecohome_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch (err) {
      const message = err?.response?.data?.message || 'No se pudo iniciar sesion';
      setError(message);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ecohome_token');
    localStorage.removeItem('ecohome_user');
    disconnectSocket();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
