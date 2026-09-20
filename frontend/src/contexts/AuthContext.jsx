import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { DEMO_CREDENTIALS } from '../constants/demoCredentials';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('upteky_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('upteky_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user profile on initial load if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data && res.data.data) {
            setUser(res.data.data);
            localStorage.setItem('upteky_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.error('Session expired or invalid token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const authData = res.data.data;
      const accessToken = authData.access_token;

      localStorage.setItem('upteky_token', accessToken);
      setToken(accessToken);

      // Fetch profile
      const profileRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userData = profileRes.data.data;
      setUser(userData);
      localStorage.setItem('upteky_user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Authentication failed';
      return { success: false, error: msg };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Registration failed';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('upteky_token');
    localStorage.removeItem('upteky_user');
    setUser(null);
    setToken(null);
  };

  const demoLogin = async (roleKey) => {
    const creds = DEMO_CREDENTIALS[roleKey];
    if (!creds) return;
    return await login(creds.email, creds.password);
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to dispatch password recovery';
      return { success: false, error: msg };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const res = await api.post('/auth/reset-password', { token, new_password: newPassword });
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password';
      return { success: false, error: msg };
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      const res = await api.post('/auth/verify-email', { email, code });
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired verification code';
      return { success: false, error: msg };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      const updated = res.data.data;
      setUser(updated);
      localStorage.setItem('upteky_user', JSON.stringify(updated));
      return { success: true, user: updated };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      return { success: false, error: msg };
    }
  };

  const hasRole = (allowedRoles) => {
    if (!user || !user.role) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role);
    }
    return user.role === allowedRoles;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        demoLogin,
        forgotPassword,
        resetPassword,
        verifyEmail,
        updateProfile,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: null,
      loading: true,
      isAuthenticated: false,
      login: async () => ({ success: false }),
      register: async () => ({ success: false }),
      logout: () => {},
      demoLogin: async () => ({ success: false }),
      forgotPassword: async () => ({ success: false }),
      resetPassword: async () => ({ success: false }),
      verifyEmail: async () => ({ success: false }),
      updateProfile: async () => ({ success: false }),
      hasRole: () => false,
    };
  }
  return context;
};
