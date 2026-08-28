import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Animal,
  HealthAlert,
  VaccinationRecord,
  FeedAnalysisResult,
  SilageAnalysisResult,
  MilkRecord,
  MilkQualitySummary,
  QRBatch,
  NotificationItem,
  OfficerFarm,
  ContaminationAlert,
} from '../types';
import {
  DEMO_HERD_ANIMALS,
  DEMO_HEALTH_ALERTS,
  DEMO_VACCINATIONS,
  DEMO_FEED_ANALYSES,
  DEMO_SILAGE_ANALYSES,
  DEMO_MILK_RECORDS,
  MILK_QUALITY_SUMMARY,
  DEMO_NOTIFICATIONS,
  DEMO_QR_BATCHES,
  OFFICER_COOPERATIVE_FARMS,
  CONTAMINATION_ALERTS,
} from '../mocks/mockData';
import { getStoredItem, setStoredItem } from '../services/api/apiHelper';
import { useOffline } from './OfflineContext';

export type ScreenType =
  | 'splash'
  | 'language-select'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'home'
  | 'rapid-test'
  | 'animals'
  | 'animal-details'
  | 'add-animal'
  | 'breeds'
  | 'breed-details'
  | 'health'
  | 'disease-screening'
  | 'vaccinations'
  | 'feed'
  | 'feed-analysis'
  | 'silage'
  | 'silage-analysis'
  | 'milk'
  | 'milk-quality'
  | 'record-milk'
  | 'ai-chat'
  | 'qr-traceability'
  | 'byproducts'
  | 'history'
  | 'notifications'
  | 'more'
  | 'profile'
  | 'settings'
  | 'officer-dashboard'
  | 'officer-farm-details';

