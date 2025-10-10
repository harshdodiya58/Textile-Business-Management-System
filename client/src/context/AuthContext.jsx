import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Verify token is not expired
          const decoded = jwtDecode(storedToken);
          if (decoded.exp * 1000 < Date.now()) {
            // Token expired
            logout();
          } else {
            // Set token in axios headers
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            // Get user data
            const response = await api.get('/auth/me');
            setUser(response.data.data);
            setToken(storedToken);
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;

      // Store token
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);

      // Set default auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  const register = async (name, email, password, role = 'staff') => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
      });
      const { token: newToken, user: userData } = response.data;

      // Store token
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);

      // Set default auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/updatepassword', {
        currentPassword,
        newPassword,
      });
      const { token: newToken } = response.data;

      // Update token
      localStorage.setItem('token', newToken);
      setToken(newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password update failed';
      return { success: false, message };
    }
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updatePassword,
    hasRole,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
