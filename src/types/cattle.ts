/**
 * TypeScript Data Models for Cattle Management, Milk History,
 * Vaccination Schedules, Lactation Tracking, and Disease Diagnostics.
 */

export interface Cattle {
  animal_id: string;
  tag_id: string;
  farm_id: string;
  user_id: string;
  name?: string | null;
  species: string;
  breed: string;
  gender: string;
  age_months?: number | null;
  date_of_birth?: string | null;
  body_weight_kg?: number | null;
  calving_date?: string | null;
  lactation_start_date?: string | null;
  parity: number;
  current_lactation_status: string;
  days_in_milk?: number | null;
  lactation_stage?: string | null;
  daily_milk_yield_litres?: number | null;
  milk_fat_percentage?: number | null;
  pregnancy_status: boolean;
  pregnancy_month?: number | null;
  is_demo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CattleCreateInput {
  tag_id: string;
  name?: string;
  species?: string;
  breed?: string;
  gender?: string;
  age_months?: number;
  date_of_birth?: string;
  body_weight_kg?: number;
  calving_date?: string;
  parity?: number;
  current_lactation_status?: string;
  daily_milk_yield_litres?: number;
  milk_fat_percentage?: number;
  pregnancy_status?: boolean;
  pregnancy_month?: number;
  farm_id?: string;
}

export interface CattleUpdateInput {
  name?: string;
  breed?: string;
  body_weight_kg?: number;
  calving_date?: string;
  parity?: number;
  current_lactation_status?: string;
  daily_milk_yield_litres?: number;
  milk_fat_percentage?: number;
  pregnancy_status?: boolean;
  pregnancy_month?: number;
}

export interface MilkRecord {
  record_id: string;
  tag_id: string;
  user_id?: string;
  farm_id?: string | null;
  date: string;
  morning_yield_litres: number;
  evening_yield_litres: number;
  total_yield_litres: number;
  fat_percentage?: number | null;
  snf_percentage?: number | null;
  notes?: string | null;
  is_demo?: boolean;
  created_at?: string;
}

export interface MilkRecordCreateInput {
  date?: string;
  morning_yield_litres: number;
  evening_yield_litres: number;
  fat_percentage?: number;
  snf_percentage?: number;
  notes?: string;
}

export interface MilkHistoryResponse {
  tag_id: string;
  total_records: number;
  average_daily_yield_litres: number;
  highest_recorded_yield_litres: number;
  lowest_recorded_yield_litres: number;
  records: MilkRecord[];
}

export interface VaccinePriceDetail {
  disease_target: string;
  vaccine_name: string;
  brand_name?: string | null;
  manufacturer?: string | null;
  pack_size_doses?: number | null;
  total_pack_price_inr?: number | null;
  calculated_per_dose_inr?: number | null;
  cost_per_dose_display: string;
  procurement_cost_inr?: number | null;
  procurement_cost_display?: string | null;
  retail_price_inr?: number | null;
  retail_price_display?: string | null;
  price_type: 'GOVERNMENT_PROGRAMME_FREE' | 'GOVERNMENT_PROCUREMENT' | 'MANUFACTURER_LIST' | 'RETAIL_MARKET' | 'UNAVAILABLE' | string;
  farmer_cost_inr?: number | null;
  farmer_cost_display: string;
  state_market?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  source_date?: string | null;
  is_stale: boolean;
  notes?: string | null;
  eligibility_notes?: string | null;
}

export interface VaccinationRecommendation {
  tag_id: string;
  disease_target: string;
  recommended_vaccine: string;
  recommended_timing: string;
  next_due_date: string;
  status: 'DUE' | 'UPCOMING' | 'OVERDUE' | 'COMPLETED' | string;
  estimated_cost_display: string;
  brand_name?: string | null;
  manufacturer?: string | null;
  pack_size_doses?: number | null;
  total_pack_price_inr?: number | null;
  calculated_per_dose_inr?: number | null;
  procurement_cost_inr?: number | null;
  procurement_cost_display?: string | null;
  retail_price_inr?: number | null;
  retail_price_display?: string | null;
  price_type?: string | null;
  farmer_cost_inr?: number | null;
  farmer_cost_display?: string | null;
  state_market?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  source_date?: string | null;
  is_stale?: boolean;
  eligibility_notes?: string | null;
  price_detail?: VaccinePriceDetail | null;
  disclaimer: string;
  last_administered_date?: string | null;
  veterinarian_notes?: string | null;
}

export interface VaccinationRecord {
  record_id: string;
  tag_id: string;
  user_id?: string;
  disease_target: string;
  vaccine_name: string;
  administered_date: string;
  next_due_date: string;
  recommended_timing?: string;
  status: string;
  estimated_cost_inr?: number | null;
  batch_number?: string | null;
  veterinarian_name?: string | null;
  notes?: string | null;
  created_at?: string;
}

export interface VaccinationRecordCreateInput {
  disease_target: string;
  vaccine_name: string;
  administered_date?: string;
  next_due_date?: string;
  estimated_cost_inr?: number;
  batch_number?: string;
  veterinarian_name?: string;
  notes?: string;
}

export interface LactationStatus {
  tag_id: string;
  current_status: string;
  calving_date?: string | null;
  lactation_start_date?: string | null;
  parity: number;
  days_in_milk?: number | null;
  lactation_stage: 'Early' | 'Mid' | 'Late' | 'Dry' | string;
  stage_description?: string;
  estimated_peak_yield_day?: number;
  suggested_dry_off_date?: string | null;
  recommended_management_focus?: string;
}

export interface CalvingEventInput {
  calving_date: string;
  parity?: number;
  calf_gender?: string;
  notes?: string;
}

export interface DiseaseDiagnosisResult {
  predicted_class: 'FMD' | 'IBK' | 'LSD' | 'Normal' | string;
  confidence: number;
  confidence_percentage: number;
  is_disease_detected: boolean;
  disease_name_full: string;
  explanation: string;
  recommended_vaccine: string;
  vaccination_timing: string;
  estimated_cost: string;
  brand_name?: string | null;
  manufacturer?: string | null;
  price_type?: string | null;
  farmer_cost_display?: string | null;
  calculated_per_dose_inr?: number | null;
  procurement_cost_display?: string | null;
  retail_price_display?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  source_date?: string | null;
  is_stale?: boolean;
  eligibility_notes?: string | null;
  price_detail?: VaccinePriceDetail | null;
  probabilities: Record<string, number>;
  model_version: string;
  device_used: string;
  disclaimer: string;
  veterinary_disclaimer: string;
}
