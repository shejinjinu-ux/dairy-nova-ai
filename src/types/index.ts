export type Language = 'en' | 'ta' | 'hi' | 'te' | 'kn' | 'ml' | 'mr' | 'bn';

export type UserRole = 'farmer' | 'officer';

export type HealthStatus = 'Healthy' | 'Needs Attention' | 'Critical Alert';

export type AnimalType = 'Cow' | 'Buffalo';

export type LactationStage = 'Early' | 'Mid' | 'Late' | 'Dry' | 'Heifer' | 'Calf';

export type PregnancyStatus = 'Pregnant' | 'Non-Pregnant' | 'Suspected' | 'Recent Calving';

export type VaccinationStatus = 'Upcoming' | 'Due' | 'Overdue' | 'Completed';

export type DataSourceType = 'Measured' | 'Estimated' | 'Sensor Reading' | 'AI Screening';

export interface UserProfile {
  id: string;
  name: string;
  mobile: string;
  email: string;
  farmName: string;
  farmLocation: string;
  role: UserRole;
  language: Language;
  avatarUrl?: string;
  totalAnimals: number;
  memberSince: string;
  cooperativeId?: string;
}

export interface Animal {
  id: string;
  tagId: string;
  name: string;
  type: AnimalType;
  breed: string;
  ageYears: number;
  ageMonths: number;
  sex: 'Female' | 'Male';
  weightKg: number;
  lactationStage: LactationStage;
  pregnancyStatus: PregnancyStatus;
  calvingDate?: string;
  dailyMilkYieldL: number;
  healthStatus: HealthStatus;
  imageUrl: string;
  temperatureC: number;
  ruminationMinutesPerDay: number;
  activityLevel: 'Normal' | 'Restless' | 'Sluggish' | 'High Activity (Estrus)';
  notes?: string;
  createdDate: string;
  lastCheckDate: string;
}

export interface BreedInfo {
  id: string;
  name: string;
  nativeRegion: string;
  animalType: AnimalType;
  avgDailyMilkYield: string;
  fatPercentageRange: string;
  climateTolerance: string;
  feedRequirement: string;
  diseaseResistance: string;
  description: string;
  imageUrl: string;
  characteristics: string[];
  bestPractices: string[];
}

export interface HealthAlert {
  id: string;
  animalId: string;
  animalTag: string;
  animalName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  symptoms: string[];
  possibleConcern: string;
  preliminaryGuidance: string;
  veterinaryAdvice: string;
  confidenceScore: number;
  timestamp: string;
  status: 'active' | 'resolved' | 'monitoring';
  source: DataSourceType;
}

export interface VaccinationRecord {
  id: string;
  animalId: string;
  animalTag: string;
  animalName: string;
  diseaseName: string;
  vaccineName: string;
  doseNumber: number;
  scheduledDate: string;
  completedDate?: string;
  status: VaccinationStatus;
  administeredBy?: string;
  notes?: string;
  nextBoosterDate?: string;
}

export interface FeedAnalysisResult {
  id: string;
  batchId: string;
  date: string;
  feedCategory: string;
  feedName: string;
  imageUrl: string;
  overallScore: number;
  qualityGrade: 'Grade A+ (Premium)' | 'Grade A (Good)' | 'Grade B (Acceptable)' | 'Grade C (Low Quality)' | 'Reject (Unsafe)';
  crudeProteinPercent: number;
  moisturePercent: number;
  dryMatterPercent: number;
  crudeFiberPercent: number;
  tdnEnergyPercent: number;
  calciumPercent: number;
  phosphorusPercent: number;
  ureaRisk: 'Safe / None' | 'Low' | 'Moderate' | 'High (Toxic Risk)';
  silicaSandRisk: 'Safe (<2%)' | 'Moderate (2-4%)' | 'High (>4%)';
  mycotoxinRisk: 'Undetected' | 'Low Risk' | 'Moderate Concern' | 'Severe Aflatoxin Warning';
  fungalMouldRisk: 'Clean' | 'Mild Spores' | 'Active Mould Detected';
  aiAdvisory: string;
  recommendations: string[];
  inputSource: 'Camera Only' | 'Portable Scanner Simulation' | 'Manual Entry';
  isSafeForLactating: boolean;
  qrBatchId: string;
}

