import { delay, getStoredItem, setStoredItem, apiFetch } from './apiHelper';
import {
  MilkRecord,
  MilkQualitySummary,
  MilkProductionInput,
  MilkProductionPredictionResponse,
  ContaminationScreenInput,
  ContaminationScreenResponse,
} from '../../types';
import { INITIAL_MILK_RECORDS, MILK_QUALITY_SUMMARY } from '../../mocks/mockData';

export const milkApi = {
  async getMilkRecords(): Promise<MilkRecord[]> {
    await delay(200);
    return getStoredItem<MilkRecord[]>('milk_records', INITIAL_MILK_RECORDS);
  },

  async getMilkQualitySummary(): Promise<MilkQualitySummary> {
    await delay(200);
    return getStoredItem<MilkQualitySummary>('milk_quality', MILK_QUALITY_SUMMARY);
  },

  async recordMilk(record: Omit<MilkRecord, 'id' | 'isSynced'>): Promise<MilkRecord> {
    await delay(300);
    const records = getStoredItem<MilkRecord[]>('milk_records', INITIAL_MILK_RECORDS);
    const newRecord: MilkRecord = {
      ...record,
      id: `rec-${Date.now()}`,
      isSynced: true,
    };
    const updated = [newRecord, ...records];
    setStoredItem('milk_records', updated);
    return newRecord;
  },

  /**
   * Predict daily milk yield using FastAPI XGBoost regressor (R² = 0.946)
   * POST /api/v1/predict/milk-production
   */
  async predictMilkYield(input: MilkProductionInput): Promise<MilkProductionPredictionResponse> {
    return await apiFetch<MilkProductionPredictionResponse>('/predict/milk-production', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Screen milk physical integrity & contamination telemetry
   * POST /api/v1/sensor-lab/contamination-screen
   */
  async screenContamination(input: ContaminationScreenInput): Promise<ContaminationScreenResponse> {
    return await apiFetch<ContaminationScreenResponse>('/sensor-lab/contamination-screen', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};
