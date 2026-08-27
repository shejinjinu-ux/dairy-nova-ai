import { delay, getStoredItem, setStoredItem } from './apiHelper';
import { QRBatch } from '../../types';
import { INITIAL_QR_BATCHES } from '../../mocks/mockData';

export const qrApi = {
  async getBatches(): Promise<QRBatch[]> {
    await delay(250);
    return getStoredItem<QRBatch[]>('qr_batches', INITIAL_QR_BATCHES);
  },

  async lookupBatch(batchIdOrPayload: string): Promise<QRBatch | null> {
    await delay(600); // realistic scanner lookup delay
    const batches = getStoredItem<QRBatch[]>('qr_batches', INITIAL_QR_BATCHES);
    const cleaned = batchIdOrPayload.trim().toLowerCase();
    const found = batches.find(
      (b) =>
        b.batchId.toLowerCase().includes(cleaned) ||
        b.qrPayload.toLowerCase().includes(cleaned) ||
        cleaned.includes(b.batchId.toLowerCase())
    );
    if (found) return found;

    // Fallback dynamic generate if arbitrary valid code scanned
    if (cleaned.length > 3) {
      return {
        batchId: `DN-VERIFIED-${batchIdOrPayload.toUpperCase()}`,
        itemType: 'Milk Batch',
        title: 'Verified Cooperative Batch',
        farmName: 'Registered Cooperative Farm',
        farmerName: 'Certified Dairy Member',
        generatedDate: new Date().toISOString().split('T')[0],
        qualityGrade: 'Grade A+ Certified Pure',
        adulterationFlags: '100% Negative for Adulterants',
        verificationStatus: 'Verified Pure',
        dataSource: 'Sensor Reading',
        parameters: {
          'Inspection Timestamp': new Date().toLocaleTimeString(),
          'Fat Range': '4.8% - 5.2%',
          'SNF Range': '8.8% - 9.0%',
          'MBRT Quality': '> 4 Hours (Clean)',
        },
        qrPayload: `https://dairynova.ai/verify/${batchIdOrPayload}`,
      };
    }
    return null;
  },

  async createBatch(batch: QRBatch): Promise<QRBatch> {
    await delay(400);
    const batches = getStoredItem<QRBatch[]>('qr_batches', INITIAL_QR_BATCHES);
    const updated = [batch, ...batches];
    setStoredItem('qr_batches', updated);
    return batch;
  },
};
