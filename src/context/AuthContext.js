// admin/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('vvm_admin_user');
    const token = localStorage.getItem('vvm_admin_token');
    if (stored && token) {
      try { setAdmin(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await apiLogin({ username, password });
    localStorage.setItem('vvm_admin_token', res.token);
    localStorage.setItem('vvm_admin_user', JSON.stringify(res.admin));
    setAdmin(res.admin);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('vvm_admin_token');
    localStorage.removeItem('vvm_admin_user');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
