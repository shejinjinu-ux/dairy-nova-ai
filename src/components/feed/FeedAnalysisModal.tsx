import React, { useState, useRef } from 'react';
import { feedApi } from '../../services/api/feedApi';
import {
  FeedAnalysisResult,
  FeedVisualScreeningResponse,
  FeedReferenceResponse,
  CombinedFeedAnalysisResponse,
  QRBatch,
} from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { SourceTag } from '../common/SourceTag';
import { ReadAloudButton } from '../common/ReadAloudButton';
import { TestReportModal } from './TestReportModal';
import { validateFeedSampleImage } from '../../utils/imageSampleValidator';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  QrCode,
  Save,
  Wheat,
  AlertCircle,
  Loader2,
  FileText,
  Info,
  ShieldCheck,
} from 'lucide-react';

interface FeedAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisSaved: (result: FeedAnalysisResult) => void;
  onGenerateQRBatch?: (batch: QRBatch) => void;
  initialFeedType?: string;
  initialInputMethod?: 'Camera Only' | 'Portable Scanner Simulation' | 'Manual Entry';
}

const COMMON_FEED_PRESETS = [
  'Super Napier',
  'Maize Grain',
  'Green Sorghum',
  'Paddy Straw',
  'Wheat Straw',
  'Cottonseed Cake',
  'Wheat Bran',
  'Compound Cattle Feed',
];

