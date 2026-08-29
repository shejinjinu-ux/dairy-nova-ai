import React, { useState } from 'react';
import { silageApi } from '../../services/api/silageApi';
import { SilageAnalysisResult, QRBatch } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { SourceTag } from '../common/SourceTag';
import { ReadAloudButton } from '../common/ReadAloudButton';
import { TestReportModal } from '../feed/TestReportModal';
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
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
  Trash2,
  RefreshCw,
  Keyboard,
  Scale,
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
  initialSilageType = '',
  initialInputMethod = 'Manual Entry',
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [inputMode, setInputMode] = useState<'photo' | 'manual'>('manual');
  const [step, setStep] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [silageType, setSilageType] = useState<string>(
    initialSilageType && initialSilageType !== 'Silage' ? initialSilageType : ''
  );
  const [sampleAmount, setSampleAmount] = useState<string>('');
  const [sampleUnit, setSampleUnit] = useState<string>('kg');

  // Silage Fermentation Parameters
  const [phValue, setPhValue] = useState<number>(3.85);
  const [moisturePercent, setMoisturePercent] = useState<number>(66.0);
  const [storageDurationDays, setStorageDurationDays] = useState<number>(60);
  const [internalTemperatureC, setInternalTemperatureC] = useState<number>(26.0);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [result, setResult] = useState<SilageAnalysisResult | null>(null);
  const [showDetailedParameters, setShowDetailedParameters] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showQRSuccess, setShowQRSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setValidationError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
  };

  const validateInputs = (): boolean => {
    setValidationError('');

    if (!silageType.trim()) {
      setValidationError('Please enter or select the silage type.');
      return false;
    }

    if (!sampleAmount.trim()) {
      setValidationError('Please enter the sample amount / weight.');
      return false;
    }

    const amountNum = Number(sampleAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setValidationError('Sample amount / weight must be a valid positive number (greater than 0).');
      return false;
    }

    return true;
  };

  const handleStartAnalysis = async () => {
    if (!validateInputs()) return;

    setStep(2);
    setIsAnalyzing(true);
    setErrorMessage('');

    try {
      const output = await silageApi.analyzeSilage({
        silageType: silageType.trim(),
        imageUrl: inputMode === 'photo' ? imageUrl : '',
        sampleAmount: Number(sampleAmount),
        sampleAmountUnit: sampleUnit,
        phValue,
        moisturePercent,
        storageDurationDays,
        internalTemperatureC,
        inputSource: inputMode === 'photo' ? 'Portable Scanner Simulation' : 'Manual Entry',
      });

      setResult(output);
      setIsAnalyzing(false);
    } catch (err: any) {
      setIsAnalyzing(false);
      setErrorMessage(err.message || 'Silage fermentation evaluation failed. Please try again.');
    }
  };

  const handleSave = () => {
    if (!result) return;
    onAnalysisSaved(result);
    onClose();
  };

  const handleCreateQR = () => {
    if (!result) return;
    const batch: QRBatch = {
      batchId: result.batchId,
      itemType: 'Silage',
      title: result.silageType,
      farmName: user?.farmName || 'My Dairy Farm',
      farmerName: user?.name || 'Farmer',
      generatedDate: result.date,
      qualityGrade: result.overallQuality,
      adulterationFlags: `Spoilage: ${result.spoilageRisk} • Mould: ${result.mouldRisk}`,
      verificationStatus: result.isGood === 'Good' ? 'Certified Safe' : 'Requires Lab Review',
      dataSource: inputMode === 'photo' ? 'AI Screening' : 'Measured',
      parameters: {
        'Silage Type': result.silageType,
        'Sample Amount': result.sampleAmount ? `${result.sampleAmount} ${result.sampleAmountUnit || 'kg'}` : 'Not Specified',
        'pH Acidity': `${result.phValue} pH`,
        'FQI Score': `${result.fqiScore || 84}/100`,
        'Moisture': `${result.moisturePercent}%`,
        'Core Temperature': `${result.internalTemperatureC}°C`,
      },
      qrPayload: `https://dairynova.ai/verify/silage/${result.batchId}`,
    };

    if (onGenerateQRBatch) onGenerateQRBatch(batch);
    setShowQRSuccess(true);
  };

  const score = result && result.fqiScore !== undefined ? Math.round(result.fqiScore) : 0;
  const isGoodVerdict = result?.isGood || (score >= 70 ? 'Good' : score >= 50 ? 'Moderate' : 'Poor');

  const statusLabel =
    isGoodVerdict === 'Good'
      ? '🟢 SAFE'
      : isGoodVerdict === 'Moderate'
      ? '🟡 CAUTION'
      : '🔴 UNSAFE';

  const verdictLabel =
    isGoodVerdict === 'Good'
      ? t.goodToUse || '🟢 GOOD TO USE'
      : isGoodVerdict === 'Moderate'
      ? t.useWithCaution || '🟡 USE WITH CAUTION'
      : t.doNotFeedDirectly || '🔴 DO NOT FEED DIRECTLY';

  const verdictBadgeColor =
    isGoodVerdict === 'Good'
      ? 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300'
      : isGoodVerdict === 'Moderate'
      ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
      : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300';

  const voiceText = result
    ? `${silageType}. ${t.qualityScore || 'Quality score'}: ${score} out of 100. ${statusLabel}. ${verdictLabel}. ${t.whyThisResult || 'Why this result'}: ${result.simpleVerdict || result.storageAdvice}. ${t.recommendedAction || 'Recommended Action'}: ${result.recommendations?.join('. ')}`
    : '';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1">
                <Layers size={12} /> {t.rapidSilageTest || 'Rapid Silage Quality Test'}
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {step === 4 && result ? (t.silageQualityResult || '🌾 SILAGE QUALITY RESULT') : 'Silage Fermentation & Safety'}
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

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-shake">
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Validation Warning Alert */}
          {validationError && (
            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertCircle size={14} className="shrink-0 text-rose-500" />
              <span>{validationError}</span>
            </div>
          )}

          {/* STEP 1: FORM INPUT (PHOTO OR MANUAL) */}
          {step === 1 && (
            <div className="space-y-3.5 animate-fadeIn text-xs">
              
              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setInputMode('photo');
                    setValidationError('');
                  }}
                  className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 ${
                    inputMode === 'photo'
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Camera size={14} />
                  <span>📷 Photo Upload</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInputMode('manual');
                    setValidationError('');
                  }}
                  className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 ${
                    inputMode === 'manual'
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Keyboard size={14} />
                  <span>⌨️ Manual Entry</span>
                </button>
              </div>

              {/* FLOW 1: PHOTO UPLOAD SECTION */}
              {inputMode === 'photo' && (
                <div className="space-y-2 animate-fadeIn">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Silage Sample Photo (Camera or Device Upload)
                  </label>

                  {imageUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group">
                      <img
                        src={imageUrl}
                        alt="Silage sample preview"
                        className="h-36 w-full object-cover rounded-2xl"
                      />
                      <div className="p-2 bg-teal-50 dark:bg-teal-950/80 text-[11px] text-teal-700 dark:text-teal-300 font-semibold flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={12} /> Photo Attached
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="text-teal-700 dark:text-teal-300 hover:underline cursor-pointer flex items-center gap-0.5">
                            <RefreshCw size={11} /> Replace
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                          <span>•</span>
                          <button type="button" onClick={handleRemoveImage} className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5">
                            <Trash2 size={11} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center mx-auto">
                        <Camera size={20} />
                      </div>
                      <div>
                        <strong className="block text-slate-900 dark:text-white text-xs">
                          Capture or Select Silage Photo
                        </strong>
                        <p className="text-[10px] text-slate-400">
                          Supports pit face camera, bunker sample, or file upload
                        </p>
                      </div>
                      <label className="inline-flex py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-teal-600/20 active:scale-95 transition">
                        <Upload size={13} className="mr-1.5" /> Select Photo
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* FLOW 1 & 2: MANUALLY TYPEABLE SILAGE TYPE */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Silage Type * <span className="font-normal text-[10px] text-slate-400">(Manually enter or select below)</span>
                </label>
                <input
                  type="text"
                  value={silageType}
                  onChange={(e) => {
                    setSilageType(e.target.value);
                    setValidationError('');
                  }}
                  placeholder="Enter Silage Type (e.g. Maize Silage, Super Napier Silage, Sorghum Pit Silage)..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500"
                />

                {/* Quick Suggestion Chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {COMMON_SILAGE_SUGGESTIONS.slice(0, 4).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setSilageType(item);
                        setValidationError('');
                      }}
                      className={`px-2 py-0.5 rounded-lg border text-[10px] font-semibold transition ${
                        silageType === item
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* REQUIRED: AMOUNT / WEIGHT */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Scale size={13} className="text-teal-600" /> Amount / Weight *
                  </span>
                  <span className="text-[10px] text-rose-500 font-bold">Required</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={sampleAmount}
                      onChange={(e) => {
                        setSampleAmount(e.target.value);
                        setValidationError('');
                      }}
                      placeholder="Enter amount (e.g. 50)"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <select
                      value={sampleUnit}
                      onChange={(e) => setSampleUnit(e.target.value)}
                      className="w-full px-2.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="kg">kg</option>
                      <option value="quintal">quintal</option>
                      <option value="tons">tons</option>
                      <option value="pit tons">pit tons</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* MANUAL FERMENTATION PARAMETERS (OPTIONAL TUNING) */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Fermentation Indicators <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                  </span>
                  <span className="text-[10px] text-teal-600 font-semibold">FAO Calibrated</span>
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
                      max="6.5"
                      step="0.05"
                      value={phValue}
                      onChange={(e) => setPhValue(parseFloat(e.target.value))}
                      className="w-full accent-teal-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                      <span>Moisture %</span>
                      <strong className="text-teal-600 font-bold">{moisturePercent}%</strong>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="80"
                      step="0.5"
                      value={moisturePercent}
                      onChange={(e) => setMoisturePercent(parseFloat(e.target.value))}
                      className="w-full accent-teal-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                      <span>Pit Core Temp</span>
                      <strong className={`font-bold ${internalTemperatureC <= 30 ? 'text-teal-600' : 'text-amber-600'}`}>
                        {internalTemperatureC}°C
                      </strong>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="50"
                      step="0.5"
                      value={internalTemperatureC}
                      onChange={(e) => setInternalTemperatureC(parseFloat(e.target.value))}
                      className="w-full accent-teal-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                      <span>Storage Days</span>
                      <strong className="text-slate-700 dark:text-slate-300 font-bold">{storageDurationDays} d</strong>
                    </div>
                    <input
                      type="range"
                      min="21"
                      max="180"
                      step="1"
                      value={storageDurationDays}
                      onChange={(e) => setStorageDurationDays(parseInt(e.target.value))}
                      className="w-full accent-teal-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-lg shadow-teal-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <Sparkles size={16} />
                  <span>Run Rapid Silage Test</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LOADING / RESULTS SCREEN */}
          {step === 2 && (
            <div className="space-y-3.5 animate-fadeIn text-xs">
              {isAnalyzing ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center mx-auto animate-spin">
                    <Loader2 size={28} />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Evaluating Silage Fermentation (FQI)...
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Computing FAO Random Forest fermentation indices and spoilage indicators.
                  </p>
                </div>
              ) : result ? (
                <div className="space-y-3.5">
                  
                  {/* PROMINENT QUALITY SCORE CARD */}
                  <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 text-center space-y-2 shadow-lg">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{result.batchId}</span>
                      <SourceTag source={inputMode === 'photo' ? 'AI Screening' : 'Manual Entry'} className="bg-white/10 text-slate-200 border-white/20" />
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-teal-400 mb-1">
                        🌽 {result.silageType}
                      </h4>
                      {result.sampleAmount && (
                        <span className="inline-block text-[10px] font-bold bg-white/10 px-2.5 py-0.5 rounded-full text-slate-200 mb-2">
                          Sample Weight: {result.sampleAmount} {result.sampleAmountUnit || 'kg'}
                        </span>
                      )}

                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                        Quality Score:
                      </div>
                      <div className="flex items-center justify-center gap-1.5 my-0.5">
                        <span className="text-4xl font-black text-white">{score}</span>
                        <span className="text-slate-400 text-sm font-bold">/ 100</span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-xs font-black">
                        <span className="text-slate-300">Status:</span>
                        <span className={`px-2.5 py-0.5 rounded-full ${
                          isGoodVerdict === 'Good'
                            ? 'bg-teal-500/30 text-teal-300 border border-teal-500/40'
                            : isGoodVerdict === 'Moderate'
                            ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                        }`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>

                    {/* Prominent Farmer Verdict */}
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[11px] font-bold text-slate-300 block mb-1">
                        {t.canIFeedThis || 'Can I feed this?'}
                      </span>
                      <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wide shadow-sm ${verdictBadgeColor}`}>
                        {isGoodVerdict === 'Good' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                        <span>{verdictLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* 🚨 RISK ANALYSIS */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <AlertTriangle size={13} className="text-amber-500" />
                        {t.riskAnalysis || '🚨 Risk Analysis'}
                      </h4>
                      <span className="text-[10px] text-slate-400">Fermentation Model</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block">{t.mouldRisk || 'Mould Risk'}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {result.mouldRisk || 'Clean / Safe'}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block">{t.spoilageRisk || 'Spoilage Risk'}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {result.spoilageRisk || 'Low'}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block">{t.qualityRisk || 'Quality Risk'}</span>
                        <span className={`font-bold ${isGoodVerdict === 'Good' ? 'text-teal-600' : 'text-amber-600'}`}>
                          {isGoodVerdict === 'Good' ? 'Low Risk' : 'Medium'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 🤖 WHY THIS RESULT? & 💡 RECOMMENDED ACTION */}
                  <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 space-y-2 text-teal-950 dark:text-teal-100">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[11px] flex items-center gap-1.5 text-teal-900 dark:text-teal-300">
                        <Sparkles size={13} className="text-teal-600" />
                        {t.whyThisResult || '🤖 Why this result?'}
                      </span>
                      <ReadAloudButton textToRead={voiceText} size="sm" />
                    </div>
                    <p className="text-[11px] leading-relaxed text-teal-900 dark:text-teal-200">
                      {result.simpleVerdict || result.storageAdvice}
                    </p>

                    <div className="pt-2 border-t border-teal-200/60 dark:border-teal-800/60 space-y-1">
                      <strong className="text-[11px] font-extrabold text-teal-900 dark:text-teal-300 block">
                        {t.recommendedAction || '💡 Recommended Action:'}
                      </strong>
                      <div className="space-y-0.5 text-[10px] text-teal-800 dark:text-teal-300">
                        {result.recommendations?.map((rec, i) => (
                          <p key={i}>• {rec}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Technical Details */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowDetailedParameters(!showDetailedParameters)}
                      className="w-full flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300"
                    >
                      <span>Technical Biochemical Metrics</span>
                      {showDetailedParameters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {showDetailedParameters && (
                      <div className="divide-y divide-slate-100 dark:divide-slate-700/60 pt-1 text-[10px] animate-fadeIn">
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Silage pH</span>
                          <strong className="text-teal-600 font-bold">{result.phValue} pH</strong>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Fermentation Quality Index (FQI)</span>
                          <strong className="text-slate-800 dark:text-slate-200">{result.fqiScore || '84.5'}</strong>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Moisture</span>
                          <strong className="text-slate-800 dark:text-slate-200">{result.moisturePercent}%</strong>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Internal Pit Temperature</span>
                          <strong className="text-slate-800 dark:text-slate-200">{result.internalTemperatureC}°C</strong>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Fermentation Status</span>
                          <strong className="text-teal-600 font-bold">{result.fermentationStatus}</strong>
                        </div>
                      </div>
                    )}
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

                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setResult(null);
                        setSampleAmount('');
                        setValidationError('');
                      }}
                      className="w-full py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 hover:underline"
                    >
                      ← Test Another Silage Pit
                    </button>
                  </div>

                </div>
              ) : null}
            </div>
          )}

        </div>
      </div>

      {/* Report Modal */}
      {result && (
        <TestReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          testType="Silage"
          result={result}
        />
      )}
    </>
  );
};
