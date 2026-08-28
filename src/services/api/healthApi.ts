import { apiFetch, delay, getStoredItem, setStoredItem } from './apiHelper';
import { HealthAlert } from '../../types';
import { INITIAL_HEALTH_ALERTS } from '../../mocks/mockData';

export interface DiseaseScreeningResponse {
  is_disease_detected: boolean;
  predicted_class: string;
  disease_name_full: string;
  confidence: number;
  confidence_percentage: number;
  disclaimer: string;
  symptoms?: string[];
  isolation_advice?: string;
  recommended_actions?: string[];
}

export const healthApi = {
  async getHealthAlerts(): Promise<HealthAlert[]> {
    await delay(150);
    return getStoredItem<HealthAlert[]>('health_alerts', INITIAL_HEALTH_ALERTS);
  },

  async addHealthAlert(alert: Omit<HealthAlert, 'id' | 'timestamp'>): Promise<HealthAlert> {
    await delay(200);
    const alerts = getStoredItem<HealthAlert[]>('health_alerts', INITIAL_HEALTH_ALERTS);
    const newAlert: HealthAlert = {
      ...alert,
      id: `alt-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newAlert, ...alerts];
    setStoredItem('health_alerts', updated);
    return newAlert;
  },

  async resolveHealthAlert(id: string): Promise<boolean> {
    await delay(150);
    const alerts = getStoredItem<HealthAlert[]>('health_alerts', INITIAL_HEALTH_ALERTS);
    const updated = alerts.map((a) => (a.id === id ? { ...a, status: 'resolved' as const } : a));
    setStoredItem('health_alerts', updated);
    return true;
  },

  /**
   * AI-based bovine dermatological & clinical symptom screening
   * Source of Truth: FastAPI POST /api/v1/predict/disease
   */
  async screenDisease(imageFile: File | Blob): Promise<DiseaseScreeningResponse> {
    const formData = new FormData();
    formData.append('file', imageFile, 'cattle_diagnostic.jpg');

    return await apiFetch<DiseaseScreeningResponse>('/predict/disease', {
      method: 'POST',
      body: formData,
    });
  },
};
