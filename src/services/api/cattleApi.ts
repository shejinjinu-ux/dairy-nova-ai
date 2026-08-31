/**
 * API Client for Cattle Management, Milk History, Vaccination, and Lactation Tracking.
 * Integrates with FastAPI Backend (/api/v1/cattle).
 */

import { apiFetch, buildApiUrl } from './apiHelper';
import {
  Cattle,
  CattleCreateInput,
  CattleUpdateInput,
  MilkRecord,
  MilkRecordCreateInput,
  MilkHistoryResponse,
  VaccinationRecommendation,
  VaccinationRecord,
  VaccinationRecordCreateInput,
  LactationStatus,
  CalvingEventInput,
} from '../../types/cattle';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token') || 'demo_token';
  const userId = localStorage.getItem('user_id') || 'farmer-demo';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-User-ID': userId,
  };
}

export const cattleApi = {
  /**
   * Registers new cattle with a globally unique Tag ID.
   * Enforces uniqueness at database level.
   */
  async registerCattle(input: CattleCreateInput): Promise<Cattle> {
    try {
      return await apiFetch<Cattle>('/cattle', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      });
    } catch (err: any) {
      if (err?.status === 409 || err?.message?.includes('already exists') || err?.rawError?.detail?.includes('already exists')) {
        throw new Error('Tag ID already exists. Please use a unique Tag ID.');
      }
      throw err;
    }
  },

  /**
   * Lists all cattle registered to the authenticated user/farm.
   */
  async listCattle(): Promise<Cattle[]> {
    return await apiFetch<Cattle[]>('/cattle', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  /**
   * Retrieves cattle profile by Tag ID.
   */
  async getCattle(tagId: string): Promise<Cattle> {
    const encoded = encodeURIComponent(tagId.trim());
    return await apiFetch<Cattle>(`/cattle/${encoded}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  /**
   * Updates an existing cattle record.
   */
  async updateCattle(tagId: string, input: CattleUpdateInput): Promise<Cattle> {
    const encoded = encodeURIComponent(tagId.trim());
    return await apiFetch<Cattle>(`/cattle/${encoded}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(input),
    });
  },

  /**
   * Deletes a cattle record.
   */
  async deleteCattle(tagId: string): Promise<void> {
    const encoded = encodeURIComponent(tagId.trim());
    await apiFetch<{ success?: boolean }>(`/cattle/${encoded}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  /**
   * 🥛 Records milk production (Morning / Evening) for an animal.
   * AUTOMATICALLY persists to persistent Milk History.
   */
  async recordMilk(tagId: string, input: MilkRecordCreateInput): Promise<MilkRecord> {
    const encoded = encodeURIComponent(tagId.trim());
    return await apiFetch<MilkRecord>(`/cattle/${encoded}/milk`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(input),
    });
  },

  /**
   * 🥛 Retrieves persistent milk production history for a cattle Tag ID.
   */
  async getMilkHistory(tagId: string): Promise<MilkHistoryResponse> {
    const encoded = encodeURIComponent(tagId.trim());
    return await apiFetch<MilkHistoryResponse>(`/cattle/${encoded}/milk-history`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  /**
   * 💉 Returns personalized veterinary vaccination recommendations with 3-tier pricing.
   */
  async getVaccinations(tagId: string): Promise<VaccinationRecommendation[]> {
    const encoded = encodeURIComponent(tagId.trim());
    return await apiFetch<VaccinationRecommendation[]>(`/cattle/${encoded}/vaccinations`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  /**
   * 💉 Records administered vaccine for cattle.
   */
  async recordVaccination(tagId: string, input: VaccinationRecordCreateInput): Promise<VaccinationRecord> {
    const encoded = encodeURIComponent(tagId.trim());
    return await apiFetch<VaccinationRecord>(`/cattle/${encoded}/vaccinations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(input),
    });
  },

  /**
   * 🥛🐄 Calculates Days in Milk (DIM) and determines lactation timeline.
   */
  async getLactation(tagId: string): Promise<LactationStatus> {
    const encoded = encodeURIComponent(tagId.trim());
    return await apiFetch<LactationStatus>(`/cattle/${encoded}/lactation`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  /**
   * 🥛🐄 Records new calving event, resetting DIM and restarting Early Lactation.
   */
  async recordCalving(tagId: string, input: CalvingEventInput): Promise<LactationStatus> {
    const encoded = encodeURIComponent(tagId.trim());
    return await apiFetch<LactationStatus>(`/cattle/${encoded}/calving`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(input),
    });
  },
};
