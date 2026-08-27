import { delay, getStoredItem, setStoredItem } from './apiHelper';
import { FeedAnalysisResult } from '../../types';
import { INITIAL_FEED_ANALYSES } from '../../mocks/mockData';

export const feedApi = {
  async getFeedAnalyses(): Promise<FeedAnalysisResult[]> {
    await delay(300);
    return getStoredItem<FeedAnalysisResult[]>('feed_analyses', INITIAL_FEED_ANALYSES);
  },

  async analyzeFeed(params: {
    feedCategory: string;
    feedName: string;
    imageUrl?: string;
    inputSource: 'Camera Only' | 'Portable Scanner Simulation' | 'Manual Entry';
    manualParameters?: {
      crudeProtein?: number;
      moisture?: number;
      fiber?: number;
      energy?: number;
    };
  }): Promise<FeedAnalysisResult> {
    await delay(1200); // realistic AI NIR analysis simulation

    const isHighMoisture = (params.manualParameters?.moisture || 12) > 16;
    const protein = params.manualParameters?.crudeProtein || (params.feedCategory === 'Concentrate Pellet' ? 22.0 : params.feedCategory === 'Green Fodder' ? 12.5 : 5.2);
    const moisture = params.manualParameters?.moisture || (params.feedCategory === 'Green Fodder' ? 78.0 : 11.5);
    const score = isHighMoisture ? 58 : protein > 18 ? 88 : protein > 10 ? 82 : 65;

    const newAnalysis: FeedAnalysisResult = {
      id: `feed-${Date.now()}`,
      batchId: `DN-FEED-${new Date().toISOString().split('T')[0]}-B${Math.floor(Math.random() * 900 + 100)}`,
      date: new Date().toISOString().split('T')[0],
      feedCategory: params.feedCategory,
      feedName: params.feedName || `${params.feedCategory} Sample`,
      imageUrl: params.imageUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22513?w=500&auto=format&fit=crop&q=80',
      overallScore: score,
      qualityGrade: score >= 85 ? 'Grade A+ (Premium)' : score >= 75 ? 'Grade A (Good)' : score >= 55 ? 'Grade B (Acceptable)' : 'Grade C (Low Quality)',
      crudeProteinPercent: Number(protein.toFixed(1)),
      moisturePercent: Number(moisture.toFixed(1)),
      dryMatterPercent: Number((100 - moisture).toFixed(1)),
      crudeFiberPercent: params.manualParameters?.fiber || (params.feedCategory === 'Dry Roughage' ? 36.5 : 24.2),
      tdnEnergyPercent: params.manualParameters?.energy || (protein > 15 ? 70.5 : 58.0),
      calciumPercent: 0.85,
      phosphorusPercent: 0.45,
      ureaRisk: 'Safe / None',
      silicaSandRisk: isHighMoisture ? 'Moderate (2-4%)' : 'Safe (<2%)',
      mycotoxinRisk: isHighMoisture ? 'Moderate Concern' : 'Undetected',
      fungalMouldRisk: isHighMoisture ? 'Mild Spores' : 'Clean',
      aiAdvisory: isHighMoisture
        ? 'Moisture content exceeds 15% safe threshold. Ensure 4 hours sun-drying to arrest fungal proliferation.'
        : 'High nutritional density detected. Safe and recommended for high-yielding lactating animals.',
      recommendations: [
        'Store in cool, dry, rodent-proof elevated pallets',
        'Maintain daily feeding ratio: 60% Green : 30% Dry : 10% Concentrate',
      ],
      inputSource: params.inputSource,
      isSafeForLactating: !isHighMoisture,
      qrBatchId: `QR-FEED-${Math.floor(Math.random() * 9000 + 1000)}`,
    };

    const current = getStoredItem<FeedAnalysisResult[]>('feed_analyses', INITIAL_FEED_ANALYSES);
    setStoredItem('feed_analyses', [newAnalysis, ...current]);
    return newAnalysis;
  },
};
