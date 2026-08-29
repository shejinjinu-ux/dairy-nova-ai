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

export type DataSourceType =
  | 'Measured'
  | 'Estimated'
  | 'Sensor Reading'
  | 'AI Screening'
  | 'Visual Screening'
  | 'ICAR Reference Tables'
  | 'FAO Fermentation Model'
  | 'Visual Spoilage Screening'
  | 'Rule-Based Visual Screening';

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
  weightKg?: number;
  lactationStage: LactationStage;
  pregnancyStatus: PregnancyStatus;
  calvingDate?: string;
  dailyMilkYieldL?: number;
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
  sampleAmount?: number;
  sampleAmountUnit?: string;
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
  sampleAmount?: number;
  sampleAmountUnit?: string;
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
  type:
    | 'milk_record'
    | 'animal_add'
    | 'animal_edit'
    | 'vaccination_mark'
    | 'vaccination_add'
    | 'vaccination_edit'
    | 'disease_screening'
    | 'feed_analysis';
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

// Visual Screening Responses (Method 1)
export interface FeedVisualScreeningResponse {
  success: boolean;
  predicted_class: 'GOOD' | 'MOULD_RISK' | 'SPOILED' | string;
  confidence: number;
  confidence_percentage: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  screening_type: string;
  probabilities?: Record<string, number>;
  visual_indicators?: {
    surface_discolouration_index?: number;
    dark_or_mould_cluster_spots?: boolean;
    texture_roughness_score?: number;
    white_grey_hyphae_indicators?: boolean;
  };
  why: string[];
  recommended_action: string[];
  disclaimer: string;
}

export interface SilageVisualScreeningResponse {
  success: boolean;
  predicted_class: 'GOOD' | 'MOULD_RISK' | 'SPOILED' | 'POOR_FERMENTATION' | string;
  confidence: number;
  confidence_percentage: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  screening_type: string;
  probabilities?: Record<string, number>;
  visual_indicators?: {
    surface_discolouration_index?: number;
    dark_or_mould_cluster_spots?: boolean;
    texture_roughness_score?: number;
    white_grey_hyphae_indicators?: boolean;
  };
  why: string[];
  recommended_action: string[];
  disclaimer: string;
}

// Feed Reference Nutrition Response (Method 2)
export interface FeedReferenceNutrientsPerKg {
  dry_matter_g: number;
  crude_protein_g: number;
  crude_fibre_g: number;
  ndf_g: number;
  adf_g: number;
  adl_g: number;
  starch_g: number;
  ether_extract_g: number;
  ash_g: number;
  energy_mj: number;
  calcium_g: number;
  phosphorus_g: number;
}

export interface FeedReferenceNutrientPercentages {
  dry_matter_percent: number;
  crude_protein_percent_dm: number;
  crude_fibre_percent_dm: number;
  ndf_percent_dm: number;
  adf_percent_dm: number;
  adl_percent_dm: number;
  starch_percent_dm: number;
  ether_extract_percent_dm: number;
  ash_percent_dm: number;
  metabolizable_energy_mj_kg_dm: number;
}

export interface FeedReferenceResponse {
  success: boolean;
  feed_name: string;
  matched_feed_name: string;
  category: string;
  quantity_kg: number;
  basis: string;
  per_kg: FeedReferenceNutrientsPerKg;
  total_for_quantity: FeedReferenceNutrientsPerKg;
  nutrient_percentages_dm: FeedReferenceNutrientPercentages;
  source: string;
  disclaimer: string;
}

// Combined Feed Analysis Response
export interface CombinedFeedAnalysisResponse {
  success: boolean;
  feed_name: string;
  category: string;
  quantity_kg: number;
  quality_score: number;
  status: 'GOOD' | 'CAUTION' | 'HIGH_RISK' | string;
  nutrition_reference?: FeedReferenceResponse | null;
  nutrition_ml_predictions?: any;
  visual_screening?: FeedVisualScreeningResponse | null;
  risk_analysis: {
    mould_risk: { level: string; basis: string; details: string };
    spoilage_risk: { level: string; basis: string; details: string };
    urea_adulteration?: { status: string; message: string };
    sand_silica_contamination?: { status: string; message: string };
    mycotoxin?: { status: string; message: string };
    disclaimer: string;
  };
  why: string[];
  recommended_action: string[];
  farm_id?: string | null;
  animal_id?: string | null;
  record_id?: string | null;
  persisted_at?: string | null;
  disclaimer: string;
}

// Combined Silage Analysis Response
export interface CombinedSilageAnalysisResponse {
  success: boolean;
  quality_score: number;
  status: 'GOOD' | 'CAUTION' | 'UNSAFE' | string;
  fermentation_ml: {
    quality_classification: {
      predicted_class: 'ea' | 'la' | string;
      class_label: string;
      confidence: number;
      probabilities: Record<string, number>;
      model_accuracy: number;
    };
    fermentation_quality_index: {
      predicted_fqi: number;
      interpretation: string;
      model_r2_score: number;
    };
    screening_result: {
      screening_status: string;
      composite_quality_score: number;
      fermentation_tier: string;
      why: string[];
      recommended_action: string[];
      screening_type: string;
      disclaimer: string;
    };
  };
  visual_screening?: SilageVisualScreeningResponse | null;
  risk_analysis: {
    mould_risk: { level: string; basis: string; details: string };
    spoilage_risk: { level: string; basis: string; details: string };
    urea_adulteration?: { status: string; message: string };
    sand_silica_contamination?: { status: string; message: string };
    mycotoxin?: { status: string; message: string };
    disclaimer: string;
  };
  fermentation_metrics: {
    pH: number;
    dry_matter_percent: number;
    moisture_percent: number;
    crude_protein_percent_dm: number;
    lactic_acid_percent_dm: number;
    acetic_acid_percent_dm: number;
    butyric_acid_percent_dm: number;
    ammonia_n_percent_total_n: number;
    fqi_score: number;
    fao_quality_class: string;
  };
  why: string[];
  recommended_action: string[];
  farm_id?: string | null;
  animal_id?: string | null;
  record_id?: string | null;
  persisted_at?: string | null;
  disclaimer: string;
}

// Chat Request & Response
export interface ChatRequestPayload {
  message: string;
  language?: string | null;
  session_id?: string | null;
  user_id?: string | null;
  farm_id?: string | null;
  selected_animal_id?: string | null;
}

export interface ChatResponsePayload {
  success: boolean;
  reply: string;
  language: string;
  detected_language: string;
  intent: string;
  module: string;
  session_id: string;
  metadata?: {
    suggested_questions?: string[];
    intent_confidence?: number;
    [key: string]: any;
  } | null;
}

