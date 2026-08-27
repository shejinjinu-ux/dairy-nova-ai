import { delay, getStoredItem, setStoredItem } from './apiHelper';
import { SilageAnalysisResult, IoTSilageReading } from '../../types';
import { INITIAL_SILAGE_ANALYSES, MOCK_IOT_SILAGE_READINGS } from '../../mocks/mockData';

export const silageApi = {
  async getSilageAnalyses(): Promise<SilageAnalysisResult[]> {
    await delay(300);
    return getStoredItem<SilageAnalysisResult[]>('silage_analyses', INITIAL_SILAGE_ANALYSES);
  },

  async getIoTReadings(): Promise<IoTSilageReading[]> {
    await delay(200);
    return MOCK_IOT_SILAGE_READINGS;
  },

  async analyzeSilage(params: {
    silageType: string;
    imageUrl?: string;
    phValue?: number;
    moisturePercent?: number;
    storageDurationDays?: number;
    internalTemperatureC?: number;
    inputSource: 'Manual Entry' | 'Portable Scanner Simulation' | 'Mock IoT Storage Monitoring';
  }): Promise<SilageAnalysisResult> {
    await delay(1200); // realistic AI analysis delay

    const ph = params.phValue || 3.9;
    const isLactic = ph < 4.2;
    const temp = params.internalTemperatureC || 26.5;
    const isHeating = temp > 35;

    const newAnalysis: SilageAnalysisResult = {
      id: `sil-${Date.now()}`,
      batchId: `DN-SIL-${new Date().toISOString().split('T')[0]}-S${Math.floor(Math.random() * 900 + 100)}`,
      date: new Date().toISOString().split('T')[0],
      silageType: params.silageType || 'Whole Corn (Maize) Silage',
      imageUrl: params.imageUrl || 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format&fit=crop&q=80',
      overallQuality: isHeating ? 'Spoiled / Butyric' : isLactic ? 'Excellent Lactic' : 'Good Fermentation',
      phValue: Number(ph.toFixed(2)),
      moisturePercent: params.moisturePercent || 66.5,
      storageDurationDays: params.storageDurationDays || 60,
      internalTemperatureC: Number(temp.toFixed(1)),
      fermentationStatus: isHeating ? 'Clostridial / Butyric Spoilage' : isLactic ? 'Optimal Lactic Acid' : 'Sub-optimal Acetic',
      spoilageRisk: isHeating ? 'High Risk' : isLactic ? 'Low' : 'Medium',
      mouldRisk: isHeating ? 'Deep Penetration Mould' : 'Clean / Safe',
      storageAdvice: isLactic
        ? 'Optimal lactic fermentation achieved. Silo pit is hermetically intact with minimal dry matter loss.'
        : 'Secondary aerobic exposure detected. Extract silage cleanly in vertical slices and reseal immediately.',
      recommendations: [
        'Discard any top dark or slimy layer (feed only clean golden silage)',
        'Reseal pit cover with soil or sandbag weights after daily extraction',
        'Transition cattle onto new silage over 5-7 days',
      ],
      inputSource: params.inputSource,
      qrBatchId: `QR-SIL-${Math.floor(Math.random() * 9000 + 1000)}`,
    };

    const current = getStoredItem<SilageAnalysisResult[]>('silage_analyses', INITIAL_SILAGE_ANALYSES);
    setStoredItem('silage_analyses', [newAnalysis, ...current]);
    return newAnalysis;
  },
};
