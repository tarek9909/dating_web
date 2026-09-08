import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, setAccessToken, getAccessToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    if (!getAccessToken()) {
      setLoading(false);
      return;
    }

    try {
      const res = await apiRequest('/auth/me');
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
        setAccessToken(null);
      }
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error('Login failed');
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  const updateUser = (fields) => {
    setUser((prev) => (prev ? { ...prev, ...fields } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loading,
        login,
        logout,
        refreshUser,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
