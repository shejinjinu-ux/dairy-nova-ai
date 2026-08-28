import React from 'react';
import { AuthOnboardingScreen } from './AuthOnboardingScreen';

export const LoginScreen: React.FC = () => {
  return <AuthOnboardingScreen initialMode="login" />;
};
