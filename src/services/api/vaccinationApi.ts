import { delay, getStoredItem, setStoredItem } from './apiHelper';
import { VaccinationRecord } from '../../types';
import { INITIAL_VACCINATIONS } from '../../mocks/mockData';

export const vaccinationApi = {
  async getVaccinations(): Promise<VaccinationRecord[]> {
    await delay(300);
    return getStoredItem<VaccinationRecord[]>('vaccinations', INITIAL_VACCINATIONS);
  },

  async markAsVaccinated(id: string, administeredBy: string, notes?: string): Promise<VaccinationRecord> {
    await delay(500);
    const vaccinations = getStoredItem<VaccinationRecord[]>('vaccinations', INITIAL_VACCINATIONS);
    const index = vaccinations.findIndex((v) => v.id === id);
    if (index === -1) throw new Error('Vaccination record not found');
    const updated: VaccinationRecord = {
      ...vaccinations[index],
      status: 'Completed',
      completedDate: new Date().toISOString().split('T')[0],
      administeredBy: administeredBy || 'Farmer / Veterinarian',
      notes: notes || vaccinations[index].notes,
    };
    vaccinations[index] = updated;
    setStoredItem('vaccinations', [...vaccinations]);
    return updated;
  },

  async addVaccinationSchedule(record: Omit<VaccinationRecord, 'id'>): Promise<VaccinationRecord> {
    await delay(400);
    const vaccinations = getStoredItem<VaccinationRecord[]>('vaccinations', INITIAL_VACCINATIONS);
    const newRecord: VaccinationRecord = {
      ...record,
      id: `vac-${Date.now()}`,
    };
    const updated = [newRecord, ...vaccinations];
    setStoredItem('vaccinations', updated);
    return newRecord;
  },
};