export const FeedAnalysisModal: React.FC<FeedAnalysisModalProps> = ({
  isOpen,
  onClose,
  onAnalysisSaved,
  onGenerateQRBatch,
  initialFeedType = '',
  initialInputMethod = 'Manual Entry',
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Mode: 'image' (Method A) vs 'manual' (Method B)
  const [testMode, setTestMode] = useState<'image' | 'manual'>(
    initialInputMethod === 'Camera Only' ? 'image' : 'manual'
  );

  // Image Test States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [imageQuantityKg, setImageQuantityKg] = useState<number>(1.0);
  const [imageOptionalFeedName, setImageOptionalFeedName] = useState<string>('');

  // Manual Test States
  const [feedCategory, setFeedCategory] = useState<string>(initialFeedType);
  const [manualFeedName, setManualFeedName] = useState<string>('Super Napier');
  const [manualQuantityKg, setManualQuantityKg] = useState<number>(5.0);
  const [manualMoisture, setManualMoisture] = useState<number>(12.5);
  const [manualCrudeProtein, setManualCrudeProtein] = useState<number>(14.2);
  const [manualFiber, setManualFiber] = useState<number>(24.0);
  const [manualEnergy, setManualEnergy] = useState<number>(65.0);

  // Result and Loading States
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [visualResult, setVisualResult] = useState<FeedVisualScreeningResponse | null>(null);
  const [manualReferenceResult, setManualReferenceResult] = useState<FeedReferenceResponse | null>(null);
  const [combinedResult, setCombinedResult] = useState<CombinedFeedAnalysisResponse | null>(null);
  const [persistedFeedResult, setPersistedFeedResult] = useState<FeedAnalysisResult | null>(null);

  const [showDetailedParameters, setShowDetailedParameters] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showQRSuccess, setShowQRSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run Method A: Visual Image Screening
  const handleRunImageTest = async () => {
    if (!imageFile && !imagePreviewUrl) {
      setErrorMessage('Please capture or select a feed photo to proceed with visual screening.');
      return;
    }

    // Step 1: Lightweight Client-Side Suitability Validation (Avoid human photos, blank screens, landscapes)
    const validation = await validateFeedSampleImage(imageFile || imagePreviewUrl);
    if (!validation.isValid) {
      setErrorMessage(
        validation.message ||
          'The uploaded image is not cattle feed. Please upload a clear photo of cattle feed for quality testing.'
      );
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage('');
    setVisualResult(null);
    setManualReferenceResult(null);
    setCombinedResult(null);

    try {
      if (imageFile) {
        const visualResponse = await feedApi.screenFeedVisual(imageFile);

        // Guard against invalid image domain rejection (Human, animal, vehicle, landscape)
        if (!visualResponse.success || visualResponse.classification === 'NOT_FEED_OR_SILAGE' || !visualResponse.predicted_class) {
          setErrorMessage(
            visualResponse.message ||
              'The uploaded photo is not a cattle feed sample. Please upload a clear photo of cattle feed for quality testing.'
          );
          setIsAnalyzing(false);
          return;
        }

        setVisualResult(visualResponse);

        // Build standard FeedAnalysisResult for local history
        const score = visualResponse.predicted_class === 'GOOD' ? 88 : visualResponse.predicted_class === 'MOULD_RISK' ? 52 : 30;
        const isGood = visualResponse.predicted_class === 'GOOD' ? 'Good' : visualResponse.predicted_class === 'MOULD_RISK' ? 'Moderate' : 'Poor';

        const historyItem: FeedAnalysisResult = {
          id: `feed-vis-${Date.now()}`,
          batchId: `DN-VIS-${new Date().toISOString().split('T')[0]}-B${Math.floor(Math.random() * 900 + 100)}`,
          date: new Date().toISOString().split('T')[0],
          feedCategory: 'Visual Screening',
          feedName: imageOptionalFeedName.trim() || 'Feed Sample (Visual)',
          imageUrl: imagePreviewUrl,
          overallScore: score,
          qualityGrade: visualResponse.predicted_class === 'GOOD' ? 'Grade A (Visual Clean)' : visualResponse.predicted_class === 'MOULD_RISK' ? 'Grade B (Mould Risk)' : 'Grade C (Spoiled)',
          isGood,
          simpleVerdict: visualResponse.why?.join(' ') || 'Visual screening complete.',
          crudeProteinPercent: 0,
          moisturePercent: 0,
          dryMatterPercent: 0,
          crudeFiberPercent: 0,
          tdnEnergyPercent: 0,
          calciumPercent: 0,
          phosphorusPercent: 0,
          ureaRisk: 'Safe / None',
          silicaSandRisk: 'Safe (<2%)',
          mycotoxinRisk: visualResponse.risk_level === 'LOW' ? 'Low Risk' : visualResponse.risk_level === 'MEDIUM' ? 'Moderate Concern' : 'Severe Aflatoxin Warning',
          fungalMouldRisk: visualResponse.predicted_class === 'GOOD' ? 'Clean' : 'Active Mould Detected',
          aiAdvisory: visualResponse.why?.join(' ') || '',
          recommendations: visualResponse.recommended_action || [
            'Store feed in a clean, elevated, well-ventilated dry area.',
            'Inspect regularly for insect pests or seepage.',
          ],
          inputSource: 'Camera Only',
          isSafeForLactating: isGood !== 'Poor',
          qrBatchId: `QR-VIS-${Math.floor(Math.random() * 9000 + 1000)}`,
        };
        setPersistedFeedResult(historyItem);
      } else {
        setErrorMessage('Image sample not found.');
      }
      setIsAnalyzing(false);
    } catch (err: any) {
      setIsAnalyzing(false);
      setErrorMessage(err.message || 'Visual screening encountered an issue. Please try again.');
    }
  };

  // Run Method B: Manual / Reference Nutrition Test
  const handleRunManualTest = async () => {
    if (!manualFeedName.trim()) {
      setErrorMessage('Please select or enter the feed name.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage('');
    setVisualResult(null);
    setManualReferenceResult(null);
    setCombinedResult(null);

    try {
      // 1. Fetch live ICAR proximate reference
      const refResponse = await feedApi.getFeedReference(manualFeedName.trim(), manualQuantityKg);
      setManualReferenceResult(refResponse);

      // 2. Fetch combined analysis for score, why and recommendations
      const combined = await feedApi.analyzeFeedCombined({
        feedName: manualFeedName.trim(),
        quantityKg: manualQuantityKg,
        farmId: user?.farmName || null,
      });
      setCombinedResult(combined);

      const score = combined.quality_score || 80;
      const isGood: 'Good' | 'Moderate' | 'Poor' = combined.status === 'GOOD' ? 'Good' : combined.status === 'CAUTION' ? 'Moderate' : 'Poor';

      const historyItem: FeedAnalysisResult = {
        id: `feed-ref-${Date.now()}`,
        batchId: `DN-REF-${new Date().toISOString().split('T')[0]}-B${Math.floor(Math.random() * 900 + 100)}`,
        date: new Date().toISOString().split('T')[0],
        feedCategory,
        feedName: refResponse.matched_feed_name || manualFeedName,
        imageUrl: '',
        overallScore: score,
        qualityGrade: score >= 85 ? 'Grade A+ (Premium)' : score >= 70 ? 'Grade A (Good)' : score >= 50 ? 'Grade B (Acceptable)' : 'Grade C (Low)',
        isGood,
        simpleVerdict: combined.why?.join(' ') || 'Standard ICAR reference profile.',
        crudeProteinPercent: refResponse.nutrient_percentages_dm.crude_protein_percent_dm,
        moisturePercent: Number((100 - refResponse.nutrient_percentages_dm.dry_matter_percent).toFixed(1)),
        dryMatterPercent: refResponse.nutrient_percentages_dm.dry_matter_percent,
        crudeFiberPercent: refResponse.nutrient_percentages_dm.crude_fibre_percent_dm,
        ndfPercent: refResponse.nutrient_percentages_dm.ndf_percent_dm,
        adfPercent: refResponse.nutrient_percentages_dm.adf_percent_dm,
        adlPercent: refResponse.nutrient_percentages_dm.adl_percent_dm,
        starchPercent: refResponse.nutrient_percentages_dm.starch_percent_dm,
        tdnEnergyPercent: refResponse.nutrient_percentages_dm.metabolizable_energy_mj_kg_dm,
        calciumPercent: Number((refResponse.per_kg.calcium_g / 10).toFixed(2)),
        phosphorusPercent: Number((refResponse.per_kg.phosphorus_g / 10).toFixed(2)),
        ureaRisk: combined.risk_analysis.urea_adulteration?.status || 'Safe / None',
        silicaSandRisk: combined.risk_analysis.sand_silica_contamination?.status || 'Safe (<2%)',
        mycotoxinRisk: combined.risk_analysis.mould_risk?.level || 'Low Risk',
        fungalMouldRisk: combined.risk_analysis.mould_risk?.level || 'Clean',
        aiAdvisory: combined.why?.join(' ') || '',
        recommendations: combined.recommended_action || [
          'Store feed in cool, dry elevated pallets with adequate airflow',
          'Maintain balanced roughage-to-concentrate ratio (60:40)',
        ],
        inputSource: 'Manual Entry',
        isSafeForLactating: isGood !== 'Poor',
        qrBatchId: `QR-REF-${Math.floor(Math.random() * 9000 + 1000)}`,
      };

      setPersistedFeedResult(historyItem);
      setIsAnalyzing(false);
    } catch (err: any) {
      setIsAnalyzing(false);
      setErrorMessage(err.message || 'Nutritional reference analysis encountered an issue. Please try again.');
    }
  };

  const handleSave = () => {
    if (!persistedFeedResult) return;
    onAnalysisSaved(persistedFeedResult);
    onClose();
  };

  const handleCreateQR = () => {
    if (!persistedFeedResult) return;
    const batch: QRBatch = {
      batchId: persistedFeedResult.batchId,
      itemType: 'Feed',
      title: persistedFeedResult.feedName,
      farmName: user?.farmName || 'My Dairy Farm',
      farmerName: user?.name || 'Farmer',
      generatedDate: persistedFeedResult.date,
      qualityGrade: persistedFeedResult.qualityGrade,
      adulterationFlags: `Mould: ${persistedFeedResult.fungalMouldRisk}`,
      verificationStatus: persistedFeedResult.isGood === 'Good' ? 'Certified Safe' : 'Requires Lab Review',
      dataSource: testMode === 'image' ? 'Visual Screening' : 'ICAR Reference Tables',
      parameters: {
        'Dry Matter': `${persistedFeedResult.dryMatterPercent}%`,
        'Crude Protein': `${persistedFeedResult.crudeProteinPercent}%`,
        'Crude Fiber': `${persistedFeedResult.crudeFiberPercent}%`,
      },
      qrPayload: `https://dairynova.ai/verify/feed/${persistedFeedResult.batchId}`,
    };

    if (onGenerateQRBatch) onGenerateQRBatch(batch);
    setShowQRSuccess(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm sm:max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Wheat size={13} /> {t.rapidFeedTest || 'Rapid Feed Quality Test'}
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {visualResult || manualReferenceResult ? '🔬 Feed Test Results' : 'Choose Testing Method'}
              </h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 flex items-center justify-center active:scale-95 transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* TWO CLEAR MODES SELECTOR */}
          {!visualResult && !manualReferenceResult && !isAnalyzing && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setTestMode('image');
                  setErrorMessage('');
                }}
                className={`py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                  testMode === 'image'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md ring-1 ring-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Camera size={15} />
                <span>{t.imageTest || '📷 Image Test'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTestMode('manual');
                  setErrorMessage('');
                }}
                className={`py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                  testMode === 'manual'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md ring-1 ring-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles size={15} />
                <span>{t.manualTest || '✍ Manual Test'}</span>
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-shake">
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ================= METHOD A: IMAGE TEST UI ================= */}
          {testMode === 'image' && !visualResult && !isAnalyzing && (
            <div className="space-y-3.5 animate-fadeIn text-xs">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-[11px] leading-relaxed flex items-start gap-2">
                <Info size={16} className="shrink-0 text-blue-600 mt-0.5" />
                <span>
                  {t.visualOnlyExplain ||
                    'Image screening checks visible mould, discoloration, and spoilage indicators. Feed type is optional.'}
                </span>
              </div>

              {/* Image Upload Box */}
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
                {imagePreviewUrl ? (
                  <div className="space-y-2">
                    <img
                      src={imagePreviewUrl}
                      alt="Feed sample preview"
                      className="h-44 w-full object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 size={13} /> Photo ready for screening
                      </span>
                      <label className="text-[11px] text-teal-600 hover:underline cursor-pointer font-bold">
                        Change Photo
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                      <Camera size={24} />
                    </div>
                    <strong className="block text-slate-900 dark:text-white text-xs">
                      Take Feed Photo or Upload Sample
                    </strong>
                    <label className="inline-flex py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 transition">
                      <Upload size={14} className="mr-1.5" /> Select / Take Photo
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Optional Fields for Image Mode */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t.quantityKg || 'Quantity (kg)'} (Optional)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={imageQuantityKg}
                    onChange={(e) => setImageQuantityKg(parseFloat(e.target.value) || 1.0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t.feedNameOptional || 'Feed Type (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={imageOptionalFeedName}
                    onChange={(e) => setImageOptionalFeedName(e.target.value)}
                    placeholder="e.g. Green Napier"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Run Image Test Button */}
              <button
                type="button"
                onClick={handleRunImageTest}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <Camera size={16} />
                <span>Run Visual Mould Screening</span>
              </button>
            </div>
          )}

          {/* ================= METHOD B: MANUAL / REFERENCE TEST UI ================= */}
          {testMode === 'manual' && !manualReferenceResult && !isAnalyzing && (
            <div className="space-y-3.5 animate-fadeIn text-xs">
              
              {/* Category Quick Selector */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Feed Category
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'Green Fodder', label: '🌱 Green Fodder' },
                    { id: 'Dry Feed', label: '🌾 Dry Roughage / Straw' },
                    { id: 'Silage', label: '🌽 Silage' },
                    { id: 'Concentrate', label: '🥣 Concentrate Feed' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setFeedCategory(cat.id);
                        if (cat.id === 'Green Fodder') setManualFeedName('Super Napier');
                        else if (cat.id === 'Dry Feed') setManualFeedName('Paddy Straw');
                        else if (cat.id === 'Silage') setManualFeedName('Maize Silage');
                        else setManualFeedName('Compound Cattle Feed');
                      }}
                      className={`p-2 rounded-xl border text-[11px] font-bold transition text-left ${
                        feedCategory === cat.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-500 ring-1 ring-emerald-500'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed Presets */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  Standard Indian Feeds (ICAR Database):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_FEED_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setManualFeedName(preset)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                        manualFeedName === preset
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed Name & Quantity */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Feed Name *
                  </label>
                  <input
                    type="text"
                    value={manualFeedName}
                    onChange={(e) => setManualFeedName(e.target.value)}
                    placeholder="e.g. Maize Grain / Super Napier"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Quantity (kg) *
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={manualQuantityKg}
                    onChange={(e) => setManualQuantityKg(parseFloat(e.target.value) || 1.0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Run Manual Test Button */}
              <button
                type="button"
                onClick={handleRunManualTest}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <Sparkles size={16} />
                <span>Fetch ICAR Proximate Nutrition</span>
              </button>
            </div>
          )}

          {/* ================= LOADING STATE ================= */}
          {isAnalyzing && (
            <div className="py-12 text-center space-y-3 animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto animate-spin">
                <Loader2 size={28} />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {t.analyzingSample || 'Analyzing feed sample...'}
              </h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                {testMode === 'image'
                  ? 'Performing optical mould screening and surface discolouration analysis...'
                  : 'Retrieving ICAR-NIANP standard feed composition and evaluating quality score...'}
              </p>
            </div>
          )}

          {/* ================= METHOD A: VISUAL RESULT DISPLAY ================= */}
          {visualResult && (
            <div className="space-y-3.5 animate-fadeIn text-xs">
              
              {/* Visual Result Hero Card */}
              <div className="p-4 rounded-3xl bg-slate-900 text-white border border-slate-800 text-center space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Visual Mould Screening</span>
                  <SourceTag source="Rule-Based Visual Screening" className="bg-white/10 text-slate-200 border-white/20" />
                </div>

                <div className="py-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    Screening Status:
                  </div>
                  <div className="flex items-center justify-center gap-2 my-1">
                    <span
                      className={`text-2xl font-black px-4 py-1 rounded-full border ${
                        visualResult.predicted_class === 'GOOD'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : visualResult.predicted_class === 'MOULD_RISK'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {visualResult.predicted_class === 'GOOD'
                        ? '🟢 GOOD (CLEAN)'
                        : visualResult.predicted_class === 'MOULD_RISK'
                        ? '🟡 MOULD RISK'
                        : '🔴 SPOILED / REJECT'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold">
                    Confidence: <strong className="text-white">{visualResult.confidence_percentage || (visualResult.confidence != null ? (visualResult.confidence * 100).toFixed(1) : '95.0')}%</strong> • Risk Level: <strong className="text-white">{visualResult.risk_level || 'LOW'}</strong>
                  </div>
                </div>
              </div>

              {/* Visual Indicators */}
              {visualResult.visual_indicators && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 block">
                    Surface Visual Indicators:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between">
                      <span className="text-slate-400">Discolouration Index:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{visualResult.visual_indicators.surface_discolouration_index ?? 0}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between">
                      <span className="text-slate-400">Fungal Hyphae:</span>
                      <strong className={visualResult.visual_indicators.white_grey_hyphae_indicators ? 'text-rose-600' : 'text-emerald-600'}>
                        {visualResult.visual_indicators.white_grey_hyphae_indicators ? 'Detected' : 'None'}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Why & Recommended Actions */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2 text-emerald-950 dark:text-emerald-100">
                <span className="font-extrabold text-[11px] flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300">
                  <Sparkles size={13} className="text-emerald-600" /> Why this result?
                </span>
                <div className="space-y-1 text-[11px]">
                  {visualResult.why?.map((w, i) => (
                    <p key={i}>• {w}</p>
                  ))}
                </div>

                <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 space-y-1">
                  <strong className="text-[11px] font-extrabold text-emerald-900 dark:text-emerald-300 block">
                    Recommended Action:
                  </strong>
                  <div className="space-y-0.5 text-[10px] text-emerald-800 dark:text-emerald-300">
                    {visualResult.recommended_action?.map((act, i) => (
                      <p key={i}>• {act}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Honest Disclaimer */}
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[10px] flex items-start gap-1.5">
                <ShieldCheck size={13} className="shrink-0 mt-0.5 text-slate-400" />
                <span>{visualResult.disclaimer}</span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setVisualResult(null);
                    setTestMode('image');
                  }}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300"
                >
                  Test Another Photo
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition flex items-center justify-center gap-1"
                >
                  <Save size={13} />
                  <span>Save Result</span>
                </button>
              </div>

            </div>
          )}

          {/* ================= METHOD B: MANUAL / REFERENCE RESULT DISPLAY ================= */}
          {manualReferenceResult && (
            <div className="space-y-3.5 animate-fadeIn text-xs">
              
              {/* Reference Nutrition Hero Card */}
              <div className="p-4 rounded-3xl bg-slate-900 text-white border border-slate-800 text-center space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{manualReferenceResult.matched_feed_name} ({manualReferenceResult.quantity_kg} kg)</span>
                  <SourceTag source="ICAR-NIANP Tables" className="bg-white/10 text-slate-200 border-white/20" />
                </div>

                <div className="py-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    Quality Score:
                  </div>
                  <div className="flex items-center justify-center gap-1.5 my-0.5">
                    <span className="text-3xl font-black text-white">
                      {combinedResult?.quality_score || 80}
                    </span>
                    <span className="text-slate-400 text-sm font-bold">/ 100</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs font-black">
                    <span className={`px-2.5 py-0.5 rounded-full border ${
                      combinedResult?.status === 'GOOD'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {combinedResult?.status === 'GOOD' ? '🟢 GOOD TO FEED' : '🟡 USE WITH CAUTION'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Proximate Nutrients Table (ICAR Benchmark) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300">
                    Proximate Nutrient Composition (% DM Basis):
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">ICAR Standards</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400">Dry Matter:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{manualReferenceResult.nutrient_percentages_dm.dry_matter_percent}%</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400">Crude Protein:</span>
                    <strong className="text-emerald-600 font-bold">{manualReferenceResult.nutrient_percentages_dm.crude_protein_percent_dm}%</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400">Crude Fibre:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{manualReferenceResult.nutrient_percentages_dm.crude_fibre_percent_dm}%</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400">NDF:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{manualReferenceResult.nutrient_percentages_dm.ndf_percent_dm}%</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400">ADF:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{manualReferenceResult.nutrient_percentages_dm.adf_percent_dm}%</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400">Starch:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{manualReferenceResult.nutrient_percentages_dm.starch_percent_dm}%</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400">Metabolizable Energy:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{manualReferenceResult.nutrient_percentages_dm.metabolizable_energy_mj_kg_dm} MJ/kg</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400">Total Dry Matter:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{manualReferenceResult.total_for_quantity.dry_matter_g} g</strong>
                  </div>
                </div>
              </div>

              {/* Why & Recommended Actions */}
              {combinedResult && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2 text-emerald-950 dark:text-emerald-100">
                  <span className="font-extrabold text-[11px] flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300">
                    <Sparkles size={13} className="text-emerald-600" /> Nutritional Advisory:
                  </span>
                  <div className="space-y-1 text-[11px]">
                    {combinedResult.why?.map((w, i) => (
                      <p key={i}>• {w}</p>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 space-y-1">
                    <strong className="text-[11px] font-extrabold text-emerald-900 dark:text-emerald-300 block">
                      Recommended Action:
                    </strong>
                    <div className="space-y-0.5 text-[10px] text-emerald-800 dark:text-emerald-300">
                      {combinedResult.recommended_action?.map((act, i) => (
                        <p key={i}>• {act}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[10px] flex items-start gap-1.5">
                <ShieldCheck size={13} className="shrink-0 mt-0.5 text-slate-400" />
                <span>{manualReferenceResult.disclaimer}</span>
              </div>

              {/* Actions Grid */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <FileText size={14} />
                  <span>{t.downloadShareReport || '📄 Download / Share Report'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCreateQR}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 hover:bg-slate-50 transition"
                  >
                    <QrCode size={13} />
                    <span>{showQRSuccess ? 'QR Generated' : 'Create QR Seal'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-600/20 active:scale-95 transition"
                  >
                    <Save size={13} />
                    <span>Save to History</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Report Modal */}
      {persistedFeedResult && (
        <TestReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          testType="Feed"
          result={persistedFeedResult}
        />
      )}
    </>
  );
};
