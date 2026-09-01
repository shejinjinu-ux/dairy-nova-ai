import { delay, getStoredItem, setStoredItem } from './apiHelper';
import { Animal, BreedInfo } from '../../types';
import { INITIAL_ANIMALS, BREEDS_DATA } from '../../mocks/mockData';
import { cattleApi } from './cattleApi';

function mapCattleToAnimal(c: any): Animal {
  return {
    id: c.animal_id || c.tag_id,
    tagId: c.tag_id,
    name: c.name || `Cattle #${c.tag_id}`,
    type: (c.species === 'Buffalo' ? 'Buffalo' : 'Cow') as any,
    breed: c.breed || 'Gir',
    dateOfBirth: c.date_of_birth || undefined,
    ageYears: c.age_months !== undefined && c.age_months !== null ? Math.floor(c.age_months / 12) : 3,
    ageMonths: c.age_months !== undefined && c.age_months !== null ? c.age_months % 12 : 0,
    sex: (c.gender === 'Male' ? 'Male' : 'Female') as any,
    weightKg: c.body_weight_kg || undefined,
    lactationStage: (c.lactation_stage || 'Early') as any,
    pregnancyStatus: (c.pregnancy_status ? 'Pregnant' : 'Non-Pregnant') as any,
    calvingDate: c.calving_date || undefined,
    lactationStartDate: c.lactation_start_date || undefined,
    parity: c.parity || 1,
    daysInMilk: c.days_in_milk || undefined,
    dailyMilkYieldL: c.daily_milk_yield_litres || undefined,
    healthStatus: 'Healthy',
    imageUrl: c.imageUrl || '',
    ruminationMinutesPerDay: 480,
    activityLevel: 'Normal',
    notes: c.notes || undefined,
    createdDate: c.created_at ? c.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    lastCheckDate: c.updated_at ? c.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
  };
}

export const animalsApi = {
  async getAnimals(): Promise<Animal[]> {
    if (navigator.onLine) {
      try {
        const backendCattle = await cattleApi.listCattle();
        if (backendCattle && Array.isArray(backendCattle)) {
          const mapped = backendCattle.map(mapCattleToAnimal);
          setStoredItem('animals', mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Backend listCattle fallback to storage:', e);
      }
    }
    await delay(200);
    return getStoredItem<Animal[]>('animals', INITIAL_ANIMALS);
  },

  async getAnimalById(id: string): Promise<Animal | null> {
    if (navigator.onLine) {
      try {
        const cow = await cattleApi.getCattle(id);
        if (cow) return mapCattleToAnimal(cow);
      } catch {
        // Fallback to local storage
      }
    }
    await delay(100);
    const animals = getStoredItem<Animal[]>('animals', INITIAL_ANIMALS);
    return animals.find((a) => a.id === id || a.tagId === id) || null;
  },

  async addAnimal(animalData: Omit<Animal, 'id' | 'createdDate' | 'lastCheckDate'>): Promise<Animal> {
    const normTag = animalData.tagId.trim().toUpperCase();
    if (navigator.onLine) {
      try {
        const registered = await cattleApi.registerCattle({
          tag_id: normTag,
          name: animalData.name,
          species: animalData.type,
          breed: animalData.breed,
          gender: animalData.sex,
          date_of_birth: animalData.dateOfBirth,
          age_months: animalData.dateOfBirth
            ? Math.max(0, Math.floor((new Date().getTime() - new Date(animalData.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30.4375)))
            : (animalData.ageYears || 0) * 12 + (animalData.ageMonths || 0),
          body_weight_kg: animalData.weightKg,
          calving_date: animalData.calvingDate,
          parity: animalData.parity || 1,
          current_lactation_status: animalData.lactationStage === 'Dry' ? 'Dry' : 'Lactating',
          daily_milk_yield_litres: animalData.dailyMilkYieldL,
          pregnancy_status: animalData.pregnancyStatus === 'Pregnant',
        });
        const mapped = mapCattleToAnimal(registered);
        const currentAnimals = getStoredItem<Animal[]>('animals', INITIAL_ANIMALS);
        setStoredItem('animals', [mapped, ...currentAnimals.filter((a) => a.tagId.trim().toUpperCase() !== mapped.tagId.trim().toUpperCase())]);
        return mapped;
      } catch (err: any) {
        if (err?.message?.includes('already exists')) {
          throw err;
        }
        console.warn('Backend registerCattle fallback:', err);
      }
    }

    await delay(400);
    const currentAnimals = getStoredItem<Animal[]>('animals', INITIAL_ANIMALS);
    const exists = currentAnimals.some((a) => a.tagId.trim().toUpperCase() === normTag);
    if (exists) {
      throw new Error('Tag ID already exists. Please use a unique Tag ID.');
    }

    const newAnimal: Animal = {
      ...animalData,
      tagId: normTag,
      id: `ani-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      lastCheckDate: new Date().toISOString().split('T')[0],
    };
    const updated = [newAnimal, ...currentAnimals.filter((a) => a.tagId.trim().toUpperCase() !== normTag)];
    setStoredItem('animals', updated);
    return newAnimal;
  },

  async updateAnimal(id: string, updates: Partial<Animal>): Promise<Animal> {
    if (navigator.onLine) {
      try {
        const cow = await cattleApi.updateCattle(id, {
          name: updates.name,
          breed: updates.breed,
          body_weight_kg: updates.weightKg,
          calving_date: updates.calvingDate,
          parity: updates.parity,
          current_lactation_status: updates.lactationStage === 'Dry' ? 'Dry' : 'Lactating',
          daily_milk_yield_litres: updates.dailyMilkYieldL,
          pregnancy_status: updates.pregnancyStatus ? updates.pregnancyStatus === 'Pregnant' : undefined,
        });
        const mapped = mapCattleToAnimal(cow);
        return mapped;
      } catch {
        // Fallback
      }
    }

    await delay(300);
    const currentAnimals = getStoredItem<Animal[]>('animals', INITIAL_ANIMALS);
    const index = currentAnimals.findIndex((a) => a.id === id || a.tagId === id);
    if (index === -1) throw new Error('Animal not found');
    const updatedAnimal = { ...currentAnimals[index], ...updates, lastCheckDate: new Date().toISOString().split('T')[0] };
    currentAnimals[index] = updatedAnimal;
    setStoredItem('animals', [...currentAnimals]);
    return updatedAnimal;
  },

  async deleteAnimal(id: string): Promise<boolean> {
    if (navigator.onLine) {
      try {
        await cattleApi.deleteCattle(id);
      } catch {
        // Continue to remove locally
      }
    }
    await delay(300);
    const currentAnimals = getStoredItem<Animal[]>('animals', INITIAL_ANIMALS);
    const filtered = currentAnimals.filter((a) => a.id !== id && a.tagId !== id);
    setStoredItem('animals', filtered);
    return true;
  },

  async getBreeds(): Promise<BreedInfo[]> {
    await delay(100);
    return BREEDS_DATA;
  },

  async getBreedById(id: string): Promise<BreedInfo | null> {
    await delay(100);
    return BREEDS_DATA.find((b) => b.id === id) || null;
  },
};
