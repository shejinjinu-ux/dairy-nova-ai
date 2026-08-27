import { delay } from './apiHelper';
import { SIMULATED_DISEASE_DIAGNOSTICS } from '../../mocks/mockResponses';

export interface DiseaseScreeningInput {
  imageUrl?: string;
  symptomsText: string;
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
}

export const aiApi = {
  async screenDisease(input: DiseaseScreeningInput): Promise<DiseaseScreeningOutput> {
    await delay(1500); // realistic radar scanning pulse delay

    const text = (input.symptomsText || '').toLowerCase();
    const match = SIMULATED_DISEASE_DIAGNOSTICS.find((d) =>
      d.keywords.some((k) => text.includes(k))
    );

    if (match) {
      return {
        ...match.result,
        disclaimer:
          'This AI screening provides preliminary guidance and does not replace a qualified veterinarian. Always consult a certified veterinary doctor before administering medication.',
      };
    }

    // Default general screening if no keyword matched
    return {
      possibleConcern: 'Mild Non-Specific Fatigue / Digestive Sluggishness',
      severity: 'low',
      confidenceScore: 82,
      preliminaryGuidance:
        'No acute infectious markers detected. Monitor rumination rate and ensure 24/7 access to fresh, clean drinking water.',
      veterinaryAdvice:
        'If symptoms persist beyond 24 hours or body temperature exceeds 39.2°C, schedule a clinical examination with your local veterinarian.',
      symptomsDetected: ['Mild lethargy', 'Normal vital range indication'],
      preventionTips: [
        'Provide electrolyte water in afternoon heat',
        'Add 50g chelated mineral mixture to daily grain ration',
        'Check shed ventilation and dry bedding cleanliness',
      ],
      disclaimer:
        'This AI screening provides preliminary guidance and does not replace a qualified veterinarian.',
    };
  },

  async screenBreed(input: { imageUrl?: string; characteristics?: string[] }): Promise<{
    estimatedBreed: string;
    animalType: 'Cow' | 'Buffalo';
    confidence: number;
    traits: string[];
    disclaimer: string;
  }> {
    await delay(1200);
    return {
      estimatedBreed: 'Gir Cow (Indigenous Bos Indicus)',
      animalType: 'Cow',
      confidence: 93,
      traits: ['Prominent convex forehead (dome-shaped)', 'Long pendulous ears extending to muzzle', 'A2 milk genetic profile'],
      disclaimer: 'AI Breed Screening provides estimated classification based on visual phenotypic characteristics.',
    };
  },
};
