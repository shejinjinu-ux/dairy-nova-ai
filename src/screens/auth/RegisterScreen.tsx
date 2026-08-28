import React from 'react';
import { AuthOnboardingScreen } from './AuthOnboardingScreen';

export const RegisterScreen: React.FC = () => {
  return <AuthOnboardingScreen initialMode="signup" />;
};
