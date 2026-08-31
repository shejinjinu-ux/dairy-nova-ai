import { delay, getStoredItem, setStoredItem } from './apiHelper';
import { VaccinationRecord, VaccinationRecommendation } from '../../types';
import { INITIAL_VACCINATIONS } from '../../mocks/mockData';
import { cattleApi } from './cattleApi';

export const vaccinationApi = {
  async getVaccinations(): Promise<VaccinationRecord[]> {
    await delay(200);
    return getStoredItem<VaccinationRecord[]>('vaccinations', INITIAL_VACCINATIONS);
  },

  async getRecommendations(tagId: string): Promise<VaccinationRecommendation[]> {
    if (navigator.onLine) {
      try {
        return await cattleApi.getVaccinations(tagId);
      } catch (e) {
        console.warn('Backend getVaccinations fallback:', e);
      }
    }
    await delay(200);
    return [];
  },

  async markAsVaccinated(id: string, administeredBy: string, notes?: string, nextDueDate?: string): Promise<VaccinationRecord> {
    const vaccinations = getStoredItem<VaccinationRecord[]>('vaccinations', INITIAL_VACCINATIONS);
    const index = vaccinations.findIndex((v) => v.id === id);
    const target = vaccinations[index];

    if (navigator.onLine && target?.animalTag) {
      try {
        await cattleApi.recordVaccination(target.animalTag, {
          disease_target: target.diseaseName || 'FMD',
          vaccine_name: target.vaccineName || 'Standard Formulation',
          administered_date: new Date().toISOString().split('T')[0],
          next_due_date: nextDueDate || target.nextBoosterDate,
          veterinarian_name: administeredBy,
          notes: notes || target.notes,
        });
      } catch (e) {
        console.warn('Backend recordVaccination fallback:', e);
      }
    }

    if (index !== -1) {
      const updated: VaccinationRecord = {
        ...vaccinations[index],
        status: 'Completed',
        completedDate: new Date().toISOString().split('T')[0],
        administeredBy: administeredBy || 'Farmer / Veterinarian',
        notes: notes || vaccinations[index].notes,
        nextBoosterDate: nextDueDate || vaccinations[index].nextBoosterDate,
      };
      vaccinations[index] = updated;
      setStoredItem('vaccinations', [...vaccinations]);
      return updated;
    }

    const defaultRecord: VaccinationRecord = {
      id: id || `vac-${Date.now()}`,
      animalId: 'ani-general',
      animalTag: 'TAG-101',
      animalName: 'Cattle',
      diseaseName: 'General Vaccination',
      vaccineName: 'Standard Formulation',
      doseNumber: 1,
      scheduledDate: new Date().toISOString().split('T')[0],
      completedDate: new Date().toISOString().split('T')[0],
      status: 'Completed',
      administeredBy: administeredBy || 'Farmer / Veterinarian',
      notes,
    };
    return defaultRecord;
  },

  async addVaccinationSchedule(record: Omit<VaccinationRecord, 'id'>): Promise<VaccinationRecord> {
    await delay(200);
    const vaccinations = getStoredItem<VaccinationRecord[]>('vaccinations', INITIAL_VACCINATIONS);
    const newRecord: VaccinationRecord = {
      ...record,
      id: `vac-${Date.now()}`,
    };
    const updated = [newRecord, ...vaccinations];
    setStoredItem('vaccinations', updated);
    return newRecord;
  },

  async updateVaccination(id: string, updates: Partial<VaccinationRecord>): Promise<VaccinationRecord> {
    await delay(200);
    const vaccinations = getStoredItem<VaccinationRecord[]>('vaccinations', INITIAL_VACCINATIONS);
    const index = vaccinations.findIndex((v) => v.id === id);
    if (index === -1) throw new Error('Vaccination record not found');
    const updated = { ...vaccinations[index], ...updates };
    vaccinations[index] = updated;
    setStoredItem('vaccinations', [...vaccinations]);
    return updated;
  },

  async deleteVaccination(id: string): Promise<boolean> {
    await delay(150);
    const vaccinations = getStoredItem<VaccinationRecord[]>('vaccinations', INITIAL_VACCINATIONS);
    const filtered = vaccinations.filter((v) => v.id !== id);
    setStoredItem('vaccinations', filtered);
    return true;
  },
};
