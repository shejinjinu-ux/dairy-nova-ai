import { delay, getStoredItem, setStoredItem } from './apiHelper';
import { UserProfile, Language } from '../../types';
import { INITIAL_USER, OFFICER_USER } from '../../mocks/mockData';

interface OtpChallenge {
  mobile: string;
  code: string;
  expiresAt: number;
}

export const authApi = {
  async getCurrentUser(): Promise<UserProfile | null> {
    await delay(150);
    return getStoredItem<UserProfile | null>('active_user', null);
  },

  async sendOtp(mobile: string): Promise<{ success: boolean; message: string; demoOtp?: string }> {
    await delay(500);
    const cleanMobile = mobile.replace(/[^0-9]/g, '').slice(-10);
    if (cleanMobile.length < 10) {
      throw new Error('Please enter a valid 10-digit mobile number.');
    }

    // Default demo OTP 482916 for instant testability, or generate standard 6-digit code
    const otpCode = '482916';
    const challenge: OtpChallenge = {
      mobile: cleanMobile,
      code: otpCode,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes expiration
    };

    setStoredItem(`otp_${cleanMobile}`, challenge);
    return {
      success: true,
      message: `OTP sent successfully to +91 ${cleanMobile}`,
      demoOtp: otpCode,
    };
  },

  async verifyOtp(
    mobile: string,
    otp: string
  ): Promise<{ success: boolean; user: UserProfile | null; isNewUser: boolean; message?: string }> {
    await delay(600);
    const cleanMobile = mobile.replace(/[^0-9]/g, '').slice(-10);
    const cleanOtp = otp.trim();

    if (cleanOtp.length !== 6) {
      throw new Error('Please enter a 6-digit OTP code.');
    }

    const challenge = getStoredItem<OtpChallenge | null>(`otp_${cleanMobile}`, null);

    // Verify OTP code
    const isValidCode = cleanOtp === '482916' || (challenge && challenge.code === cleanOtp);
    if (!isValidCode) {
      throw new Error('Invalid OTP code. Please enter the correct code.');
    }

    // Check expiration if challenge exists
    if (challenge && challenge.expiresAt < Date.now() && cleanOtp !== '482916') {
      throw new Error('OTP has expired. Please request a new OTP.');
    }

    // Check if user already exists
    const registeredUsers = getStoredItem<UserProfile[]>('registered_farmers', [INITIAL_USER]);
    const existing = registeredUsers.find(
      (u) => u.mobile.replace(/[^0-9]/g, '').slice(-10) === cleanMobile
    );

    if (existing && existing.isOnboarded !== false) {
      // Existing User Login
      setStoredItem('active_user', existing);
      return {
        success: true,
        user: existing,
        isNewUser: false,
      };
    }

    // New User Signup
    return {
      success: true,
      user: null,
      isNewUser: true,
    };
  },

  async completeFarmerProfile(params: {
    name: string;
    mobile: string;
    farmName?: string;
    farmLocation?: string;
    language?: Language;
  }): Promise<UserProfile> {
    await delay(500);
    const cleanMobile = params.mobile.replace(/[^0-9]/g, '').slice(-10);
    const newUser: UserProfile = {
      id: `farmer-${Date.now()}`,
      name: params.name.trim() || 'Dairy Farmer',
      mobile: `+91 ${cleanMobile}`,
      email: `${params.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'farmer'}@dairy.com`,
      farmName: params.farmName?.trim() || `${params.name.trim()}'s Dairy Farm`,
      farmLocation: params.farmLocation || '',
      role: 'farmer',
      language: params.language || 'en',
      avatarUrl: '',
      totalAnimals: 1,
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      isOnboarded: true,
      hasCattle: true,
    };

    const registered = getStoredItem<UserProfile[]>('registered_farmers', [INITIAL_USER]);
    const updatedRegistered = [newUser, ...registered.filter((u) => u.mobile !== newUser.mobile)];
    setStoredItem('registered_farmers', updatedRegistered);
    setStoredItem('active_user', newUser);

    return newUser;
  },

  async requestPasswordReset(mobileOrEmail: string): Promise<{ success: boolean; otp: string }> {
    await delay(500);
    return { success: true, otp: '482916' };
  },

  async resetPassword(_password: string): Promise<boolean> {
    await delay(600);
    return true;
  },

  async loginFarmer(mobileOrEmail: string = '9845023456', _password?: string): Promise<UserProfile> {
    await delay(400);
    const user: UserProfile = {
      ...INITIAL_USER,
      mobile: mobileOrEmail.includes('@') ? INITIAL_USER.mobile : mobileOrEmail,
      email: mobileOrEmail.includes('@') ? mobileOrEmail : INITIAL_USER.email,
      isOnboarded: true,
    };
    setStoredItem('active_user', user);
    return user;
  },

  async loginOfficer(_mobileOrEmail?: string, _password?: string): Promise<UserProfile> {
    await delay(400);
    setStoredItem('active_user', OFFICER_USER);
    return OFFICER_USER;
  },

  async updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    await delay(300);
    const current = getStoredItem<UserProfile>('active_user', INITIAL_USER);
    const updated = { ...current, ...profile };
    setStoredItem('active_user', updated);

    // Update in registered farmers list as well
    const registered = getStoredItem<UserProfile[]>('registered_farmers', [INITIAL_USER]);
    const index = registered.findIndex((u) => u.id === updated.id);
    if (index !== -1) {
      registered[index] = updated;
      setStoredItem('registered_farmers', registered);
    }

    return updated;
  },

  async logout(): Promise<void> {
    await delay(300);
    localStorage.removeItem('dairynova_active_user');
  },
};
