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
import { cattleApi } from './cattleApi';

export const milkApi = {
  async getMilkRecords(): Promise<MilkRecord[]> {
    await delay(150);
    return getStoredItem<MilkRecord[]>('milk_records', INITIAL_MILK_RECORDS);
  },

  async getMilkQualitySummary(): Promise<MilkQualitySummary> {
    await delay(150);
    return getStoredItem<MilkQualitySummary>('milk_quality', MILK_QUALITY_SUMMARY);
  },

  /**
   * Records milk production. Automatically persists into backend Milk History when online.
   */
  async recordMilk(record: Omit<MilkRecord, 'id' | 'isSynced'>): Promise<MilkRecord> {
    const records = getStoredItem<MilkRecord[]>('milk_records', INITIAL_MILK_RECORDS);
    const newRecord: MilkRecord = {
      ...record,
      id: `rec-${Date.now()}`,
      isSynced: navigator.onLine,
    };

    if (navigator.onLine && record.animalTag) {
      try {
        const isMorning = record.shift === 'Morning';
        await cattleApi.recordMilk(record.animalTag, {
          date: record.date,
          morning_yield_litres: isMorning ? record.quantityLiters : 0,
          evening_yield_litres: !isMorning ? record.quantityLiters : 0,
          fat_percentage: record.fatPercent,
          snf_percentage: record.snfPercent,
          notes: record.notes,
        });
      } catch (e) {
        console.warn('Backend recordMilk fallback to local sync:', e);
      }
    }

    const updated = [newRecord, ...records];
    setStoredItem('milk_records', updated);
    return newRecord;
  },

  /**
   * Predict daily milk yield using FastAPI XGBoost regressor (R² = 0.946)
   * POST /api/v1/predict/milk-production
   */
  async predictMilkYield(input: MilkProductionInput): Promise<MilkProductionPredictionResponse> {
    // Ensure no body temperature field is passed
    const cleanInput = { ...input };
    delete (cleanInput as any).Temperature_C;
    delete (cleanInput as any).temperatureC;

    return await apiFetch<MilkProductionPredictionResponse>('/predict/milk-production', {
      method: 'POST',
      body: JSON.stringify(cleanInput),
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
