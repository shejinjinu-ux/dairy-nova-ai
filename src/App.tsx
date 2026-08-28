import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { AppDataProvider, useAppData } from './contexts/AppDataContext';
import { MobileContainer } from './components/common/MobileContainer';

// Screens
import { SplashScreen } from './screens/auth/SplashScreen';
import { LanguageSelectionScreen } from './screens/auth/LanguageSelectionScreen';
import { LoginScreen } from './screens/auth/LoginScreen';
import { RegisterScreen } from './screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from './screens/auth/ForgotPasswordScreen';
import { HomeDashboardScreen } from './screens/dashboard/HomeDashboardScreen';
import { RapidTestScreen } from './screens/feed/RapidTestScreen';
import { AnimalsScreen } from './screens/animals/AnimalsScreen';
import { AnimalDetailsScreen } from './screens/animals/AnimalDetailsScreen';
import { BreedsScreen } from './screens/breeds/BreedsScreen';
import { BreedDetailsScreen } from './screens/breeds/BreedDetailsScreen';
import { HealthDashboardScreen } from './screens/health/HealthDashboardScreen';
import { VaccinationsScreen } from './screens/vaccination/VaccinationsScreen';
import { FeedQualityScreen } from './screens/feed/FeedQualityScreen';
import { SilageScreen } from './screens/silage/SilageScreen';
import { MilkScreen } from './screens/milk/MilkScreen';
import { QRTraceabilityScreen } from './screens/qr/QRTraceabilityScreen';
import { ByProductsScreen } from './screens/byproducts/ByProductsScreen';
import { DairyNovaAIChatScreen } from './screens/ai/DairyNovaAIChatScreen';
import { HistoryScreen } from './screens/history/HistoryScreen';
import { NotificationsScreen } from './screens/notifications/NotificationsScreen';
import { MoreMenuScreen } from './screens/more/MoreMenuScreen';
import { ProfileScreen } from './screens/profile/ProfileScreen';
import { SettingsScreen } from './screens/settings/SettingsScreen';
import { OfficerDashboardScreen } from './screens/officer/OfficerDashboardScreen';
import { FarmDetailsScreen } from './screens/officer/FarmDetailsScreen';

const ScreenRouter: React.FC = () => {
  const { currentScreen } = useAppData();
  const { isAuthenticated, role } = useAuth();

  switch (currentScreen) {
    case 'splash':
      return <SplashScreen />;
    case 'language-select':
      return <LanguageSelectionScreen />;
    case 'login':
      return <LoginScreen />;
    case 'register':
      return <RegisterScreen />;
    case 'forgot-password':
      return <ForgotPasswordScreen />;
    case 'home':
      return <HomeDashboardScreen />;
    case 'rapid-test':
      return <RapidTestScreen />;
    case 'animals':
      return <AnimalsScreen />;
    case 'animal-details':
      return <AnimalDetailsScreen />;
    case 'breeds':
      return <BreedsScreen />;
    case 'breed-details':
      return <BreedDetailsScreen />;
    case 'health':
      return <HealthDashboardScreen />;
    case 'vaccinations':
      return <VaccinationsScreen />;
    case 'feed':
      return <FeedQualityScreen />;
    case 'silage':
      return <SilageScreen />;
    case 'milk':
      return <MilkScreen />;
    case 'qr-traceability':
      return <QRTraceabilityScreen />;
    case 'byproducts':
      return <ByProductsScreen />;
    case 'ai-chat':
      return <DairyNovaAIChatScreen />;
    case 'history':
      return <HistoryScreen />;
    case 'notifications':
      return <NotificationsScreen />;
    case 'more':
      return <MoreMenuScreen />;
    case 'profile':
      return <ProfileScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'officer-dashboard':
      return <OfficerDashboardScreen />;
    case 'officer-farm-details':
      return <FarmDetailsScreen />;
    default:
      return <HomeDashboardScreen />;
  }
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AccessibilityProvider>
        <OfflineProvider>
          <AuthProvider>
            <AppDataProvider>
              <MobileContainer>
                <ScreenRouter />
              </MobileContainer>
            </AppDataProvider>
          </AuthProvider>
        </OfflineProvider>
      </AccessibilityProvider>
    </LanguageProvider>
  );
};

export default App;
