import { delay, getStoredItem, setStoredItem } from './apiHelper';
import { MilkRecord, MilkQualitySummary } from '../../types';
import { INITIAL_MILK_RECORDS, MILK_QUALITY_SUMMARY } from '../../mocks/mockData';

export const milkApi = {
  async getMilkRecords(): Promise<MilkRecord[]> {
    await delay(300);
    return getStoredItem<MilkRecord[]>('milk_records', INITIAL_MILK_RECORDS);
  },

  async getMilkQualitySummary(): Promise<MilkQualitySummary> {
    await delay(250);
    return getStoredItem<MilkQualitySummary>('milk_quality', MILK_QUALITY_SUMMARY);
  },

  async recordMilk(record: Omit<MilkRecord, 'id' | 'isSynced'>): Promise<MilkRecord> {
    await delay(500);
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
};
