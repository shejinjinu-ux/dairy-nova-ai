import { API_BASE_URL, formatFarmerErrorMessage } from './apiHelper';
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
   * Screen bovine disease by uploading image to FastAPI EfficientNet-B3 endpoint
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
        console.warn('Could not convert imageUrl to Blob, using fallback upload:', e);
      }
    }

    if (!blob) {
      throw new Error('Please select or capture a clear photo of the animal for AI disease diagnosis.');
    }

    const formData = new FormData();
    formData.append('file', blob, 'cattle_diagnostic.jpg');

    const response = await fetch(`${API_BASE_URL}/predict/disease`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errJson: any = null;
      try {
        errJson = await response.json();
      } catch {
        errJson = { message: response.statusText };
      }
      throw new Error(formatFarmerErrorMessage(errJson, response.status));
    }

    const result = (await response.json()) as DiseasePredictionResponse;

    // Determine severity based on predicted class and confidence
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (result.is_disease_detected) {
      if (result.predicted_class === 'FMD') {
        severity = result.confidence > 0.8 ? 'critical' : 'high';
      } else if (result.predicted_class === 'LSD') {
        severity = result.confidence > 0.75 ? 'high' : 'medium';
      } else if (result.predicted_class === 'IBK') {
        severity = 'medium';
      }
    }

    // Build farmer-friendly guidance
    let preliminaryGuidance = '';
    let veterinaryAdvice = '';
    let symptomsDetected: string[] = [];
    let preventionTips: string[] = [];

    if (result.predicted_class === 'FMD') {
      preliminaryGuidance = 'Symptoms consistent with Foot-and-Mouth Disease (FMD) detected. High contagion risk.';
      veterinaryAdvice = 'Isolate the affected cattle immediately. Notify your local government veterinary officer and avoid moving animals outside the stall.';
      symptomsDetected = ['Oral lesions / salivation pattern', 'Foot discomfort markers', 'High fever indication'];
      preventionTips = ['Administer ring vaccination to rest of herd', 'Disinfect shed entrances with 4% sodium carbonate solution', 'Provide soft green mash feed'];
    } else if (result.predicted_class === 'LSD') {
      preliminaryGuidance = 'Cutaneous nodular eruptions consistent with Lumpy Skin Disease (LSD) identified.';
      veterinaryAdvice = 'Isolate animal in vector-free stall. Apply antiseptic spray on open nodules. Consult veterinarian for anti-inflammatory support.';
      symptomsDetected = ['Circumscribed skin nodules', 'Enlarged superficial lymph nodes', 'Pyrexia markers'];
      preventionTips = ['Spray neem oil / bio-repellent to control flies & mosquitoes', 'Vaccinate unaffected cattle with Goat Pox vaccine as prescribed', 'Maintain high biosecurity and clean bedding'];
    } else if (result.predicted_class === 'IBK') {
      preliminaryGuidance = 'Ocular opacity and conjunctivitis consistent with Infectious Bovine Keratoconjunctivitis (Pinkeye) detected.';
      veterinaryAdvice = 'Protect eyes from direct sunlight and dust. Consult veterinarian for topical antimicrobial eye ointment.';
      symptomsDetected = ['Corneal clouding / opacity', 'Excessive lacrimation / tearing', 'Blepharospasm'];
      preventionTips = ['Control fly population in shed', 'Provide shade during peak midday hours', 'Ensure adequate Vitamin A in ration'];
    } else {
      preliminaryGuidance = 'No clinical disease pathology detected. Animal exhibits normal, healthy phenotypic traits.';
      veterinaryAdvice = 'Continue routine health monitoring, balanced ICAR ration feeding, and timely seasonal vaccination.';
      symptomsDetected = ['Clear muzzle and eyes', 'Normal skin coat texture', 'Healthy posture'];
      preventionTips = ['Maintain clean drinking water 24/7', 'Adhere to scheduled deworming calendar', 'Ensure well-ventilated dry resting area'];
    }

    return {
      possibleConcern: result.disease_name_full,
      severity,
      confidenceScore: Math.round(result.confidence_percentage),
      preliminaryGuidance,
      veterinaryAdvice,
      symptomsDetected,
      preventionTips,
      disclaimer: result.disclaimer,
      rawResponse: result,
    };
  },

  /**
   * Classify bovine breed by uploading image to FastAPI ConvNeXt-Tiny endpoint
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

    const url = `${API_BASE_URL}/predict/breed?confidence_threshold=${confidenceThreshold}`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errJson: any = null;
      try {
        errJson = await response.json();
      } catch {
        errJson = { message: response.statusText };
      }
      throw new Error(formatFarmerErrorMessage(errJson, response.status));
    }

    return (await response.json()) as BreedPredictionResponse;
  },
};