interface AppDataContextType {
  animals: Animal[];
  healthAlerts: HealthAlert[];
  vaccinations: VaccinationRecord[];
  feedAnalyses: FeedAnalysisResult[];
  silageAnalyses: SilageAnalysisResult[];
  milkRecords: MilkRecord[];
  milkQuality: MilkQualitySummary;
  notifications: NotificationItem[];
  qrBatches: QRBatch[];
  officerFarms: OfficerFarm[];
  contaminationAlerts: ContaminationAlert[];
  currentScreen: ScreenType;
  selectedAnimalId: string | null;
  selectedBreedId: string | null;
  selectedFarmId: string | null;
  chatAnimalContext: Animal | null;
  navigate: (screen: ScreenType, params?: { animalId?: string; breedId?: string; farmId?: string; chatAnimal?: Animal }) => void;
  goBack: () => void;
  addAnimal: (animal: Omit<Animal, 'id' | 'createdDate' | 'lastCheckDate'>) => void;
  updateAnimal: (id: string, updates: Partial<Animal>) => void;
  deleteAnimal: (id: string) => void;
  recordMilk: (record: Omit<MilkRecord, 'id' | 'isSynced'>) => void;
  markVaccinated: (id: string, vetName: string, notes?: string) => void;
  addHealthAlert: (alert: Omit<HealthAlert, 'id' | 'timestamp'>) => void;
  resolveHealthAlert: (id: string) => void;
  addFeedAnalysis: (result: FeedAnalysisResult) => void;
  addSilageAnalysis: (result: SilageAnalysisResult) => void;
  addQRBatch: (batch: QRBatch) => void;
  markAllNotificationsRead: () => void;
  resolveContaminationAlert: (id: string, note: string) => void;
  unreadNotificationsCount: number;
  seedNewUserHerd: (initialAnimal?: Omit<Animal, 'id' | 'createdDate' | 'lastCheckDate'>) => void;
  loadDemoHerd: () => void;
  clearUserData: () => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOffline, addToQueue } = useOffline();

  // Helper to scope storage by current active user
  const getUserKey = (prefix: string) => {
    const user = getStoredItem<any>('active_user', null);
    if (!user || !user.id) return prefix;
    return `${prefix}_${user.id}`;
  };

  const getInitialAnimals = (): Animal[] => {
    const user = getStoredItem<any>('active_user', null);
    if (!user) return [];
    if (user.id === 'farmer-demo') {
      return getStoredItem('animals_demo', DEMO_HERD_ANIMALS);
    }
    return getStoredItem(`animals_${user.id}`, getStoredItem('animals', []));
  };

  const [animals, setAnimals] = useState<Animal[]>(getInitialAnimals);
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>(() => {
    const user = getStoredItem<any>('active_user', null);
    if (user?.id === 'farmer-demo') return getStoredItem('health_alerts_demo', DEMO_HEALTH_ALERTS);
    return user ? getStoredItem(`health_alerts_${user.id}`, []) : [];
  });
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>(() => {
    const user = getStoredItem<any>('active_user', null);
    if (user?.id === 'farmer-demo') return getStoredItem('vaccinations_demo', DEMO_VACCINATIONS);
    return user ? getStoredItem(`vaccinations_${user.id}`, []) : [];
  });
  const [feedAnalyses, setFeedAnalyses] = useState<FeedAnalysisResult[]>(() => {
    const user = getStoredItem<any>('active_user', null);
    if (user?.id === 'farmer-demo') return getStoredItem('feed_analyses_demo', DEMO_FEED_ANALYSES);
    return user ? getStoredItem(`feed_analyses_${user.id}`, getStoredItem('feed_analyses', [])) : [];
  });
  const [silageAnalyses, setSilageAnalyses] = useState<SilageAnalysisResult[]>(() => {
    const user = getStoredItem<any>('active_user', null);
    if (user?.id === 'farmer-demo') return getStoredItem('silage_analyses_demo', DEMO_SILAGE_ANALYSES);
    return user ? getStoredItem(`silage_analyses_${user.id}`, getStoredItem('silage_analyses', [])) : [];
  });
  const [milkRecords, setMilkRecords] = useState<MilkRecord[]>(() => {
    const user = getStoredItem<any>('active_user', null);
    if (user?.id === 'farmer-demo') return getStoredItem('milk_records_demo', DEMO_MILK_RECORDS);
    return user ? getStoredItem(`milk_records_${user.id}`, []) : [];
  });
  const [milkQuality] = useState<MilkQualitySummary>(() => getStoredItem('milk_quality', MILK_QUALITY_SUMMARY));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const user = getStoredItem<any>('active_user', null);
    if (user?.id === 'farmer-demo') return getStoredItem('notifications_demo', DEMO_NOTIFICATIONS);
    return user ? getStoredItem(`notifications_${user.id}`, []) : [];
  });
  const [qrBatches, setQrBatches] = useState<QRBatch[]>(() => {
    const user = getStoredItem<any>('active_user', null);
    if (user?.id === 'farmer-demo') return getStoredItem('qr_batches_demo', DEMO_QR_BATCHES);
    return user ? getStoredItem(`qr_batches_${user.id}`, []) : [];
  });
  const [officerFarms] = useState<OfficerFarm[]>(() => getStoredItem('officer_farms', OFFICER_COOPERATIVE_FARMS));
  const [contaminationAlerts, setContaminationAlerts] = useState<ContaminationAlert[]>(() => getStoredItem('contamination_alerts', CONTAMINATION_ALERTS));

  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    const activeUser = getStoredItem<any>('active_user', null);
    if (activeUser && activeUser.isOnboarded) {
      return activeUser.role === 'officer' ? 'officer-dashboard' : 'home';
    }
    return 'splash';
  });
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>(['splash']);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [selectedBreedId, setSelectedBreedId] = useState<string | null>(null);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [chatAnimalContext, setChatAnimalContext] = useState<Animal | null>(null);

  const navigate = (screen: ScreenType, params?: { animalId?: string; breedId?: string; farmId?: string; chatAnimal?: Animal }) => {
    if (params?.animalId) setSelectedAnimalId(params.animalId);
    if (params?.breedId) setSelectedBreedId(params.breedId);
    if (params?.farmId) setSelectedFarmId(params.farmId);
    if (params?.chatAnimal !== undefined) setChatAnimalContext(params.chatAnimal);

    setScreenHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const nextHistory = [...screenHistory];
      nextHistory.pop();
      const previousScreen = nextHistory[nextHistory.length - 1];
      setScreenHistory(nextHistory);
      setCurrentScreen(previousScreen);
    } else {
      setCurrentScreen('home');
    }
  };

  // Seed fresh herd for a newly registered farmer
  const seedNewUserHerd = (initialAnimal?: Omit<Animal, 'id' | 'createdDate' | 'lastCheckDate'>) => {
    let newAnimals: Animal[] = [];
    if (initialAnimal) {
      const animal: Animal = {
        ...initialAnimal,
        id: `ani-${Date.now()}`,
        createdDate: new Date().toISOString().split('T')[0],
        lastCheckDate: new Date().toISOString().split('T')[0],
      };
      newAnimals = [animal];
    }
    setAnimals(newAnimals);
    setStoredItem(getUserKey('animals'), newAnimals);
    setStoredItem('animals', newAnimals);

    setHealthAlerts([]);
    setStoredItem(getUserKey('health_alerts'), []);
    setVaccinations([]);
    setStoredItem(getUserKey('vaccinations'), []);
    setFeedAnalyses([]);
    setStoredItem(getUserKey('feed_analyses'), []);
    setSilageAnalyses([]);
    setStoredItem(getUserKey('silage_analyses'), []);
    setMilkRecords([]);
    setStoredItem(getUserKey('milk_records'), []);
  };

  // Load demo dataset for demo farmer testing
  const loadDemoHerd = () => {
    setAnimals(DEMO_HERD_ANIMALS);
    setStoredItem('animals_demo', DEMO_HERD_ANIMALS);
    setHealthAlerts(DEMO_HEALTH_ALERTS);
    setStoredItem('health_alerts_demo', DEMO_HEALTH_ALERTS);
    setVaccinations(DEMO_VACCINATIONS);
    setStoredItem('vaccinations_demo', DEMO_VACCINATIONS);
    setFeedAnalyses(DEMO_FEED_ANALYSES);
    setStoredItem('feed_analyses_demo', DEMO_FEED_ANALYSES);
    setSilageAnalyses(DEMO_SILAGE_ANALYSES);
    setStoredItem('silage_analyses_demo', DEMO_SILAGE_ANALYSES);
    setMilkRecords(DEMO_MILK_RECORDS);
    setStoredItem('milk_records_demo', DEMO_MILK_RECORDS);
    setNotifications(DEMO_NOTIFICATIONS);
    setStoredItem('notifications_demo', DEMO_NOTIFICATIONS);
    setQrBatches(DEMO_QR_BATCHES);
    setStoredItem('qr_batches_demo', DEMO_QR_BATCHES);
  };

  // Clear user data on sign out
  const clearUserData = () => {
    setAnimals([]);
    setHealthAlerts([]);
    setVaccinations([]);
    setFeedAnalyses([]);
    setSilageAnalyses([]);
    setMilkRecords([]);
    setNotifications([]);
    setQrBatches([]);
  };

  const addAnimal = (animalData: Omit<Animal, 'id' | 'createdDate' | 'lastCheckDate'>) => {
    const newAnimal: Animal = {
      ...animalData,
      id: `ani-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      lastCheckDate: new Date().toISOString().split('T')[0],
    };
    const updated = [newAnimal, ...animals];
    setAnimals(updated);
    setStoredItem(getUserKey('animals'), updated);
    setStoredItem('animals', updated);

    if (isOffline) {
      addToQueue('animal_add', newAnimal);
    }
  };

  const updateAnimal = (id: string, updates: Partial<Animal>) => {
    const updated = animals.map((a) => (a.id === id ? { ...a, ...updates, lastCheckDate: new Date().toISOString().split('T')[0] } : a));
    setAnimals(updated);
    setStoredItem(getUserKey('animals'), updated);
    setStoredItem('animals', updated);

    if (isOffline) {
      addToQueue('animal_edit', { id, updates });
    }
  };

  const deleteAnimal = (id: string) => {
    const updated = animals.filter((a) => a.id !== id);
    setAnimals(updated);
    setStoredItem(getUserKey('animals'), updated);
    setStoredItem('animals', updated);
  };

  const recordMilk = (record: Omit<MilkRecord, 'id' | 'isSynced'>) => {
    const newRecord: MilkRecord = {
      ...record,
      id: `rec-${Date.now()}`,
      isSynced: !isOffline,
    };
    const updated = [newRecord, ...milkRecords];
    setMilkRecords(updated);
    setStoredItem(getUserKey('milk_records'), updated);

    if (isOffline) {
      addToQueue('milk_record', newRecord);
    }
  };

  const markVaccinated = (id: string, vetName: string, notes?: string) => {
    const updated = vaccinations.map((v) =>
      v.id === id
        ? {
            ...v,
            status: 'Completed' as const,
            completedDate: new Date().toISOString().split('T')[0],
            administeredBy: vetName,
            notes: notes || v.notes,
          }
        : v
    );
    setVaccinations(updated);
    setStoredItem(getUserKey('vaccinations'), updated);

    if (isOffline) {
      addToQueue('vaccination_mark', { id, vetName, notes });
    }
  };

  const addHealthAlert = (alert: Omit<HealthAlert, 'id' | 'timestamp'>) => {
    const newAlert: HealthAlert = {
      ...alert,
      id: `alt-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newAlert, ...healthAlerts];
    setHealthAlerts(updated);
    setStoredItem(getUserKey('health_alerts'), updated);
  };

  const resolveHealthAlert = (id: string) => {
    const updated = healthAlerts.map((a) => (a.id === id ? { ...a, status: 'resolved' as const } : a));
    setHealthAlerts(updated);
    setStoredItem(getUserKey('health_alerts'), updated);
  };

  const addFeedAnalysis = (result: FeedAnalysisResult) => {
    const updated = [result, ...feedAnalyses];
    setFeedAnalyses(updated);
    setStoredItem(getUserKey('feed_analyses'), updated);
    setStoredItem('feed_analyses', updated);
  };

  const addSilageAnalysis = (result: SilageAnalysisResult) => {
    const updated = [result, ...silageAnalyses];
    setSilageAnalyses(updated);
    setStoredItem(getUserKey('silage_analyses'), updated);
    setStoredItem('silage_analyses', updated);
  };

  const addQRBatch = (batch: QRBatch) => {
    const updated = [batch, ...qrBatches];
    setQrBatches(updated);
    setStoredItem(getUserKey('qr_batches'), updated);
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    setStoredItem(getUserKey('notifications'), updated);
  };

  const resolveContaminationAlert = (id: string, note: string) => {
    const updated = contaminationAlerts.map((a) => (a.id === id ? { ...a, status: 'Resolved' as const, actionTaken: note } : a));
    setContaminationAlerts(updated);
    setStoredItem('contamination_alerts', updated);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  const value: AppDataContextType = {
    animals,
    healthAlerts,
    vaccinations,
    feedAnalyses,
    silageAnalyses,
    milkRecords,
    milkQuality,
    notifications,
    qrBatches,
    officerFarms,
    contaminationAlerts,
    currentScreen,
    selectedAnimalId,
    selectedBreedId,
    selectedFarmId,
    chatAnimalContext,
    navigate,
    goBack,
    addAnimal,
    updateAnimal,
    deleteAnimal,
    recordMilk,
    markVaccinated,
    addHealthAlert,
    resolveHealthAlert,
    addFeedAnalysis,
    addSilageAnalysis,
    addQRBatch,
    markAllNotificationsRead,
    resolveContaminationAlert,
    unreadNotificationsCount,
    seedNewUserHerd,
    loadDemoHerd,
    clearUserData,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
