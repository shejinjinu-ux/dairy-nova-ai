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
  LactationStage,
} from '../types';
import { cattleApi } from '../services/api/cattleApi';
import { animalsApi } from '../services/api/animalsApi';
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
import { checkMilkEligibility } from '../utils/formatters';
import { useOffline } from './OfflineContext';
import { useAuth } from './AuthContext';

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

export const PARENT_ROUTE_MAP: Record<ScreenType, ScreenType> = {
  'splash': 'language-select',
  'language-select': 'language-select',
  'login': 'splash',
  'register': 'splash',
  'forgot-password': 'login',
  'home': 'home',
  'rapid-test': 'feed',
  'animals': 'home',
  'animal-details': 'animals',
  'add-animal': 'animals',
  'breeds': 'home',
  'breed-details': 'breeds',
  'health': 'home',
  'disease-screening': 'health',
  'vaccinations': 'health',
  'feed': 'home',
  'feed-analysis': 'feed',
  'silage': 'home',
  'silage-analysis': 'silage',
  'milk': 'home',
  'milk-quality': 'milk',
  'record-milk': 'milk',
  'ai-chat': 'home',
  'qr-traceability': 'home',
  'byproducts': 'home',
  'history': 'home',
  'notifications': 'home',
  'more': 'home',
  'profile': 'home',
  'settings': 'home',
  'officer-dashboard': 'officer-dashboard',
  'officer-farm-details': 'officer-dashboard',
};

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
  screenHistory: ScreenType[];
  selectedAnimalId: string | null;
  selectedBreedId: string | null;
  selectedFarmId: string | null;
  chatAnimalContext: Animal | null;
  navigate: (screen: ScreenType, params?: { animalId?: string; breedId?: string; farmId?: string; chatAnimal?: Animal }, replace?: boolean) => void;
  goBack: () => void;
  addAnimal: (animal: Omit<Animal, 'id' | 'createdDate' | 'lastCheckDate'>) => void;
  updateAnimal: (id: string, updates: Partial<Animal>) => void;
  deleteAnimal: (id: string) => void;
  recordMilk: (record: Omit<MilkRecord, 'id' | 'isSynced'>) => void;
  addVaccination: (record: Omit<VaccinationRecord, 'id'>) => void;
  updateVaccination: (id: string, updates: Partial<VaccinationRecord>) => void;
  deleteVaccination: (id: string) => void;
  markVaccinated: (id: string, vetName: string, notes?: string, nextDueDate?: string) => void;
  addHealthAlert: (alert: Omit<HealthAlert, 'id' | 'timestamp'>) => void;
  resolveHealthAlert: (id: string) => void;
  addFeedAnalysis: (result: FeedAnalysisResult) => void;
  addSilageAnalysis: (result: SilageAnalysisResult) => void;
  addQRBatch: (batch: QRBatch) => void;
  markAllNotificationsRead: () => void;
  resolveContaminationAlert: (id: string, note: string) => void;
  recordCalving: (tagId: string, calvingDate: string, parity?: number) => void;
  unreadNotificationsCount: number;
  seedNewUserHerd: (initialAnimal?: Omit<Animal, 'id' | 'createdDate' | 'lastCheckDate'>) => void;
  loadDemoHerd: () => void;
  clearUserData: () => void;
  resetOnLogout: () => void;
}

const sanitizeAndMigrateAnimals = (rawAnimals: any[]): Animal[] => {
  if (!Array.isArray(rawAnimals)) return [];
  return rawAnimals.map((a: any) => {
    const { temperatureC, bodyTemperature, body_temperature, ...cleanAnimal } = a;
    return cleanAnimal as Animal;
  });
};

// Safe and idempotent localStorage migration function
const runLocalStorageMigration = () => {
  try {
    const keysToCheck = ['animals_demo', 'animals'];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('animals_') || keysToCheck.includes(key))) {
        const itemStr = localStorage.getItem(key);
        if (itemStr) {
          try {
            const parsed = JSON.parse(itemStr);
            if (Array.isArray(parsed)) {
              const cleaned = sanitizeAndMigrateAnimals(parsed);
              localStorage.setItem(key, JSON.stringify(cleaned));
            }
          } catch {
            // ignore non-json
          }
        }
      }
    }
  } catch (err) {
    console.warn('LocalStorage migration note:', err);
  }
};

