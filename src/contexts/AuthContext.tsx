import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { authApi } from '../services/api/authApi';
import { INITIAL_USER, OFFICER_USER } from '../mocks/mockData';
import { getStoredItem } from '../services/api/apiHelper';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  loginFarmer: (mobileOrEmail?: string, password?: string) => Promise<void>;
  loginOfficer: () => Promise<void>;
  register: (data: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  showLogoutModal: boolean;
  setShowLogoutModal: (show: boolean) => void;
  logoutSuccessToast: boolean;
  setLogoutSuccessToast: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    return getStoredItem<UserProfile | null>('active_user', null);
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [logoutSuccessToast, setLogoutSuccessToast] = useState<boolean>(false);

  const loginFarmer = async (mobileOrEmail: string = '9845023456', password?: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await authApi.loginFarmer(mobileOrEmail, password);
      setUser(loggedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const loginOfficer = async () => {
    setIsLoading(true);
    try {
      const officer = await authApi.loginOfficer();
      setUser(officer);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      const newUser = await authApi.registerUser(data);
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    setShowLogoutModal(false);
    try {
      await authApi.logout();
      setUser(null);
      setLogoutSuccessToast(true);
      setTimeout(() => {
        setLogoutSuccessToast(false);
      }, 4000);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = await authApi.updateUserProfile(data);
    setUser(updated);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    role: user ? user.role : null,
    isLoading,
    isLoggingOut,
    loginFarmer,
    loginOfficer,
    register,
    logout,
    updateProfile,
    showLogoutModal,
    setShowLogoutModal,
    logoutSuccessToast,
    setLogoutSuccessToast,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
