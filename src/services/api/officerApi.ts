import { delay, getStoredItem, setStoredItem } from './apiHelper';
import { OfficerFarm, ContaminationAlert } from '../../types';
import { OFFICER_COOPERATIVE_FARMS, CONTAMINATION_ALERTS } from '../../mocks/mockData';

export const officerApi = {
  async getFarms(): Promise<OfficerFarm[]> {
    await delay(300);
    return getStoredItem<OfficerFarm[]>('officer_farms', OFFICER_COOPERATIVE_FARMS);
  },

  async getFarmById(id: string): Promise<OfficerFarm | null> {
    await delay(200);
    const farms = getStoredItem<OfficerFarm[]>('officer_farms', OFFICER_COOPERATIVE_FARMS);
    return farms.find((f) => f.id === id) || null;
  },

  async getContaminationAlerts(): Promise<ContaminationAlert[]> {
    await delay(250);
    return getStoredItem<ContaminationAlert[]>('contamination_alerts', CONTAMINATION_ALERTS);
  },

  async resolveContaminationAlert(id: string, actionNote: string): Promise<ContaminationAlert> {
    await delay(500);
    const alerts = getStoredItem<ContaminationAlert[]>('contamination_alerts', CONTAMINATION_ALERTS);
    const index = alerts.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Alert not found');
    const updated: ContaminationAlert = {
      ...alerts[index],
      status: 'Resolved',
      actionTaken: actionNote || 'Resolved by Veterinary Field Officer inspection.',
    };
    alerts[index] = updated;
    setStoredItem('contamination_alerts', [...alerts]);
    return updated;
  },
};
