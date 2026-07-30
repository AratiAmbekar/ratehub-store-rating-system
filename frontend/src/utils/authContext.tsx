import React, { createContext, useContext, useState, useEffect } from 'react';
import { request } from './api';
import type { ApiResponse } from './api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  address: string;
  role: 'ADMIN' | 'NORMAL_USER' | 'STORE_OWNER';
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<ApiResponse>;
  registerUser: (name: string, email: string, password: string, address: string) => Promise<ApiResponse>;
  logout: () => Promise<void>;
  updatePassword: (password: string) => Promise<ApiResponse>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async () => {
    setLoading(true);
    setError(null);
    const res = await request<{ user: UserProfile }>('/auth/me');
    if (res.data) {
      setUser(res.data.user);
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<ApiResponse> => {
    setError(null);
    const res = await request<{ user: UserProfile }>('/auth/login', 'POST', { email, password });
    if (res.data) {
      setUser(res.data.user);
    }
    return res;
  };

  const registerUser = async (
    name: string,
    email: string,
    password: string,
    address: string
  ): Promise<ApiResponse> => {
    setError(null);
    const res = await request<{ user: UserProfile }>('/auth/register', 'POST', {
      name,
      email,
      password,
      address,
    });
    if (res.data) {
      setUser(res.data.user);
    }
    return res;
  };

  const logout = async () => {
    await request('/auth/logout', 'POST');
    setUser(null);
  };

  const updatePassword = async (password: string): Promise<ApiResponse> => {
    return await request('/auth/update-password', 'PUT', { password });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        registerUser,
        logout,
        updatePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