export interface SilageAnalysisResult {
  id: string;
  batchId: string;
  date: string;
  silageType: string;
  imageUrl: string;
  overallQuality: 'Excellent Lactic' | 'Good Fermentation' | 'Moderate / Secondary' | 'Spoiled / Butyric';
  phValue: number;
  moisturePercent: number;
  storageDurationDays: number;
  internalTemperatureC: number;
  fermentationStatus: 'Optimal Lactic Acid' | 'Sub-optimal Acetic' | 'Clostridial / Butyric Spoilage';
  spoilageRisk: 'Low' | 'Medium' | 'High Risk';
  mouldRisk: 'Clean / Safe' | 'Surface Crust Only' | 'Deep Penetration Mould';
  storageAdvice: string;
  recommendations: string[];
  inputSource: 'Manual Entry' | 'Portable Scanner Simulation' | 'Mock IoT Storage Monitoring';
  qrBatchId: string;
}

export interface IoTSilageReading {
  timestamp: string;
  ph: number;
  moisture: number;
  temperature: number;
  spoilageIndex: number;
  deviceStatus: 'online' | 'offline' | 'syncing';
}

export interface MilkRecord {
  id: string;
  animalId: string;
  animalTag: string;
  animalName: string;
  date: string;
  shift: 'Morning' | 'Evening';
  quantityLiters: number;
  fatPercent?: number;
  snfPercent?: number;
  lactometerReading?: number;
  notes?: string;
  recordedBy: string;
  isSynced: boolean;
}

export interface MilkQualitySummary {
  date: string;
  overallQuality: 'Premium Grade A+' | 'Grade A' | 'Grade B' | 'Standard';
  avgFat: number;
  avgSnf: number;
  avgProtein: number;
  avgLactose: number;
  ph: number;
  densityGml: number;
  sccCellsPerMl: number;
  adulterationStatus: 'Negative / 100% Pure' | 'Trace Water Detected' | 'Alert / High SCC';
  totalYieldTodayL: number;
  morningYieldL: number;
  eveningYieldL: number;
  predictedTomorrowYieldL: number;
  historicalTrend: { date: string; yield: number; fat: number; snf: number }[];
}

export interface QRBatch {
  batchId: string;
  itemType: 'Feed' | 'Silage' | 'Milk Batch' | 'Vaccinated Herd';
  title: string;
  farmName: string;
  farmerName: string;
  generatedDate: string;
  qualityGrade: string;
  adulterationFlags: string;
  verificationStatus: 'Verified Pure' | 'Certified Safe' | 'Requires Lab Review';
  dataSource: DataSourceType;
  parameters: Record<string, string | number>;
  qrPayload: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'vaccination' | 'health' | 'feed' | 'silage' | 'milk' | 'sync' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  actionRoute?: string;
}

export interface OfficerFarm {
  id: string;
  farmName: string;
  farmerName: string;
  contactNumber: string;
  village: string;
  district: string;
  totalCattle: number;
  cowsCount: number;
  buffaloesCount: number;
  todayMilkCollectionL: number;
  overallHealthStatus: 'Healthy' | 'Under Observation' | 'Critical Flag';
  lastInspectionDate: string;
  activeContaminationAlerts: number;
  avgMilkFat: number;
  avgMilkSnf: number;
  recentFeedGrade: string;
  recentSilageGrade: string;
  coordinates?: { lat: number; lng: number };
}

export interface ContaminationAlert {
  id: string;
  farmId: string;
  farmName: string;
  batchId: string;
  substance: 'Aflatoxin M1' | 'Antibiotic Residue' | 'Water Adulteration' | 'High Somatic Cell Count' | 'Urea Spill';
  severity: 'Moderate Concern' | 'Severe Hazard' | 'Regulatory Recall';
  detectedDate: string;
  affectedLiters: number;
  status: 'Active Alert' | 'Quarantined' | 'Resolved';
  actionTaken: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  animalContext?: { id: string; tag: string; name: string };
  suggestedFollowUps?: string[];
  isThinking?: boolean;
}

export interface OfflineQueueItem {
  id: string;
  type: 'milk_record' | 'animal_add' | 'animal_edit' | 'vaccination_mark' | 'disease_screening' | 'feed_analysis';
  payload: any;
  queuedAt: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}
