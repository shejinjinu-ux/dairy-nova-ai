import { apiFetch, getStoredItem, setStoredItem } from './apiHelper';
import {
  SilageAnalysisResult,
  IoTSilageReading,
  SilageVisualScreeningResponse,
  CombinedSilageAnalysisResponse,
} from '../../types';
import { INITIAL_SILAGE_ANALYSES, MOCK_IOT_SILAGE_READINGS } from '../../mocks/mockData';

export const silageApi = {
  async getSilageAnalyses(): Promise<SilageAnalysisResult[]> {
    return getStoredItem<SilageAnalysisResult[]>('silage_analyses', INITIAL_SILAGE_ANALYSES);
  },

  async getIoTReadings(): Promise<IoTSilageReading[]> {
    return MOCK_IOT_SILAGE_READINGS;
  },

  /**
   * METHOD 1: Visual Silage Spoilage & Aerobic Mould Screening
   * Endpoint: POST /api/v1/predict/silage-visual (multipart/form-data with 'file')
   */
  async screenSilageVisual(imageFile: File | Blob): Promise<SilageVisualScreeningResponse> {
    const formData = new FormData();
    formData.append('file', imageFile, (imageFile as File).name || 'silage_sample.jpg');

    return await apiFetch<SilageVisualScreeningResponse>('/predict/silage-visual', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * METHOD 2: Consolidated Silage Quality & Fermentation Analysis (FAO & Random Forest Engine)
   * Endpoint: POST /api/v1/analyze/silage (multipart/form-data)
   */
  async analyzeSilageCombined(params: {
    pH: number;
    dmPercent: number;
    cpPercent?: number;
    lacticAcidPercent?: number;
    aceticAcidPercent?: number;
    butyricAcidPercent?: number;
    ammoniaNPercent?: number;
    starchPercent?: number;
    ndfPercent?: number;
    adfPercent?: number;
    farmId?: string | null;
    animalId?: string | null;
    imageFile?: File | Blob | null;
  }): Promise<CombinedSilageAnalysisResponse> {
    const formData = new FormData();
    formData.append('pH', String(params.pH));
    formData.append('dm_s', String(params.dmPercent));
    formData.append('cp_s', String(params.cpPercent ?? 14.0));
    formData.append('lactic_ac_s', String(params.lacticAcidPercent ?? (params.pH <= 4.0 ? 6.2 : 4.5)));
    formData.append('acetic_ac_s', String(params.aceticAcidPercent ?? 1.8));
    formData.append('butyric_ac_s', String(params.butyricAcidPercent ?? (params.pH > 4.8 ? 1.2 : 0.05)));
    formData.append('ammonia_s', String(params.ammoniaNPercent ?? (params.pH > 4.5 ? 11.5 : 6.5)));
    formData.append('starch_s', String(params.starchPercent ?? 21.0));
    formData.append('ndf_s', String(params.ndfPercent ?? 46.5));
    formData.append('adf_s', String(params.adfPercent ?? 27.9));

    if (params.farmId) formData.append('farm_id', params.farmId);
    if (params.animalId) formData.append('animal_id', params.animalId);
    if (params.imageFile) {
      formData.append('image', params.imageFile, (params.imageFile as File).name || 'silage_image.jpg');
    }

    return await apiFetch<CombinedSilageAnalysisResponse>('/analyze/silage', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Comprehensive Silage Quality & Fermentation Quality Index (FQI) Analysis
   * Source of Truth: FastAPI POST /api/v1/predict/silage/comprehensive (FAO Random Forest & XGBoost ML)
   */
  async analyzeSilage(params: {
    silageType: string;
    imageUrl?: string;
    sampleAmount?: number;
    sampleAmountUnit?: string;
    phValue?: number;
    moisturePercent?: number;
    storageDurationDays?: number;
    internalTemperatureC?: number;
    inputSource: 'Manual Entry' | 'Portable Scanner Simulation' | 'Mock IoT Storage Monitoring';
  }): Promise<SilageAnalysisResult> {
    const isOffline = !navigator.onLine;

    const ph = Number(params.phValue) || 3.85;
    const moisture = Number(params.moisturePercent) || 66.4;
    const dm = Number((100 - moisture).toFixed(1));
    const temp = Number(params.internalTemperatureC) || 26.0;
    const storageDays = Number(params.storageDurationDays) || 60;

    if (!isOffline) {
      const silagePayload = {
        pH: ph,
        'dm.s': dm,
        'cp.s': 14.5,
        'ammonia.s': ph > 4.5 ? 12.0 : 6.5,
        'lactic.ac.s': ph < 4.0 ? 6.5 : 4.5,
        'butyric.ac.s': temp > 35 ? 1.5 : 0.05,
      };

      const response = await apiFetch<{
        quality_classification: {
          predicted_class: 'ea' | 'la' | string;
          class_label: string;
          confidence: number;
          probabilities: Record<string, number>;
          model_accuracy: number;
        };
        fermentation_quality_index: {
          predicted_fqi: number;
          interpretation: string;
          model_r2_score: number;
        };
      }>('/predict/silage/comprehensive', {
        method: 'POST',
        body: JSON.stringify(silagePayload),
      });

      const qc = response.quality_classification;
      const fqi = response.fermentation_quality_index;

      // Deterministic evaluation based on actual returned FQI, acidity class, and temperature
      const isHeating = temp > 35.0;
      const isHighPh = ph > 4.8;
      const isEarlyLactic = qc.predicted_class === 'ea' && ph <= 4.2 && !isHeating;

      // Calculate final score calibrated from model FQI and physical parameters
      let finalFqi = fqi.predicted_fqi;
      if (isHeating) {
        finalFqi = Math.min(finalFqi, 40.0);
      } else if (isEarlyLactic && finalFqi < 75.0) {
        finalFqi = 85.0;
      }

      const score = Math.round(finalFqi);

      let overallQuality: SilageAnalysisResult['overallQuality'] = 'Good Fermentation';
      let isGoodVerdict: 'Good' | 'Moderate' | 'Poor' = 'Good';
      let simpleVerdict = 'Your silage is well-fermented with optimal lactic acidity and safe for cattle.';
      let fermentationStatus: SilageAnalysisResult['fermentationStatus'] = 'Optimal Lactic Acid';
      let spoilageRisk: SilageAnalysisResult['spoilageRisk'] = 'Low';
      let mouldRisk: SilageAnalysisResult['mouldRisk'] = 'Clean / Safe';

      if (score >= 75 && !isHeating && !isHighPh) {
        overallQuality = 'Excellent Lactic';
        isGoodVerdict = 'Good';
        simpleVerdict = 'Optimal lactic acid fermentation. High palatability and safe for lactating cattle.';
        fermentationStatus = 'Optimal Lactic Acid';
        spoilageRisk = 'Low';
        mouldRisk = 'Clean / Safe';
      } else if (score >= 50 && !isHeating) {
        overallQuality = 'Good Fermentation';
        isGoodVerdict = 'Moderate';
        simpleVerdict = 'Silage fermentation is acceptable. Discard exposed top layer before feeding.';
        fermentationStatus = qc.predicted_class === 'la' ? 'Sub-optimal Acetic' : 'Optimal Lactic Acid';
        spoilageRisk = 'Medium';
        mouldRisk = 'Surface Crust Only';
      } else {
        overallQuality = 'Spoiled / Butyric';
        isGoodVerdict = 'Poor';
        simpleVerdict = isHeating
          ? 'Elevated core temperature (>35°C) indicates aerobic spoilage. Do not feed directly.'
          : 'High pH or clostridial butyric fermentation detected. Risk of digestive disturbance.';
        fermentationStatus = 'Clostridial / Butyric Spoilage';
        spoilageRisk = 'High Risk';
        mouldRisk = 'Deep Penetration Mould';
      }

      const newAnalysis: SilageAnalysisResult = {
        id: `sil-${Date.now()}`,
        batchId: `DN-SIL-${new Date().toISOString().split('T')[0]}-S${Math.floor(Math.random() * 900 + 100)}`,
        date: new Date().toISOString().split('T')[0],
        silageType: params.silageType || 'Whole Corn (Maize) Silage',
        imageUrl: params.imageUrl || '',
        sampleAmount: params.sampleAmount,
        sampleAmountUnit: params.sampleAmountUnit || 'kg',
        overallQuality,
        isGood: isGoodVerdict,
        simpleVerdict,
        phValue: ph,
        moisturePercent: moisture,
        dryMatterPercent: dm,
        storageDurationDays: storageDays,
        internalTemperatureC: temp,
        fermentationStatus,
        spoilageRisk,
        mouldRisk,
        fqiScore: score,
        confidence: Number((qc.confidence * 100).toFixed(1)),
        modelAccuracy: Number((qc.model_accuracy * 100).toFixed(1)),
        storageAdvice: `${fqi.interpretation}. FAO Model Conf: ${(qc.confidence * 100).toFixed(1)}% (FQI: ${score}/100).`,
        recommendations: [
          isGoodVerdict === 'Good'
            ? 'Maintain weighted plastic cover seal after each daily extraction.'
            : 'Remove and discard discolored top 5cm layer before feeding.',
          'Slice silage pit face vertically without loosening the underlying pack.',
          'Maintain transition period of 5-7 days for milking cows.',
        ],
        inputSource: params.inputSource,
        qrBatchId: `QR-SIL-${Math.floor(Math.random() * 9000 + 1000)}`,
      };

      const current = getStoredItem<SilageAnalysisResult[]>('silage_analyses', INITIAL_SILAGE_ANALYSES);
      setStoredItem('silage_analyses', [newAnalysis, ...current]);
      return newAnalysis;
    }

    // Safe offline rule-based calculation
    const isLactic = ph <= 4.2 && temp <= 30.0;
    const isHeating = temp > 35.0 || ph > 4.8;
    const isGoodFallback: 'Good' | 'Moderate' | 'Poor' = isHeating ? 'Poor' : isLactic ? 'Good' : 'Moderate';
    const offlineScore = isLactic ? 85 : isHeating ? 38 : 64;

    const offlineAnalysis: SilageAnalysisResult = {
      id: `sil-${Date.now()}`,
      batchId: `DN-SIL-OFFLINE-${new Date().toISOString().split('T')[0]}-S${Math.floor(Math.random() * 900 + 100)}`,
      date: new Date().toISOString().split('T')[0],
      silageType: params.silageType || 'Whole Corn (Maize) Silage',
      imageUrl: params.imageUrl || '',
      sampleAmount: params.sampleAmount,
      sampleAmountUnit: params.sampleAmountUnit || 'kg',
      overallQuality: isHeating ? 'Spoiled / Butyric' : isLactic ? 'Excellent Lactic' : 'Good Fermentation',
      isGood: isGoodFallback,
      simpleVerdict: isGoodFallback === 'Good' ? 'Silage is well preserved (Offline Calculation).' : 'Silage requires monitoring for temperature and compaction.',
      phValue: ph,
      moisturePercent: moisture,
      dryMatterPercent: dm,
      storageDurationDays: storageDays,
      internalTemperatureC: temp,
      fermentationStatus: isHeating ? 'Clostridial / Butyric Spoilage' : isLactic ? 'Optimal Lactic Acid' : 'Sub-optimal Acetic',
      spoilageRisk: isHeating ? 'High Risk' : isLactic ? 'Low' : 'Medium',
      mouldRisk: isHeating ? 'Deep Penetration Mould' : 'Clean / Safe',
      fqiScore: offlineScore,
      confidence: 85.0,
      storageAdvice: 'Offline fermentation estimation based on standard pH-temperature curves. Connect to internet for live FAO ML predictions.',
      recommendations: [
        'Discard top dark or slimy layer (feed only clean golden-green silage)',
        'Reseal pit cover with sandbag weights after daily extraction',
      ],
      inputSource: params.inputSource,
      qrBatchId: `QR-SIL-OFFLINE-${Math.floor(Math.random() * 9000 + 1000)}`,
    };

    const current = getStoredItem<SilageAnalysisResult[]>('silage_analyses', INITIAL_SILAGE_ANALYSES);
    setStoredItem('silage_analyses', [offlineAnalysis, ...current]);
    return offlineAnalysis;
  },
};
