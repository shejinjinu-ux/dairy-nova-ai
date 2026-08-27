import { delay, getStoredItem, setStoredItem } from './apiHelper';
import { UserProfile, UserRole } from '../../types';
import { INITIAL_USER, OFFICER_USER } from '../../mocks/mockData';

export const authApi = {
  async getCurrentUser(): Promise<UserProfile | null> {
    await delay(200);
    return getStoredItem<UserProfile | null>('active_user', null);
  },

  async loginFarmer(mobileOrEmail: string, _password?: string): Promise<UserProfile> {
    await delay(600);
    const user: UserProfile = {
      ...INITIAL_USER,
      mobile: mobileOrEmail.includes('@') ? INITIAL_USER.mobile : mobileOrEmail,
      email: mobileOrEmail.includes('@') ? mobileOrEmail : INITIAL_USER.email,
    };
    setStoredItem('active_user', user);
    return user;
  },

  async loginOfficer(_mobileOrEmail?: string, _password?: string): Promise<UserProfile> {
    await delay(600);
    setStoredItem('active_user', OFFICER_USER);
    return OFFICER_USER;
  },

  async registerUser(data: Partial<UserProfile>): Promise<UserProfile> {
    await delay(700);
    const newUser: UserProfile = {
      id: `farmer-${Date.now()}`,
      name: data.name || 'Dairy Farmer',
      mobile: data.mobile || '+91 98000 00000',
      email: data.email || 'farmer@dairy.com',
      farmName: data.farmName || 'My Dairy Farm',
      farmLocation: data.farmLocation || 'Tamil Nadu, India',
      role: 'farmer',
      language: data.language || 'en',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      totalAnimals: 0,
      memberSince: 'August 2026',
    };
    setStoredItem('active_user', newUser);
    return newUser;
  },

  async requestPasswordReset(mobileOrEmail: string): Promise<{ success: boolean; otp: string }> {
    await delay(500);
    return { success: true, otp: '482916' };
  },

  async verifyOtp(_mobileOrEmail: string, otp: string): Promise<boolean> {
    await delay(400);
    return otp.length === 6 || otp === '482916';
  },

  async resetPassword(_password: string): Promise<boolean> {
    await delay(600);
    return true;
  },

  async updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    await delay(400);
    const current = getStoredItem<UserProfile>('active_user', INITIAL_USER);
    const updated = { ...current, ...profile };
    setStoredItem('active_user', updated);
    return updated;
  },

  async logout(): Promise<void> {
    await delay(500);
    localStorage.removeItem('dairynova_active_user');
  },
};
