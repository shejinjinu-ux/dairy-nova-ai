import { delay, getStoredItem, setStoredItem } from './apiHelper';
import { Animal, BreedInfo } from '../../types';
import { INITIAL_ANIMALS, BREEDS_DATA } from '../../mocks/mockData';

export const animalsApi = {
  async getAnimals(): Promise<Animal[]> {
    await delay(300);
    return getStoredItem<Animal[]>('animals', INITIAL_ANIMALS);
  },

  async getAnimalById(id: string): Promise<Animal | null> {
    await delay(200);
    const animals = getStoredItem<Animal[]>('animals', INITIAL_ANIMALS);
    return animals.find((a) => a.id === id || a.tagId === id) || null;
  },

  async addAnimal(animalData: Omit<Animal, 'id' | 'createdDate' | 'lastCheckDate'>): Promise<Animal> {
    await delay(600);
    const currentAnimals = getStoredItem<Animal[]>('animals', INITIAL_ANIMALS);
    const newAnimal: Animal = {
      ...animalData,
      id: `ani-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      lastCheckDate: new Date().toISOString().split('T')[0],
    };
    const updated = [newAnimal, ...currentAnimals];
    setStoredItem('animals', updated);
    return newAnimal;
  },

  async updateAnimal(id: string, updates: Partial<Animal>): Promise<Animal> {
    await delay(500);
    const currentAnimals = getStoredItem<Animal[]>('animals', INITIAL_ANIMALS);
    const index = currentAnimals.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Animal not found');
    const updatedAnimal = { ...currentAnimals[index], ...updates, lastCheckDate: new Date().toISOString().split('T')[0] };
    currentAnimals[index] = updatedAnimal;
    setStoredItem('animals', [...currentAnimals]);
    return updatedAnimal;
  },

  async deleteAnimal(id: string): Promise<boolean> {
    await delay(400);
    const currentAnimals = getStoredItem<Animal[]>('animals', INITIAL_ANIMALS);
    const filtered = currentAnimals.filter((a) => a.id !== id);
    setStoredItem('animals', filtered);
    return true;
  },

  async getBreeds(): Promise<BreedInfo[]> {
    await delay(200);
    return BREEDS_DATA;
  },

  async getBreedById(id: string): Promise<BreedInfo | null> {
    await delay(150);
    return BREEDS_DATA.find((b) => b.id === id) || null;
  },
};