// Run migration immediately on module evaluation
runLocalStorageMigration();

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOffline, addToQueue } = useOffline();
  const { user, isAuthenticated } = useAuth();

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
      const rawDemo = getStoredItem('animals_demo', DEMO_HERD_ANIMALS);
      return sanitizeAndMigrateAnimals(rawDemo);
    }
    const rawUserAnimals = getStoredItem(`animals_${user.id}`, getStoredItem('animals', []));
    return sanitizeAndMigrateAnimals(rawUserAnimals);
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
    return user ? getStoredItem(`vaccinations_${user.id}`, getStoredItem('vaccinations', [])) : [];
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

  // Determine initial entry screen
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    const activeUser = getStoredItem<any>('active_user', null);
    if (activeUser && activeUser.isOnboarded) {
      return activeUser.role === 'officer' ? 'officer-dashboard' : 'home';
    }
    const hasSelectedLang = getStoredItem<boolean>('has_selected_initial_language', false) || getStoredItem<boolean>('has_language_pref', false);
    if (!hasSelectedLang) {
      return 'language-select';
    }
    return 'splash';
  });

  const [screenHistory, setScreenHistory] = useState<ScreenType[]>([currentScreen]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [selectedBreedId, setSelectedBreedId] = useState<string | null>(null);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [chatAnimalContext, setChatAnimalContext] = useState<Animal | null>(null);

  // Live cattle sync from FastAPI backend (Primary Source of Truth)
  const refreshLiveCattleFromBackend = async (targetUserId?: string) => {
    try {
      const mappedAnimals = await animalsApi.getAnimals();
      if (Array.isArray(mappedAnimals) && mappedAnimals.length > 0) {
        setAnimals(mappedAnimals);
        const uid = targetUserId || user?.id;
        if (uid && uid !== 'farmer-demo') {
          setStoredItem(`animals_${uid}`, mappedAnimals);
        } else if (uid === 'farmer-demo') {
          setStoredItem('animals_demo', mappedAnimals);
        }
        setStoredItem('animals', mappedAnimals);
      }
    } catch (err) {
      console.warn('Backend live cattle sync fallback (offline/unavailable):', err);
      // If network fails or backend is unreachable, preserve existing cached data as fallback
    }
  };

  // Sync user state reactively on login, logout, and app mount
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear user scoped state
      setAnimals([]);
      setHealthAlerts([]);
      setVaccinations([]);
      setFeedAnalyses([]);
      setSilageAnalyses([]);
      setMilkRecords([]);
      setNotifications([]);
      setQrBatches([]);

      // If currently on an authenticated screen, immediately navigate to login or splash
      const publicScreens: ScreenType[] = ['splash', 'language-select', 'login', 'register', 'forgot-password'];
      if (!publicScreens.includes(currentScreen)) {
        const hasLang = getStoredItem<boolean>('has_selected_initial_language', false) || getStoredItem<boolean>('has_language_pref', false);
        const targetScreen: ScreenType = hasLang ? 'login' : 'language-select';
        setCurrentScreen(targetScreen);
        setScreenHistory([targetScreen]);
      }
    } else if (user) {
      // Load fallback cached datasets scoped to this authenticated user
      const userAnimals = getStoredItem(`animals_${user.id}`, getStoredItem('animals', []));
      setAnimals(sanitizeAndMigrateAnimals(userAnimals));
      setHealthAlerts(getStoredItem(`health_alerts_${user.id}`, []));
      setVaccinations(getStoredItem(`vaccinations_${user.id}`, getStoredItem('vaccinations', [])));
      setFeedAnalyses(getStoredItem(`feed_analyses_${user.id}`, getStoredItem('feed_analyses', [])));
      setSilageAnalyses(getStoredItem(`silage_analyses_${user.id}`, getStoredItem('silage_analyses', [])));
      setMilkRecords(getStoredItem(`milk_records_${user.id}`, []));
      setNotifications(getStoredItem(`notifications_${user.id}`, []));
      setQrBatches(getStoredItem(`qr_batches_${user.id}`, []));

      // Asynchronously fetch fresh live cattle from backend as source of truth
      refreshLiveCattleFromBackend(user.id);
    }
  }, [isAuthenticated, user?.id]);

  const navigate = (
    screen: ScreenType,
    params?: { animalId?: string; breedId?: string; farmId?: string; chatAnimal?: Animal },
    replace: boolean = false
  ) => {
    if (params?.animalId !== undefined) setSelectedAnimalId(params.animalId || null);
    if (params?.breedId !== undefined) setSelectedBreedId(params.breedId || null);
    if (params?.farmId !== undefined) setSelectedFarmId(params.farmId || null);
    if (params?.chatAnimal !== undefined) setChatAnimalContext(params.chatAnimal || null);

    if (replace) {
      setScreenHistory((prev) => {
        const copy = [...prev];
        if (copy.length > 0) copy[copy.length - 1] = screen;
        else copy.push(screen);
        return copy;
      });
      window.history.replaceState({ screen, params }, '', window.location.pathname);
    } else {
      setScreenHistory((prev) => [...prev, screen]);
      window.history.pushState({ screen, params }, '', window.location.pathname);
    }

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
      window.history.replaceState({ screen: previousScreen }, '', window.location.pathname);
    } else {
      const fallback = PARENT_ROUTE_MAP[currentScreen] || 'home';
      if (fallback !== currentScreen) {
        setCurrentScreen(fallback);
        setScreenHistory([fallback]);
        window.history.replaceState({ screen: fallback }, '', window.location.pathname);
      }
    }
  };

  // Synchronize browser history and Capacitor Android Hardware Back Button
  useEffect(() => {
    const handlePopState = () => {
      setScreenHistory((prev) => {
        if (prev.length > 1) {
          const next = [...prev];
          next.pop();
          const prevScreen = next[next.length - 1];
          setCurrentScreen(prevScreen);
          return next;
        }
        return prev;
      });
    };

    window.addEventListener('popstate', handlePopState);

    // Capacitor Native Android Back Button Listener
    let capacitorBackListener: any = null;
    const setupCapacitor = async () => {
      try {
        const appPkg = '@capacitor/app';
        const { App } = await import(/* @vite-ignore */ appPkg);
        capacitorBackListener = await App.addListener('backButton', () => {
          setScreenHistory((prev) => {
            const current = prev[prev.length - 1];
            const isRootScreen = ['home', 'officer-dashboard', 'splash', 'language-select'].includes(current);
            if (prev.length > 1 && !isRootScreen) {
              const next = [...prev];
              next.pop();
              const prevScreen = next[next.length - 1];
              setCurrentScreen(prevScreen);
              return next;
            } else if (isRootScreen) {
              App.minimizeApp().catch(() => {});
            }
            return prev;
          });
        });
      } catch {
        // Web or non-Capacitor environment
      }
    };
    setupCapacitor();

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (capacitorBackListener?.remove) {
        capacitorBackListener.remove();
      }
    };
  }, []);

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

  // Complete reset on logout to prevent back-navigation into protected screens
  const resetOnLogout = () => {
    clearUserData();
    setSelectedAnimalId(null);
    setSelectedBreedId(null);
    setSelectedFarmId(null);
    setChatAnimalContext(null);
    const targetScreen: ScreenType = 'language-select';
    setScreenHistory([targetScreen]);
    setCurrentScreen(targetScreen);
    window.history.replaceState({ screen: targetScreen }, '', window.location.pathname);
  };

  const addAnimal = (animalData: Omit<Animal, 'id' | 'createdDate' | 'lastCheckDate'>) => {
    const normTag = animalData.tagId.trim();
    let dim: number | undefined = undefined;
    let stage: LactationStage = animalData.lactationStage;
    if (animalData.calvingDate) {
      const diffMs = new Date().getTime() - new Date(animalData.calvingDate).getTime();
      dim = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      if (stage !== 'Dry') {
        if (dim <= 100) stage = 'Early';
        else if (dim <= 200) stage = 'Mid';
        else if (dim <= 305) stage = 'Late';
        else stage = 'Dry';
      }
    }

    const newAnimal: Animal = {
      ...animalData,
      tagId: normTag,
      daysInMilk: dim,
      lactationStage: stage,
      id: `ani-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      lastCheckDate: new Date().toISOString().split('T')[0],
    };
    const updated = [newAnimal, ...animals.filter((a) => a.tagId.toUpperCase() !== normTag.toUpperCase())];
    setAnimals(updated);
    setStoredItem(getUserKey('animals'), updated);
    setStoredItem('animals', updated);

    if (navigator.onLine) {
      cattleApi.registerCattle({
        tag_id: normTag,
        name: newAnimal.name,
        species: newAnimal.type,
        breed: newAnimal.breed,
        gender: newAnimal.sex,
        date_of_birth: newAnimal.dateOfBirth,
        age_months: newAnimal.dateOfBirth
          ? Math.max(0, Math.floor((new Date().getTime() - new Date(newAnimal.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30.4375)))
          : (newAnimal.ageYears || 0) * 12 + (newAnimal.ageMonths || 0),
        body_weight_kg: newAnimal.weightKg,
        calving_date: newAnimal.calvingDate,
        parity: newAnimal.parity || 1,
        current_lactation_status: newAnimal.lactationStage === 'Dry' ? 'Dry' : 'Lactating',
        daily_milk_yield_litres: newAnimal.dailyMilkYieldL,
        pregnancy_status: newAnimal.pregnancyStatus === 'Pregnant',
      }).catch((err) => {
        console.warn('Backend registerCattle sync:', err);
      });
    }

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
    const target = animals.find((a) => a.id === id);
    const updated = animals.filter((a) => a.id !== id);
    setAnimals(updated);
    setStoredItem(getUserKey('animals'), updated);
    setStoredItem('animals', updated);

    if (navigator.onLine && target?.tagId) {
      cattleApi.deleteCattle(target.tagId).catch((e) => console.warn('Backend deleteCattle:', e));
    }
  };

  const recordMilk = (record: Omit<MilkRecord, 'id' | 'isSynced'>) => {
    // Safety guard: ensure the animal is eligible before creating or syncing milk records
    const targetAnimal = animals.find(
      (a) => (record.animalTag && a.tagId.trim().toUpperCase() === record.animalTag.trim().toUpperCase()) || a.id === record.animalId
    );

    if (targetAnimal) {
      const eligibility = checkMilkEligibility(targetAnimal);
      if (!eligibility.isEligible) {
        console.warn(`[Milk Gate] Blocked milk record for ineligible cattle ${record.animalTag || targetAnimal.tagId}: ${eligibility.reason}`);
        return;
      }
    }

    const newRecord: MilkRecord = {
      ...record,
      id: `rec-${Date.now()}`,
      isSynced: !isOffline,
    };
    const updated = [newRecord, ...milkRecords];
    setMilkRecords(updated);
    setStoredItem(getUserKey('milk_records'), updated);

    if (record.animalTag || record.animalId) {
      const matchTag = (record.animalTag || '').trim().toUpperCase();
      const updatedAnimals = animals.map((a) => {
        if (a.tagId.toUpperCase() === matchTag || a.id === record.animalId) {
          return {
            ...a,
            dailyMilkYieldL: record.quantityLiters,
            lastCheckDate: new Date().toISOString().split('T')[0],
          };
        }
        return a;
      });
      setAnimals(updatedAnimals);
      setStoredItem(getUserKey('animals'), updatedAnimals);
      setStoredItem('animals', updatedAnimals);

      if (navigator.onLine && record.animalTag) {
        const isMorning = record.shift === 'Morning';
        cattleApi.recordMilk(record.animalTag, {
          date: record.date,
          morning_yield_litres: isMorning ? record.quantityLiters : 0,
          evening_yield_litres: !isMorning ? record.quantityLiters : 0,
          fat_percentage: record.fatPercent,
          snf_percentage: record.snfPercent,
          notes: record.notes,
        }).catch((err) => {
          console.warn('Backend recordMilk sync:', err);
        });
      }
    }

    if (isOffline) {
      addToQueue('milk_record', newRecord);
    }
  };

  const addVaccination = (recordData: Omit<VaccinationRecord, 'id'>) => {
    const newRecord: VaccinationRecord = {
      ...recordData,
      id: `vac-${Date.now()}`,
    };
    const updated = [newRecord, ...vaccinations];
    setVaccinations(updated);
    setStoredItem(getUserKey('vaccinations'), updated);
    setStoredItem('vaccinations', updated);

    if (isOffline) {
      addToQueue('vaccination_add', newRecord);
    }
  };

  const updateVaccination = (id: string, updates: Partial<VaccinationRecord>) => {
    const updated = vaccinations.map((v) => (v.id === id ? { ...v, ...updates } : v));
    setVaccinations(updated);
    setStoredItem(getUserKey('vaccinations'), updated);
    setStoredItem('vaccinations', updated);

    if (isOffline) {
      addToQueue('vaccination_edit', { id, updates });
    }
  };

  const deleteVaccination = (id: string) => {
    const updated = vaccinations.filter((v) => v.id !== id);
    setVaccinations(updated);
    setStoredItem(getUserKey('vaccinations'), updated);
    setStoredItem('vaccinations', updated);
  };

  const markVaccinated = (id: string, vetName: string, notes?: string, nextDueDate?: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = vaccinations.map((v) =>
      v.id === id
        ? {
            ...v,
            status: 'Completed' as const,
            completedDate: todayStr,
            administeredBy: vetName,
            notes: notes !== undefined ? notes : v.notes,
            nextBoosterDate: nextDueDate || v.nextBoosterDate,
          }
        : v
    );
    setVaccinations(updated);
    setStoredItem(getUserKey('vaccinations'), updated);
    setStoredItem('vaccinations', updated);

    if (isOffline) {
      addToQueue('vaccination_mark', { id, vetName, notes, nextDueDate });
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
    setFeedAnalyses((prev) => {
      const exists = prev.some((f) => f.id === result.id || (f.batchId && f.batchId === result.batchId));
      const updated = exists
        ? prev.map((f) => (f.id === result.id || (f.batchId && f.batchId === result.batchId) ? result : f))
        : [result, ...prev];
      setStoredItem(getUserKey('feed_analyses'), updated);
      setStoredItem('feed_analyses', updated);
      return updated;
    });
  };

  const addSilageAnalysis = (result: SilageAnalysisResult) => {
    setSilageAnalyses((prev) => {
      const exists = prev.some((s) => s.id === result.id || (s.batchId && s.batchId === result.batchId));
      const updated = exists
        ? prev.map((s) => (s.id === result.id || (s.batchId && s.batchId === result.batchId) ? result : s))
        : [result, ...prev];
      setStoredItem(getUserKey('silage_analyses'), updated);
      setStoredItem('silage_analyses', updated);
      return updated;
    });
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

  const recordCalving = (tagId: string, calvingDate: string, parity?: number) => {
    const updated = animals.map((a) => {
      if (a.tagId === tagId || a.id === tagId) {
        const newParity = parity !== undefined ? parity : ((a.parity || 1) + 1);
        return {
          ...a,
          calvingDate,
          lactationStartDate: calvingDate,
          parity: newParity,
          lactationStage: 'Early' as const,
          pregnancyStatus: 'Non-Pregnant' as const,
          daysInMilk: 0,
          lastCheckDate: new Date().toISOString().split('T')[0],
        };
      }
      return a;
    });
    setAnimals(updated);
    setStoredItem(getUserKey('animals'), updated);
    setStoredItem('animals', updated);

    if (navigator.onLine) {
      cattleApi.recordCalving(tagId, { calving_date: calvingDate, parity }).catch((err) => {
        console.warn('Backend recordCalving sync:', err);
      });
    }
  };

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
    screenHistory,
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
    addVaccination,
    updateVaccination,
    deleteVaccination,
    markVaccinated,
    addHealthAlert,
    resolveHealthAlert,
    addFeedAnalysis,
    addSilageAnalysis,
    addQRBatch,
    markAllNotificationsRead,
    resolveContaminationAlert,
    recordCalving,
    unreadNotificationsCount,
    seedNewUserHerd,
    loadDemoHerd,
    clearUserData,
    resetOnLogout,
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
