import { API_BASE_URL, formatFarmerErrorMessage, apiFetch } from './apiHelper';
import { DiseasePredictionResponse, BreedPredictionResponse } from '../../types';

export interface DiseaseScreeningInput {
  imageFile?: File | Blob | null;
  imageUrl?: string;
  symptomsText?: string;
  animalId?: string;
  animalTag?: string;
}

export interface DiseaseScreeningOutput {
  possibleConcern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidenceScore: number;
  preliminaryGuidance: string;
  veterinaryAdvice: string;
  symptomsDetected: string[];
  preventionTips: string[];
  recommendedVaccine?: string | null;
  vaccinationTiming?: string | null;
  estimatedCost?: string | null;
  farmerCostDisplay?: string | null;
  procurementCostDisplay?: string | null;
  retailPriceDisplay?: string | null;
  priceType?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  sourceDate?: string | null;
  eligibilityNotes?: string | null;
  priceDetail?: any;
  disclaimer: string;
  rawResponse?: DiseasePredictionResponse;
}

/**
 * Helper to convert a dataURL or image URL to a Blob
 */
async function urlToBlob(url: string): Promise<Blob> {
  if (url.startsWith('data:')) {
    const arr = url.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  const response = await fetch(url);
  return await response.blob();
}

export const aiApi = {
  /**
   * Screen bovine disease by uploading image to FastAPI endpoint
   * POST /api/v1/predict/disease
   */
  async screenDisease(input: DiseaseScreeningInput): Promise<DiseaseScreeningOutput> {
    let blob: Blob | null = null;

    if (input.imageFile) {
      blob = input.imageFile;
    } else if (input.imageUrl) {
      try {
        blob = await urlToBlob(input.imageUrl);
      } catch (e) {
        console.warn('Could not convert imageUrl to Blob:', e);
      }
    }

    if (!blob) {
      throw new Error('Please select or capture a clear photo of the cattle for disease screening.');
    }

    const formData = new FormData();
    formData.append('file', blob, 'cattle_diagnostic.jpg');

    const result = await apiFetch<DiseasePredictionResponse>('/predict/disease', {
      method: 'POST',
      body: formData,
    });

    // Determine severity based on predicted class and confidence
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (result.is_disease_detected) {
      if (result.predicted_class === 'FMD') {
        severity = result.confidence > 0.8 ? 'critical' : 'high';
      } else if (result.predicted_class === 'LSD') {
        severity = result.confidence > 0.75 ? 'high' : 'medium';
      } else if (result.predicted_class === 'IBK') {
        severity = 'medium';
      } else {
        severity = result.confidence > 0.8 ? 'high' : 'medium';
      }
    }

    let preliminaryGuidance = '';
    let veterinaryAdvice = '';
    let symptomsDetected: string[] = [];
    let preventionTips: string[] = [];

    if (result.is_disease_detected) {
      const diseaseLabel = result.disease_name_full || result.predicted_class;
      const confPct = Math.round(result.confidence_percentage ?? (result.confidence * 100));

      if (result.predicted_class === 'FMD') {
        preliminaryGuidance = `Symptoms consistent with Foot-and-Mouth Disease (FMD) detected (${confPct}% confidence). High contagion risk.`;
        veterinaryAdvice = 'Isolate the affected cattle immediately. Notify your local government veterinary officer and avoid moving animals outside the stall.';
        symptomsDetected = ['Oral lesions / salivation pattern', 'Foot discomfort markers', 'High fever indication'];
        preventionTips = ['Administer ring vaccination to rest of herd', 'Disinfect shed entrances with 4% sodium carbonate solution', 'Provide soft green mash feed'];
      } else if (result.predicted_class === 'LSD') {
        preliminaryGuidance = `Cutaneous nodular eruptions consistent with Lumpy Skin Disease (LSD) identified (${confPct}% confidence).`;
        veterinaryAdvice = 'Isolate animal in vector-free stall. Apply antiseptic spray on open nodules. Consult veterinarian for anti-inflammatory support.';
        symptomsDetected = ['Circumscribed skin nodules', 'Enlarged superficial lymph nodes', 'Pyrexia markers'];
        preventionTips = ['Spray neem oil / bio-repellent to control flies & mosquitoes', 'Vaccinate unaffected cattle with Goat Pox vaccine as prescribed', 'Maintain high biosecurity and clean bedding'];
      } else if (result.predicted_class === 'IBK') {
        preliminaryGuidance = `Ocular opacity and conjunctivitis consistent with Infectious Bovine Keratoconjunctivitis (Pinkeye) detected (${confPct}% confidence).`;
        veterinaryAdvice = 'Protect eyes from direct sunlight and dust. Consult veterinarian for topical antimicrobial eye ointment.';
        symptomsDetected = ['Corneal clouding / opacity', 'Excessive lacrimation / tearing', 'Blepharospasm'];
        preventionTips = ['Control fly population in shed', 'Provide shade during peak midday hours', 'Ensure adequate Vitamin A in ration'];
      } else {
        preliminaryGuidance = `Clinical symptoms indicative of ${diseaseLabel} detected (${confPct}% confidence).`;
        veterinaryAdvice = 'Isolate the affected animal and consult a certified veterinarian for definitive clinical examination and appropriate treatment.';
        symptomsDetected = ['Visual lesion indicators', 'Clinical symptom pattern'];
        preventionTips = ['Maintain strict stall hygiene and biosecurity', 'Isolate affected animal to prevent herd contagion'];
      }
    } else {
      preliminaryGuidance = 'No acute clinical pathology detected. Cattle exhibits normal phenotypic traits.';
      veterinaryAdvice = 'Continue routine health monitoring, balanced ICAR ration feeding, and timely seasonal vaccination.';
      symptomsDetected = ['Clear muzzle and eyes', 'Normal skin coat texture', 'Healthy posture'];
      preventionTips = ['Maintain clean drinking water 24/7', 'Adhere to scheduled deworming calendar', 'Ensure well-ventilated dry resting area'];
    }

    return {
      possibleConcern: result.disease_name_full || (result.is_disease_detected ? result.predicted_class : 'Healthy Phenotype'),
      severity,
      confidenceScore: Math.round(result.confidence_percentage ?? (result.confidence * 100)),
      preliminaryGuidance: result.explanation || preliminaryGuidance,
      veterinaryAdvice,
      symptomsDetected,
      preventionTips,
      recommendedVaccine: result.recommended_vaccine || (result.predicted_class === 'FMD' ? 'FMD Trivalent (O, A, Asia-1)' : result.predicted_class === 'LSD' ? 'Goat Pox Vaccine / Raksha-LSD' : null),
      vaccinationTiming: result.vaccination_timing || (result.predicted_class === 'FMD' ? 'Every 6 months (Pre-monsoon & Post-monsoon)' : result.predicted_class === 'LSD' ? 'Annual booster' : null),
      estimatedCost: result.estimated_cost,
      farmerCostDisplay: result.farmer_cost_display,
      procurementCostDisplay: result.procurement_cost_display,
      retailPriceDisplay: result.retail_price_display,
      priceType: result.price_type,
      sourceName: result.source_name,
      sourceUrl: result.source_url,
      sourceDate: result.source_date,
      eligibilityNotes: result.eligibility_notes,
      priceDetail: result.price_detail,
      disclaimer: result.disclaimer || 'This is an AI screening result, not a confirmed veterinary diagnosis. Consult a qualified veterinarian.',
      rawResponse: result,
    };
  },

  /**
   * Classify bovine breed by uploading image to FastAPI endpoint
   * POST /api/v1/predict/breed
   */
  async screenBreed(
    fileOrBlob: File | Blob | string,
    confidenceThreshold: number = 0.70
  ): Promise<BreedPredictionResponse> {
    let blob: Blob;

    if (typeof fileOrBlob === 'string') {
      blob = await urlToBlob(fileOrBlob);
    } else {
      blob = fileOrBlob;
    }

    const formData = new FormData();
    formData.append('file', blob, 'cattle_breed.jpg');

    return await apiFetch<BreedPredictionResponse>(
      `/predict/breed?confidence_threshold=${confidenceThreshold}`,
      {
        method: 'POST',
        body: formData,
      }
    );
  },
};
