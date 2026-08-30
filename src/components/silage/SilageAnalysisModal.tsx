import React, { useState, useRef } from 'react';
import { silageApi } from '../../services/api/silageApi';
import {
  SilageAnalysisResult,
  SilageVisualScreeningResponse,
  CombinedSilageAnalysisResponse,
  QRBatch,
} from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { SourceTag } from '../common/SourceTag';
import { ReadAloudButton } from '../common/ReadAloudButton';
import { TestReportModal } from '../feed/TestReportModal';
import { validateSilageSampleImage } from '../../utils/imageSampleValidator';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  QrCode,
  Save,
  Layers,
  FileText,
  Loader2,
  AlertCircle,
  Camera,
  Upload,
  Info,
  ShieldCheck,
} from 'lucide-react';

interface SilageAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisSaved: (result: SilageAnalysisResult) => void;
  onGenerateQRBatch?: (batch: QRBatch) => void;
  initialSilageType?: string;
  initialInputMethod?: 'Manual Entry' | 'Portable Scanner Simulation' | 'Mock IoT Storage Monitoring';
}

const COMMON_SILAGE_SUGGESTIONS = [
  'Whole Corn (Maize) Silage',
  'Super Napier Silage',
  'Sorghum (Jowar) Silage',
  'Hybrid Napier Grass Silage',
  'Sugarcane Tops Silage',
  'Oats Silage',
  'Mixed Legume Silage',
];

