export type Language =
  | 'en'
  | 'ta'
  | 'hi'
  | 'te'
  | 'kn'
  | 'ml'
  | 'bn'
  | 'mr'
  | 'gu'
  | 'pa'
  | 'or'
  | 'as'
  | 'ur'
  | 'sa'
  | 'ne'
  | 'kok'
  | 'ks'
  | 'sd'
  | 'mai'
  | 'mni'
  | 'tanglish'
  | (string & {});

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
  isOnboarded?: boolean;
  hasCattle?: boolean;
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
  qualityGrade: 'Grade A+ (Premium)' | 'Grade A (Good)' | 'Grade B (Acceptable)' | 'Grade C (Low Quality)' | 'Reject (Unsafe)' | string;
  isGood?: 'Good' | 'Moderate' | 'Poor';
  simpleVerdict?: string;
  crudeProteinPercent: number;
  moisturePercent: number;
  dryMatterPercent: number;
  crudeFiberPercent: number;
  ndfPercent?: number;
  adfPercent?: number;
  adlPercent?: number;
  starchPercent?: number;
  tdnEnergyPercent: number;
  calciumPercent: number;
  phosphorusPercent: number;
  ureaRisk: 'Safe / None' | 'Low' | 'Moderate' | 'High (Toxic Risk)' | string;
  silicaSandRisk: 'Safe (<2%)' | 'Moderate (2-4%)' | 'High (>4%)' | string;
  mycotoxinRisk: 'Undetected' | 'Low Risk' | 'Moderate Concern' | 'Severe Aflatoxin Warning' | string;
  fungalMouldRisk: 'Clean' | 'Mild Spores' | 'Active Mould Detected' | string;
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
  overallQuality: 'Excellent Lactic' | 'Good Fermentation' | 'Moderate / Secondary' | 'Spoiled / Butyric' | string;
  isGood?: 'Good' | 'Moderate' | 'Poor';
  simpleVerdict?: string;
  phValue: number;
  moisturePercent: number;
  dryMatterPercent?: number;
  storageDurationDays: number;
  internalTemperatureC: number;
  fermentationStatus: 'Optimal Lactic Acid' | 'Sub-optimal Acetic' | 'Clostridial / Butyric Spoilage' | string;
  spoilageRisk: 'Low' | 'Medium' | 'High Risk' | string;
  mouldRisk: 'Clean / Safe' | 'Surface Crust Only' | 'Deep Penetration Mould' | string;
  fqiScore?: number;
  confidence?: number;
  modelAccuracy?: number;
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


// ICAR-NIANP Scientific Nutrition & Ration Optimization Types
export interface FeedItemRecommendation {
  feed_id: string;
  feed_name: string;
  feed_category: string;
  quantity_kg_per_day: number;
  cost_per_kg_inr: number;
  daily_cost_inr: number;
  dm_supplied_kg: number;
  cp_supplied_g: number;
  tdn_supplied_kg: number;
  calcium_supplied_g: number;
  phosphorus_supplied_g: number;
}

export interface NutrientRequirementsSummary {
  metabolic_body_weight_kg: number;
  fat_corrected_milk_4pct_kg: number;
  req_dmi_kg_per_day: number;
  req_tdn_kg_per_day: number;
  req_me_mj_per_day: number;
  req_cp_g_per_day: number;
  req_calcium_g_per_day: number;
  req_phosphorus_g_per_day: number;
}

export interface NutrientBalanceItem {
  required: number;
  supplied: number;
  unit: string;
  difference: number;
  percentage_fulfilled: number;
  status: 'Balanced' | 'Surplus' | 'Deficit' | string;
}

export interface NutritionRecommendationRequest {
  species?: 'Cattle' | 'Buffalo' | string;
  breed?: string | null;
  body_weight_kg?: number | null;
  age_years?: number | null;
  parity?: number | null;
  lactation_stage?: string | null;
  days_in_milk?: number | null;
  daily_milk_yield_kg?: number | null;
  milk_fat_percent?: number | null;
  pregnancy_status?: boolean | null;
  pregnancy_month?: number | null;
  available_feeds?: string[] | null;
  feed_prices?: Record<string, number> | null;
}

export interface NutritionRecommendationResponse {
  success: boolean;
  is_deterministic_optimized: boolean;
  status: 'optimized' | 'missing_parameters' | 'infeasible' | string;
  message: string;
  animal_profile?: Record<string, any>;
  missing_critical_parameters?: string[];
  nutrient_requirements?: NutrientRequirementsSummary;
  recommended_ration: FeedItemRecommendation[];
  total_daily_cost_inr: number;
  nutrient_supply?: Record<string, number>;
  nutrient_balance?: Record<string, NutrientBalanceItem>;
  warnings?: string[];
}

// Disease Prediction Schemas
export interface DiseasePredictionResponse {
  predicted_class: 'FMD' | 'IBK' | 'LSD' | 'Normal' | string;
  confidence: number;
  confidence_percentage: number;
  is_disease_detected: boolean;
  disease_name_full: string;
  probabilities: Record<string, number>;
  model_version: string;
  device_used: string;
  disclaimer: string;
}

// Breed Prediction Schemas
export interface TopBreedPrediction {
  breed: string;
  confidence: number;
  confidence_percentage: number;
}

export interface BreedPredictionResponse {
  breed_status: 'identified' | 'uncertain' | string;
  predicted_breed: string | null;
  confidence: number;
  confidence_percentage: number;
  recommendation: string | null;
  top_5_predictions: TopBreedPrediction[];
  total_classes_supported: number;
  model_architecture: string;
  device_used: string;
}

// Milk Production Prediction Schemas
export interface MilkProductionInput {
  Lactation_Stage?: string;
  Body_Weight_kg?: number;
  Feed_Intake_kg_day?: number;
  Rumination_Time_min_day?: number;
  Temperature_C?: number;
  Humidity_percent?: number;
  Breed?: string;
  Cattle_ID?: string;
  Farm_ID?: string;
  Parity?: number;
  Days_in_Milk?: number;
  Water_Intake_L_day?: number;
  Activity_Level_steps_day?: number;
  Heart_Rate_bpm?: number;
  Respiratory_Rate_breaths_min?: number;
  [key: string]: any;
}

export interface MilkProductionPredictionResponse {
  predicted_milk_yield_litres: number;
  target_unit: string;
  model_r2_score: number;
  features_received: number;
}

// Sensor Lab Contamination Screen Schemas
export interface ContaminationScreenInput {
  electrical_conductivity_ms_cm?: number | null;
  freezing_point_c?: number | null;
  milk_ph?: number | null;
  turbidity_ntu?: number | null;
  somatic_cell_count_raw?: number | null;
  sensor_metadata?: Record<string, any> | null;
}

export interface ContaminationScreenResponse {
  status: string;
  is_sensor_data_valid: boolean;
  water_adulteration_suspected: boolean;
  subclinical_mastitis_risk: 'Low' | 'Medium' | 'High' | 'Normal' | string;
  acidity_anomaly: boolean;
  parameters_evaluated: string[];
  lab_verification_required: boolean;
  disclaimer: string;
}
