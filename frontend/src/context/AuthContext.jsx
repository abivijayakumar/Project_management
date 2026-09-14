import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify session on initial mount
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await authService.getMe();
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch {
          // Token invalid or expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await authService.login({ email, password });
      const { user: loggedInUser, token: receivedToken } = response.data;
      
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      
      setToken(receivedToken);
      setUser(loggedInUser);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    setError(null);
    try {
      const response = await authService.register({ fullName, email, password });
      const { user: registeredUser, token: receivedToken } = response.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(registeredUser));

      setToken(receivedToken);
      setUser(registeredUser);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setError(null);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    error,
    login,
    register,
    logout,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