export const SilageAnalysisModal: React.FC<SilageAnalysisModalProps> = ({
  isOpen,
  onClose,
  onAnalysisSaved,
  onGenerateQRBatch,
  initialSilageType = 'Whole Corn (Maize) Silage',
  initialInputMethod = 'Manual Entry',
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Mode: 'image' vs 'manual'
  const [testMode, setTestMode] = useState<'image' | 'manual'>('manual');

  // Image Test State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [imageCropName, setImageCropName] = useState<string>('Maize Silage');

  // Manual / Chemistry Parameters
  const [silageType, setSilageType] = useState<string>(initialSilageType || 'Whole Corn (Maize) Silage');
  const [phValue, setPhValue] = useState<number>(3.85);
  const [dmPercent, setDmPercent] = useState<number>(32.0);
  const [cpPercent, setCpPercent] = useState<number>(14.0);
  const [lacticAcidPercent, setLacticAcidPercent] = useState<number>(6.0);
  const [aceticAcidPercent, setAceticAcidPercent] = useState<number>(1.8);
  const [butyricAcidPercent, setButyricAcidPercent] = useState<number>(0.05);
  const [ammoniaNPercent, setAmmoniaNPercent] = useState<number>(6.5);
  const [starchPercent, setStarchPercent] = useState<number>(21.0);
  const [ndfPercent, setNdfPercent] = useState<number>(46.5);
  const [adfPercent, setAdfPercent] = useState<number>(27.9);

  // Result & UI State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [visualResult, setVisualResult] = useState<SilageVisualScreeningResponse | null>(null);
  const [combinedResult, setCombinedResult] = useState<CombinedSilageAnalysisResponse | null>(null);
  const [persistedSilageResult, setPersistedSilageResult] = useState<SilageAnalysisResult | null>(null);

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

  // Run Method A: Visual Silage Screening
  const handleRunImageTest = async () => {
    if (!imageFile && !imagePreviewUrl) {
      setErrorMessage('Please capture or select a silage image to proceed with visual screening.');
      return;
    }

    // Step 1: Lightweight Client-Side Suitability Validation (Avoid landscapes/distant fields)
    const validation = await validateSilageSampleImage(imageFile || imagePreviewUrl);
    if (!validation.isValid) {
      setErrorMessage(
        validation.message ||
          'Invalid Sample Image. Please upload a clear close-up photo of the silage sample or bunker face.'
      );
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage('');
    setVisualResult(null);
    setCombinedResult(null);

    try {
      if (imageFile) {
        const visualResponse = await silageApi.screenSilageVisual(imageFile);
        setVisualResult(visualResponse);

        const score = visualResponse.predicted_class === 'GOOD' ? 86 : visualResponse.predicted_class === 'MOULD_RISK' ? 50 : 25;
        const isGood = visualResponse.predicted_class === 'GOOD' ? 'Good' : visualResponse.predicted_class === 'MOULD_RISK' ? 'Moderate' : 'Poor';

        const historyItem: SilageAnalysisResult = {
          id: `sil-vis-${Date.now()}`,
          batchId: `DN-SIL-VIS-${new Date().toISOString().split('T')[0]}-S${Math.floor(Math.random() * 900 + 100)}`,
          date: new Date().toISOString().split('T')[0],
          silageType: imageCropName.trim() || 'Silage Sample (Visual)',
          imageUrl: imagePreviewUrl,
          overallQuality: visualResponse.predicted_class === 'GOOD' ? 'Good Fermentation' : 'Spoiled / Butyric',
          isGood,
          simpleVerdict: visualResponse.why?.join(' ') || 'Visual silage screening complete.',
          phValue: 3.85,
          moisturePercent: 68.0,
          dryMatterPercent: 32.0,
          storageDurationDays: 60,
          internalTemperatureC: 25.0,
          fermentationStatus: visualResponse.predicted_class === 'GOOD' ? 'Optimal Lactic Acid' : 'Clostridial / Butyric Spoilage',
          spoilageRisk: visualResponse.risk_level === 'LOW' ? 'Low' : 'High Risk',
          mouldRisk: visualResponse.predicted_class === 'GOOD' ? 'Clean / Safe' : 'Deep Penetration Mould',
          fqiScore: score,
          confidence: Number((visualResponse.confidence * 100).toFixed(1)),
          modelAccuracy: 95.0,
          storageAdvice: visualResponse.why?.join(' ') || '',
          recommendations: visualResponse.recommended_action || [
            'Advance bunker face at least 15-20 cm daily to maintain aerobic stability.',
            'Discard any visibly moulded or discolored crust before feeding.',
          ],
          inputSource: 'Manual Entry',
          qrBatchId: `QR-SIL-${Math.floor(Math.random() * 9000 + 1000)}`,
        };

        setPersistedSilageResult(historyItem);
      }
      setIsAnalyzing(false);
    } catch (err: any) {
      setIsAnalyzing(false);
      setErrorMessage(err.message || 'Silage visual screening failed. Please try again.');
    }
  };

  // Run Method B: Manual / Chemical Fermentation Test
  const handleRunManualTest = async () => {
    setIsAnalyzing(true);
    setErrorMessage('');
    setVisualResult(null);
    setCombinedResult(null);

    try {
      const combined = await silageApi.analyzeSilageCombined({
        pH: phValue,
        dmPercent: dmPercent,
        cpPercent: cpPercent,
        lacticAcidPercent: lacticAcidPercent,
        aceticAcidPercent: aceticAcidPercent,
        butyricAcidPercent: butyricAcidPercent,
        ammoniaNPercent: ammoniaNPercent,
        starchPercent: starchPercent,
        ndfPercent: ndfPercent,
        adfPercent: adfPercent,
        farmId: user?.farmName || null,
      });

      setCombinedResult(combined);

      const score = Math.round(combined.quality_score || 70);
      const isGood: 'Good' | 'Moderate' | 'Poor' =
        combined.status === 'GOOD' ? 'Good' : combined.status === 'CAUTION' ? 'Moderate' : 'Poor';

      const historyItem: SilageAnalysisResult = {
        id: `sil-chem-${Date.now()}`,
        batchId: `DN-SIL-CHEM-${new Date().toISOString().split('T')[0]}-S${Math.floor(Math.random() * 900 + 100)}`,
        date: new Date().toISOString().split('T')[0],
        silageType,
        imageUrl: '',
        overallQuality: combined.status === 'GOOD' ? 'Excellent Lactic' : combined.status === 'CAUTION' ? 'Good Fermentation' : 'Spoiled / Butyric',
        isGood,
        simpleVerdict: combined.why?.join(' ') || 'Silage fermentation analysis complete.',
        phValue,
        moisturePercent: Number((100 - dmPercent).toFixed(1)),
        dryMatterPercent: dmPercent,
        storageDurationDays: 60,
        internalTemperatureC: 25.0,
        fermentationStatus: combined.fermentation_ml?.quality_classification?.class_label || 'Optimal Lactic Acid',
        spoilageRisk: combined.risk_analysis.spoilage_risk?.level === 'LOW' ? 'Low' : 'High Risk',
        mouldRisk: combined.risk_analysis.mould_risk?.level === 'LOW' ? 'Clean / Safe' : 'Surface Crust Only',
        fqiScore: combined.fermentation_ml?.fermentation_quality_index?.predicted_fqi || score,
        confidence: Number(((combined.fermentation_ml?.quality_classification?.confidence || 0.95) * 100).toFixed(1)),
        modelAccuracy: Number(((combined.fermentation_ml?.quality_classification?.model_accuracy || 0.97) * 100).toFixed(1)),
        storageAdvice: combined.why?.join(' ') || '',
        recommendations: combined.recommended_action || [
          'Advance silo face 15-20 cm daily',
          'Discard spoiled outer layer before feeding',
        ],
        inputSource: 'Manual Entry',
        qrBatchId: `QR-SIL-${Math.floor(Math.random() * 9000 + 1000)}`,
      };

      setPersistedSilageResult(historyItem);
      setIsAnalyzing(false);
    } catch (err: any) {
      setIsAnalyzing(false);
      setErrorMessage(err.message || 'Silage chemical analysis failed. Please try again.');
    }
  };

  const handleSave = () => {
    if (!persistedSilageResult) return;
    onAnalysisSaved(persistedSilageResult);
    onClose();
  };

  const handleCreateQR = () => {
    if (!persistedSilageResult) return;
    const batch: QRBatch = {
      batchId: persistedSilageResult.batchId,
      itemType: 'Silage',
      title: persistedSilageResult.silageType,
      farmName: user?.farmName || 'My Dairy Farm',
      farmerName: user?.name || 'Farmer',
      generatedDate: persistedSilageResult.date,
      qualityGrade: persistedSilageResult.overallQuality,
      adulterationFlags: `Spoilage: ${persistedSilageResult.spoilageRisk} • Mould: ${persistedSilageResult.mouldRisk}`,
      verificationStatus: persistedSilageResult.isGood === 'Good' ? 'Certified Safe' : 'Requires Lab Review',
      dataSource: testMode === 'image' ? 'Visual Spoilage Screening' : 'FAO Fermentation Model',
      parameters: {
        'pH Acidity': `${persistedSilageResult.phValue} pH`,
        'FQI Score': `${persistedSilageResult.fqiScore}/100`,
        'Dry Matter': `${persistedSilageResult.dryMatterPercent}%`,
      },
      qrPayload: `https://dairynova.ai/verify/silage/${persistedSilageResult.batchId}`,
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
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1">
                <Layers size={13} /> {t.rapidSilageTest || 'Rapid Silage Quality Test'}
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {visualResult || combinedResult ? '🌽 Silage Test Results' : 'Choose Testing Method'}
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
          {!visualResult && !combinedResult && !isAnalyzing && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setTestMode('image');
                  setErrorMessage('');
                }}
                className={`py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                  testMode === 'image'
                    ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-md ring-1 ring-teal-500/20'
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
                    ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-md ring-1 ring-teal-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles size={15} />
                <span>{t.manualTest || '🧪 Manual Test'}</span>
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
                  Capture a clear photo of your silage bunker face, pit sample, or bag. Visual screening checks for surface discolouration, mould patches, and aerobic spoilage.
                </span>
              </div>

              {/* Image Upload Box */}
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
                {imagePreviewUrl ? (
                  <div className="space-y-2">
                    <img
                      src={imagePreviewUrl}
                      alt="Silage sample preview"
                      className="h-44 w-full object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-teal-600 font-bold flex items-center gap-1">
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
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
                      <Camera size={24} />
                    </div>
                    <strong className="block text-slate-900 dark:text-white text-xs">
                      Take Silage Pit / Bag Photo
                    </strong>
                    <label className="inline-flex py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-teal-600/20 active:scale-95 transition">
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

              {/* Silage Crop Type (Optional) */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Crop Type (Optional)
                </label>
                <input
                  type="text"
                  value={imageCropName}
                  onChange={(e) => setImageCropName(e.target.value)}
                  placeholder="e.g. Corn / Maize Silage"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleRunImageTest}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <Camera size={16} />
                <span>Run Silage Visual Screening</span>
              </button>
            </div>
          )}

          {/* ================= METHOD B: MANUAL / CHEMISTRY TEST UI ================= */}
          {testMode === 'manual' && !combinedResult && !isAnalyzing && (
            <div className="space-y-3.5 animate-fadeIn text-xs">
              
              {/* Crop Variety Selection */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Silage Crop Variety
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    'Whole Corn (Maize) Silage',
                    'Sorghum (Jowar) Silage',
                    'Hybrid Napier Grass Silage',
                    'Oats / Mixed Crop Silage',
                  ].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSilageType(type)}
                      className={`p-2 rounded-xl border text-[11px] font-bold transition text-left ${
                        silageType === type
                          ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-500 ring-1 ring-teal-500'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders & Inputs for Chemical Fermentation Parameters */}
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Fermentation Chemistry Parameters:
                  </span>
                  <span className="text-[10px] text-teal-600 font-bold">FAO Model Benchmarks</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                      <span>Acidity (pH)</span>
                      <strong className={`font-bold ${phValue <= 4.2 ? 'text-teal-600' : 'text-rose-600'}`}>
                        {phValue} pH
                      </strong>
                    </div>
                    <input
                      type="range"
                      min="3.2"
                      max="6.0"
                      step="0.05"
                      value={phValue}
                      onChange={(e) => setPhValue(parseFloat(e.target.value))}
                      className="w-full accent-teal-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                      <span>Dry Matter %</span>
                      <strong className="text-teal-600 font-bold">{dmPercent}%</strong>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="50"
                      step="0.5"
                      value={dmPercent}
                      onChange={(e) => setDmPercent(parseFloat(e.target.value))}
                      className="w-full accent-teal-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                      <span>Lactic Acid % DM</span>
                      <strong className="text-teal-600 font-bold">{lacticAcidPercent}%</strong>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="10.0"
                      step="0.1"
                      value={lacticAcidPercent}
                      onChange={(e) => setLacticAcidPercent(parseFloat(e.target.value))}
                      className="w-full accent-teal-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                      <span>Butyric Acid % DM</span>
                      <strong className={`font-bold ${butyricAcidPercent <= 0.1 ? 'text-teal-600' : 'text-rose-600'}`}>
                        {butyricAcidPercent}%
                      </strong>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="2.0"
                      step="0.02"
                      value={butyricAcidPercent}
                      onChange={(e) => setButyricAcidPercent(parseFloat(e.target.value))}
                      className="w-full accent-teal-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[9px] text-slate-400 block">Crude Protein %</span>
                    <input
                      type="number"
                      step="0.5"
                      value={cpPercent}
                      onChange={(e) => setCpPercent(parseFloat(e.target.value) || 14.0)}
                      className="w-full bg-transparent font-bold text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[9px] text-slate-400 block">Ammonia-N %</span>
                    <input
                      type="number"
                      step="0.5"
                      value={ammoniaNPercent}
                      onChange={(e) => setAmmoniaNPercent(parseFloat(e.target.value) || 6.5)}
                      className="w-full bg-transparent font-bold text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[9px] text-slate-400 block">Starch %</span>
                    <input
                      type="number"
                      step="0.5"
                      value={starchPercent}
                      onChange={(e) => setStarchPercent(parseFloat(e.target.value) || 21.0)}
                      className="w-full bg-transparent font-bold text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              {/* Submit Button */}
              <button
                type="button"
                onClick={handleRunManualTest}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <Sparkles size={16} />
                <span>Evaluate Fermentation Quality</span>
              </button>
            </div>
          )}

          {/* ================= LOADING STATE ================= */}
          {isAnalyzing && (
            <div className="py-12 text-center space-y-3 animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center mx-auto animate-spin">
                <Loader2 size={28} />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {testMode === 'image' ? 'Screening silage visual indicators...' : 'Evaluating Silage Fermentation Index (FQI)...'}
              </h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Computing FAO Random Forest fermentation indices, acidity stability, and aerobic spoilage risks.
              </p>
            </div>
          )}

          {/* ================= METHOD A: VISUAL RESULT ================= */}
          {visualResult && (
            <div className="space-y-3.5 animate-fadeIn text-xs">
              <div className="p-4 rounded-3xl bg-slate-900 text-white border border-slate-800 text-center space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Visual Silage Screening</span>
                  <SourceTag source="Rule-Based Visual Screening" className="bg-white/10 text-slate-200 border-white/20" />
                </div>

                <div className="py-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    Visual Quality Verdict:
                  </div>
                  <div className="flex items-center justify-center gap-2 my-1">
                    <span
                      className={`text-2xl font-black px-4 py-1 rounded-full border ${
                        visualResult.predicted_class === 'GOOD'
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                          : visualResult.predicted_class === 'MOULD_RISK'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {visualResult.predicted_class === 'GOOD'
                        ? '🟢 GOOD (WELL PRESERVED)'
                        : visualResult.predicted_class === 'MOULD_RISK'
                        ? '🟡 MOULD / SPOILAGE RISK'
                        : '🔴 POOR FERMENTATION'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold">
                    Confidence: <strong className="text-white">{visualResult.confidence_percentage || (visualResult.confidence * 100).toFixed(1)}%</strong> • Risk: <strong className="text-white">{visualResult.risk_level}</strong>
                  </div>
                </div>
              </div>

              {/* Why & Recommended Action */}
              <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 space-y-2 text-teal-950 dark:text-teal-100">
                <span className="font-extrabold text-[11px] flex items-center gap-1.5 text-teal-900 dark:text-teal-300">
                  <Sparkles size={13} className="text-teal-600" /> Why this result?
                </span>
                <div className="space-y-1 text-[11px]">
                  {visualResult.why?.map((w, i) => (
                    <p key={i}>• {w}</p>
                  ))}
                </div>

                <div className="pt-2 border-t border-teal-200/60 dark:border-teal-800/60 space-y-1">
                  <strong className="text-[11px] font-extrabold text-teal-900 dark:text-teal-300 block">
                    Recommended Action:
                  </strong>
                  <div className="space-y-0.5 text-[10px] text-teal-800 dark:text-teal-300">
                    {visualResult.recommended_action?.map((act, i) => (
                      <p key={i}>• {act}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
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
                  Test Another Sample
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition flex items-center justify-center gap-1"
                >
                  <Save size={13} />
                  <span>Save Result</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= METHOD B: MANUAL / CHEMICAL RESULT ================= */}
          {combinedResult && (
            <div className="space-y-3.5 animate-fadeIn text-xs">
              
              {/* Score Card */}
              <div className="p-4 rounded-3xl bg-slate-900 text-white border border-slate-800 text-center space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{silageType}</span>
                  <SourceTag source="FAO Random Forest Engine" className="bg-white/10 text-slate-200 border-white/20" />
                </div>

                <div className="py-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    Composite Quality Score:
                  </div>
                  <div className="flex items-center justify-center gap-1.5 my-0.5">
                    <span className="text-3xl font-black text-white">
                      {Math.round(combinedResult.quality_score)}
                    </span>
                    <span className="text-slate-400 text-sm font-bold">/ 100</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs font-black">
                    <span className={`px-2.5 py-0.5 rounded-full border ${
                      combinedResult.status === 'GOOD'
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                        : combinedResult.status === 'CAUTION'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {combinedResult.status === 'GOOD'
                        ? '🟢 OPTIMAL FERMENTATION'
                        : combinedResult.status === 'CAUTION'
                        ? '🟡 MODERATE / CAUTION'
                        : '🔴 POOR FERMENTATION'}
                    </span>
                  </div>
                </div>

                {combinedResult.fermentation_ml?.quality_classification && (
                  <div className="p-2 rounded-xl bg-slate-800/80 text-[10px] text-slate-300 border border-slate-700">
                    <span>Classification: </span>
                    <strong className="text-teal-400">
                      {combinedResult.fermentation_ml.quality_classification.class_label}
                    </strong>
                  </div>
                )}
              </div>

              {/* Fermentation Metrics Table */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300">
                    Fermentation Metrics & Quality Index:
                  </span>
                  <span className="text-[10px] text-teal-600 font-bold">FQI: {combinedResult.fermentation_metrics.fqi_score}</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400">Silage pH:</span>
                    <strong className={combinedResult.fermentation_metrics.pH <= 4.2 ? 'text-teal-600 font-bold' : 'text-amber-600 font-bold'}>
                      {combinedResult.fermentation_metrics.pH}
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400">Dry Matter:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{combinedResult.fermentation_metrics.dry_matter_percent}%</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400">Lactic Acid:</span>
                    <strong className="text-teal-600 font-bold">{combinedResult.fermentation_metrics.lactic_acid_percent_dm}% DM</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400">Butyric Acid:</span>
                    <strong className={combinedResult.fermentation_metrics.butyric_acid_percent_dm <= 0.1 ? 'text-teal-600 font-bold' : 'text-rose-600 font-bold'}>
                      {combinedResult.fermentation_metrics.butyric_acid_percent_dm}% DM</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400">Ammonia-N:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{combinedResult.fermentation_metrics.ammonia_n_percent_total_n}%</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400">Crude Protein:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{combinedResult.fermentation_metrics.crude_protein_percent_dm}%</strong>
                  </div>
                </div>
              </div>

              {/* Why & Actions */}
              <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 space-y-2 text-teal-950 dark:text-teal-100">
                <span className="font-extrabold text-[11px] flex items-center gap-1.5 text-teal-900 dark:text-teal-300">
                  <Sparkles size={13} className="text-teal-600" /> Fermentation Quality Evaluation:
                </span>
                <div className="space-y-1 text-[11px]">
                  {combinedResult.why?.map((w, i) => (
                    <p key={i}>• {w}</p>
                  ))}
                </div>

                <div className="pt-2 border-t border-teal-200/60 dark:border-teal-800/60 space-y-1">
                  <strong className="text-[11px] font-extrabold text-teal-900 dark:text-teal-300 block">
                    Recommended Action:
                  </strong>
                  <div className="space-y-0.5 text-[10px] text-teal-800 dark:text-teal-300">
                    {combinedResult.recommended_action?.map((act, i) => (
                      <p key={i}>• {act}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[10px] flex items-start gap-1.5">
                <ShieldCheck size={13} className="shrink-0 mt-0.5 text-slate-400" />
                <span>{combinedResult.disclaimer}</span>
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
                    className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-teal-600/20 active:scale-95 transition"
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
      {persistedSilageResult && (
        <TestReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          testType="Silage"
          result={persistedSilageResult}
        />
      )}
    </>
  );
};
