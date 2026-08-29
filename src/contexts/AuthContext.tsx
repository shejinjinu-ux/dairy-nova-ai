import React, { createContext, useContext, useState } from 'react';
import { UserProfile, UserRole, Language } from '../types';
import { authApi } from '../services/api/authApi';
import { getStoredItem, setStoredItem } from '../services/api/apiHelper';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  sendOtp: (mobile: string) => Promise<{ success: boolean; message: string; demoOtp?: string }>;
  verifyOtp: (mobile: string, otp: string) => Promise<{ success: boolean; user: UserProfile | null; isNewUser: boolean }>;
  completeFarmerProfile: (params: { name: string; mobile: string; farmName?: string; farmLocation?: string; language?: Language }) => Promise<UserProfile>;
  loginFarmer: (mobileOrEmail?: string, password?: string) => Promise<void>;
  loginOfficer: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  setUser: (user: UserProfile | null) => void;
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

  const sendOtp = async (mobile: string) => {
    setIsLoading(true);
    try {
      return await authApi.sendOtp(mobile);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (mobile: string, otp: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.verifyOtp(mobile, otp);
      if (res.user) {
        setUser(res.user);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const completeFarmerProfile = async (params: {
    name: string;
    mobile: string;
    farmName?: string;
    farmLocation?: string;
    language?: Language;
  }) => {
    setIsLoading(true);
    try {
      const createdUser = await authApi.completeFarmerProfile(params);
      setUser(createdUser);
      return createdUser;
    } finally {
      setIsLoading(false);
    }
  };

  const loginFarmer = async (mobileOrEmail: string = '9845023456', _password?: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await authApi.loginFarmer(mobileOrEmail);
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

  const logout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setShowLogoutModal(false);
    try {
      await authApi.logout();
      setUser(null);
      setLogoutSuccessToast(true);
      setTimeout(() => {
        setLogoutSuccessToast(false);
      }, 3500);
    } catch (err) {
      console.error('Logout failed:', err);
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
    sendOtp,
    verifyOtp,
    completeFarmerProfile,
    loginFarmer,
    loginOfficer,
    logout,
    updateProfile,
    setUser,
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
