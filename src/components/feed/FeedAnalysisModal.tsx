import React, { useState } from 'react';
import { feedApi } from '../../services/api/feedApi';
import { FeedAnalysisResult, QRBatch } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { SourceTag } from '../common/SourceTag';
import { ReadAloudButton } from '../common/ReadAloudButton';
import { TestReportModal } from './TestReportModal';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  ArrowRight,
  ArrowLeft,
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
  Trash2,
  RefreshCw,
  Keyboard,
  Scale,
} from 'lucide-react';

interface FeedAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisSaved: (result: FeedAnalysisResult) => void;
  onGenerateQRBatch?: (batch: QRBatch) => void;
  initialFeedType?: string;
  initialInputMethod?: 'Camera Only' | 'Portable Scanner Simulation' | 'Manual Entry';
}

const COMMON_FEED_SUGGESTIONS = [
  'Super Napier CO-5',
  'Green Fodder (Maize)',
  'Lucerne / Alfalfa',
  'Sorghum Green Fodder',
  'Paddy Straw (Dry)',
  'Wheat Straw',
  'Dried Hay',
  'Concentrate Cattle Pellets',
  'Cottonseed Cake',
  'Wheat Bran (Choker)',
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
  const { t, language } = useLanguage();

  const [inputMode, setInputMode] = useState<'photo' | 'manual'>(
    initialInputMethod === 'Camera Only' ? 'photo' : 'manual'
  );
  const [step, setStep] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [feedName, setFeedName] = useState<string>(
    initialFeedType && !['Green Fodder', 'Dry Feed', 'Silage', 'Mixed Feed'].includes(initialFeedType)
      ? initialFeedType
      : ''
  );
  const [sampleAmount, setSampleAmount] = useState<string>('');
  const [sampleUnit, setSampleUnit] = useState<string>('kg');

  // Supported Manual / Optical Parameters
  const [moisture, setMoisture] = useState<number>(12.5);
  const [crudeProtein, setCrudeProtein] = useState<number>(14.2);
  const [fiber, setFiber] = useState<number>(24.0);
  const [energy, setEnergy] = useState<number>(65.0);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [result, setResult] = useState<FeedAnalysisResult | null>(null);
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

    if (!feedName.trim()) {
      setValidationError('Please enter or select the feed type name.');
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
      const output = await feedApi.analyzeFeed({
        feedCategory: 'Feed',
        feedName: feedName.trim(),
        imageUrl: inputMode === 'photo' ? imageUrl : '',
        sampleAmount: Number(sampleAmount),
        sampleAmountUnit: sampleUnit,
        inputSource: inputMode === 'photo' ? 'Camera Only' : 'Manual Entry',
        manualParameters: {
          moisture,
          crudeProtein,
          fiber,
          energy,
        },
      });

      setResult(output);
      setIsAnalyzing(false);
    } catch (err: any) {
      setIsAnalyzing(false);
      setErrorMessage(err.message || 'Feed analysis encountered an issue. Please try again.');
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
      itemType: 'Feed',
      title: result.feedName,
      farmName: user?.farmName || 'My Dairy Farm',
      farmerName: user?.name || 'Farmer',
      generatedDate: result.date,
      qualityGrade: result.qualityGrade,
      adulterationFlags: `Urea: ${result.ureaRisk} • Mould: ${result.fungalMouldRisk}`,
      verificationStatus: result.isGood === 'Good' ? 'Certified Safe' : 'Requires Lab Review',
      dataSource: inputMode === 'photo' ? 'AI Screening' : 'Measured',
      parameters: {
        'Feed Type': result.feedName,
        'Sample Amount': result.sampleAmount ? `${result.sampleAmount} ${result.sampleAmountUnit || 'kg'}` : 'Not Specified',
        'Crude Protein': `${result.crudeProteinPercent}%`,
        'Dry Matter': `${result.dryMatterPercent}%`,
        'Moisture': `${result.moisturePercent}%`,
        'TDN Energy': `${result.tdnEnergyPercent}%`,
        'Fiber': `${result.crudeFiberPercent}%`,
      },
      qrPayload: `https://dairynova.ai/verify/feed/${result.batchId}`,
    };

    if (onGenerateQRBatch) onGenerateQRBatch(batch);
    setShowQRSuccess(true);
  };

  const score = result ? Math.round(result.overallScore) : 0;
  const isGoodVerdict = result?.isGood || (score >= 75 ? 'Good' : score >= 55 ? 'Moderate' : 'Poor');

  const statusLabel =
    isGoodVerdict === 'Good'
      ? '🟢 GOOD'
      : isGoodVerdict === 'Moderate'
      ? '🟡 CAUTION'
      : '🔴 HIGH RISK';

  const verdictLabel =
    isGoodVerdict === 'Good'
      ? t.goodToUse || '🟢 GOOD TO USE'
      : isGoodVerdict === 'Moderate'
      ? t.useWithCaution || '🟡 USE WITH CAUTION'
      : t.doNotFeedDirectly || '🔴 DO NOT FEED DIRECTLY';

  const verdictBadgeColor =
    isGoodVerdict === 'Good'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
      : isGoodVerdict === 'Moderate'
      ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
      : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300';

  // Build audio text for voice explanation
  const voiceText = result
    ? `${feedName}. ${t.qualityScore || 'Quality score'}: ${score} out of 100. ${statusLabel}. ${verdictLabel}. ${t.whyThisResult || 'Why this result'}: ${result.simpleVerdict || result.aiAdvisory}. ${t.recommendedAction || 'Recommended Action'}: ${result.recommendations?.join('. ')}`
    : '';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Wheat size={12} /> {t.rapidFeedTest || 'Rapid Feed Quality Test'}
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {step === 4 && result ? (t.feedQualityResult || '🔬 Feed Quality Result') : 'Feed Nutrition & Safety'}
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
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
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
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
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
                    Sample Photo (Camera or Device Upload)
                  </label>

                  {imageUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group">
                      <img
                        src={imageUrl}
                        alt="Feed sample preview"
                        className="h-36 w-full object-cover rounded-2xl"
                      />
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/80 text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={12} /> Photo Attached
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer flex items-center gap-0.5">
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
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                        <Camera size={20} />
                      </div>
                      <div>
                        <strong className="block text-slate-900 dark:text-white text-xs">
                          Capture or Select Feed Photo
                        </strong>
                        <p className="text-[10px] text-slate-400">
                          Supports phone camera, gallery, or image files
                        </p>
                      </div>
                      <label className="inline-flex py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 transition">
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

              {/* FLOW 1 & 2: MANUALLY TYPEABLE FEED TYPE */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Feed Type * <span className="font-normal text-[10px] text-slate-400">(Manually enter or select below)</span>
                </label>
                <input
                  type="text"
                  value={feedName}
                  onChange={(e) => {
                    setFeedName(e.target.value);
                    setValidationError('');
                  }}
                  placeholder="Enter Feed Type (e.g. Super Napier, Sorghum Fodder, Paddy Straw)..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                />

                {/* Quick Suggestion Chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {COMMON_FEED_SUGGESTIONS.slice(0, 5).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setFeedName(item);
                        setValidationError('');
                      }}
                      className={`px-2 py-0.5 rounded-lg border text-[10px] font-semibold transition ${
                        feedName === item
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400'
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
                    <Scale size={13} className="text-emerald-600" /> Amount / Weight *
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
                      placeholder="Enter amount (e.g. 25)"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <select
                      value={sampleUnit}
                      onChange={(e) => setSampleUnit(e.target.value)}
                      className="w-full px-2.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="kg">kg</option>
                      <option value="quintal">quintal</option>
                      <option value="tons">tons</option>
                      <option value="bundle">bundle</option>
                      <option value="g">g</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* MANUAL PARAMETERS SECTION (OPTIONAL TUNING) */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Proximate Nutrients <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">ICAR / NRC Calibrated</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                      <span>Moisture %</span>
                      <strong className="text-emerald-600 font-bold">{moisture}%</strong>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="85"
                      step="0.5"
                      value={moisture}
                      onChange={(e) => setMoisture(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                      <span>Crude Protein %</span>
                      <strong className="text-emerald-600 font-bold">{crudeProtein}%</strong>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="30"
                      step="0.2"
                      value={crudeProtein}
                      onChange={(e) => setCrudeProtein(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                      <span>Crude Fiber %</span>
                      <strong className="text-slate-700 dark:text-slate-300 font-bold">{fiber}%</strong>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="45"
                      step="0.5"
                      value={fiber}
                      onChange={(e) => setFiber(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                      <span>TDN Energy %</span>
                      <strong className="text-slate-700 dark:text-slate-300 font-bold">{energy}%</strong>
                    </div>
                    <input
                      type="range"
                      min="45"
                      max="85"
                      step="0.5"
                      value={energy}
                      onChange={(e) => setEnergy(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <Sparkles size={16} />
                  <span>Run Rapid Quality Test</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LOADING / RESULTS SCREEN */}
          {step === 2 && (
            <div className="space-y-3.5 animate-fadeIn text-xs">
              {isAnalyzing ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto animate-spin">
                    <Loader2 size={28} />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {t.analyzingAI || 'Analyzing Feed Nutrition & Risk...'}
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Connecting to Dairy Nova FastAPI engine to compute proximate NIR and safety metrics.
                  </p>
                </div>
              ) : result ? (
                <div className="space-y-3.5">
                  
                  {/* PROMINENT QUALITY SCORE CARD */}
                  <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 text-center space-y-2 shadow-lg">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{result.batchId}</span>
                      <SourceTag source={result.inputSource === 'Camera Only' ? 'AI Screening' : 'Manual Entry'} className="bg-white/10 text-slate-200 border-white/20" />
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-1">
                        🌾 {result.feedName}
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
                            ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                            : isGoodVerdict === 'Moderate'
                            ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                        }`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>

                    {/* Prominent Farmer Verdict: Can I Feed This? */}
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
                      <span className="text-[10px] text-slate-400">Risk Indicator</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block">{t.mouldRisk || 'Mould Risk'}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {result.fungalMouldRisk || 'Clean'}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block">{t.spoilageRisk || 'Spoilage Risk'}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {result.mycotoxinRisk || 'Undetected'}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block">{t.qualityRisk || 'Quality Risk'}</span>
                        <span className={`font-bold ${isGoodVerdict === 'Good' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {isGoodVerdict === 'Good' ? 'Low Risk' : 'Medium'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 🤖 WHY THIS RESULT? & 💡 RECOMMENDED ACTION */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2 text-emerald-950 dark:text-emerald-100">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[11px] flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300">
                        <Sparkles size={13} className="text-emerald-600" />
                        {t.whyThisResult || '🤖 Why this result?'}
                      </span>
                      <ReadAloudButton textToRead={voiceText} size="sm" />
                    </div>
                    <p className="text-[11px] leading-relaxed text-emerald-900 dark:text-emerald-200">
                      {result.simpleVerdict || result.aiAdvisory}
                    </p>

                    <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 space-y-1">
                      <strong className="text-[11px] font-extrabold text-emerald-900 dark:text-emerald-300 block">
                        {t.recommendedAction || '💡 Recommended Action:'}
                      </strong>
                      <div className="space-y-0.5 text-[10px] text-emerald-800 dark:text-emerald-300">
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
                      <span>Technical Nutrients (Proximate NIR)</span>
                      {showDetailedParameters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {showDetailedParameters && (
                      <div className="divide-y divide-slate-100 dark:divide-slate-700/60 pt-1 text-[10px] animate-fadeIn">
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Crude Protein</span>
                          <strong className="text-emerald-600 font-bold">{result.crudeProteinPercent}%</strong>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Dry Matter</span>
                          <strong className="text-slate-800 dark:text-slate-200">{result.dryMatterPercent}%</strong>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Moisture</span>
                          <strong className="text-slate-800 dark:text-slate-200">{result.moisturePercent}%</strong>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Crude Fiber</span>
                          <strong className="text-slate-800 dark:text-slate-200">{result.crudeFiberPercent}%</strong>
                        </div>
                        {result.ndfPercent && (
                          <div className="flex justify-between py-1">
                            <span className="text-slate-400">NDF Fiber</span>
                            <strong className="text-slate-800 dark:text-slate-200">{result.ndfPercent}%</strong>
                          </div>
                        )}
                        {result.starchPercent && (
                          <div className="flex justify-between py-1">
                            <span className="text-slate-400">Starch</span>
                            <strong className="text-slate-800 dark:text-slate-200">{result.starchPercent}%</strong>
                          </div>
                        )}
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
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-600/20 active:scale-95 transition"
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
                      ← Test Another Feed Sample
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
          testType="Feed"
          result={result}
        />
      )}
    </>
  );
};
