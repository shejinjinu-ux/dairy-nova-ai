import { delay, getStoredItem, setStoredItem } from './apiHelper';
import { HealthAlert } from '../../types';
import { INITIAL_HEALTH_ALERTS } from '../../mocks/mockData';

export const healthApi = {
  async getHealthAlerts(): Promise<HealthAlert[]> {
    await delay(300);
    return getStoredItem<HealthAlert[]>('health_alerts', INITIAL_HEALTH_ALERTS);
  },

  async addHealthAlert(alert: Omit<HealthAlert, 'id' | 'timestamp'>): Promise<HealthAlert> {
    await delay(400);
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
    await delay(300);
    const alerts = getStoredItem<HealthAlert[]>('health_alerts', INITIAL_HEALTH_ALERTS);
    const updated = alerts.map((a) => (a.id === id ? { ...a, status: 'resolved' as const } : a));
    setStoredItem('health_alerts', updated);
    return true;
  },
};
