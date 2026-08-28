import React, { useState } from 'react';
import { feedApi } from '../../services/api/feedApi';
import { FeedAnalysisResult, QRBatch } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { SourceTag } from '../common/SourceTag';
import { ReadAloudButton } from '../common/ReadAloudButton';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  QrCode,
  Save,
  Wheat,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface FeedAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisSaved: (result: FeedAnalysisResult) => void;
  onGenerateQRBatch?: (batch: QRBatch) => void;
}

export const FeedAnalysisModal: React.FC<FeedAnalysisModalProps> = ({
  isOpen,
  onClose,
  onAnalysisSaved,
  onGenerateQRBatch,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [feedCategory, setFeedCategory] = useState<string>('Green Fodder');
  const [feedName, setFeedName] = useState<string>('Super Napier CO-5 Hybrid');
  const [inputSource, setInputSource] = useState<'Camera Only' | 'Portable Scanner Simulation' | 'Manual Entry'>('Camera Only');
  
  // Manual / Sensor params
  const [moisture, setMoisture] = useState<number>(75.0);
  const [crudeProtein, setCrudeProtein] = useState<number>(12.5);
  const [fiber, setFiber] = useState<number>(25.0);
  const [energy, setEnergy] = useState<number>(64.0);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [result, setResult] = useState<FeedAnalysisResult | null>(null);
  const [showDetailedParameters, setShowDetailedParameters] = useState<boolean>(false);
  const [showQRSuccess, setShowQRSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartAnalysis = async () => {
    setStep(4);
    setIsAnalyzing(true);
    setErrorMessage('');

    try {
      const output = await feedApi.analyzeFeed({
        feedCategory,
        feedName,
        imageUrl,
        inputSource,
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
      setErrorMessage(err.message || 'Feed analysis encountered an error. Please try again.');
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
      dataSource: 'AI Screening',
      parameters: {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Wheat size={12} /> Rapid Feed Quality Testing
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {t.rapidFeedTest || 'Rapid Feed Quality Test'}
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
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Category & Feed Name */}
        {step === 1 && (
          <div className="space-y-3 animate-fadeIn text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Feed Category
              </label>
              <select
                value={feedCategory}
                onChange={(e) => {
                  setFeedCategory(e.target.value);
                  if (e.target.value === 'Green Fodder') setFeedName('Super Napier (CO-5)');
                  else if (e.target.value === 'Dry Roughage') setFeedName('Paddy Straw');
                  else if (e.target.value === 'Concentrate Pellet') setFeedName('Dairy Cattle Feed (20% CP)');
                  else setFeedName('Total Mixed Ration (TMR)');
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="Green Fodder">Green Fodder (Napier, Maize, Sorghum, Lucerne)</option>
                <option value="Dry Roughage">Dry Roughage (Paddy Straw, Wheat Straw, Hay)</option>
                <option value="Concentrate Pellet">Concentrate Pellets & Oil Cakes</option>
                <option value="Total Mixed Ration">Mixed Dairy TMR Ration</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Fodder / Feed Sample Name
              </label>
              <input
                type="text"
                value={feedName}
                onChange={(e) => setFeedName(e.target.value)}
                placeholder="e.g. Super Napier CO-5"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3 min-h-[42px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition mt-2"
            >
              <span>{t.continueBtn || 'Next'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Step 2: Photo or Parameter Input */}
        {step === 2 && (
          <div className="space-y-3 animate-fadeIn text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">
              Sample Photo & Verification
            </span>

            {/* Photo capture/upload */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
              {imageUrl ? (
                <div className="space-y-2">
                  <img src={imageUrl} alt="Feed sample" className="h-32 w-full object-cover rounded-xl border border-slate-200" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-[11px] text-rose-500 font-bold hover:underline"
                  >
                    {t.removePhoto || 'Remove Photo'}
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block py-4 space-y-1">
                  <Camera size={26} className="mx-auto text-slate-400" />
                  <span className="font-bold text-slate-700 dark:text-slate-200 block text-xs">
                    {t.takePhoto || 'Take Photo'} / {t.uploadPhoto || 'Upload Sample Image'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    AI inspects leaf-to-stem ratio, moisture, and color
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Est. Moisture %
                </label>
                <input
                  type="number"
                  value={moisture}
                  onChange={(e) => setMoisture(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Crude Fibre %
                </label>
                <input
                  type="number"
                  value={fiber}
                  onChange={(e) => setFiber(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-3 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 font-bold flex items-center justify-center gap-1 active:scale-95 transition"
              >
                <ArrowLeft size={14} /> {t.backBtn || 'Back'}
              </button>
              <button
                type="button"
                onClick={handleStartAnalysis}
                className="py-2.5 px-3 min-h-[40px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1 active:scale-95 transition"
              >
                <span>Run Rapid Test</span>
                <Sparkles size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Analyzing State */}
        {step === 4 && isAnalyzing && (
          <div className="py-8 text-center space-y-3 animate-fadeIn text-xs">
            <Loader2 size={32} className="animate-spin text-emerald-600 mx-auto" />
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                Analyzing Feed Nutrition & Quality...
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1">
                Calculating Dry Matter, Crude Protein, NDF, and Spoilage Risk
              </p>
            </div>
          </div>
        )}

        {/* Result Screen: Primary Question & Verdict */}
        {result && !isAnalyzing && (
          <div className="space-y-3.5 animate-fadeIn text-xs">
            
            {/* Primary Question & Verdict Banner */}
            <div className={`p-4 rounded-3xl text-white space-y-2.5 shadow-lg ${
              result.isGood === 'Good'
                ? 'bg-gradient-to-br from-emerald-600 to-teal-800'
                : result.isGood === 'Moderate'
                ? 'bg-gradient-to-br from-amber-600 to-yellow-800'
                : 'bg-gradient-to-br from-rose-600 to-red-800'
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 opacity-90">
                {t.isFeedGoodForCattle || 'Is this feed good for my cattle?'}
              </div>

              <div className="flex items-center gap-2">
                {result.isGood === 'Good' ? (
                  <CheckCircle2 size={24} className="text-emerald-200 shrink-0" />
                ) : result.isGood === 'Moderate' ? (
                  <AlertTriangle size={24} className="text-amber-200 shrink-0" />
                ) : (
                  <AlertOctagon size={24} className="text-rose-200 shrink-0" />
                )}
                <div>
                  <h4 className="text-base font-black leading-tight">
                    {result.isGood === 'Good'
                      ? (t.feedQualityGood || 'Good Quality Feed')
                      : result.isGood === 'Moderate'
                      ? (t.feedQualityModerate || 'Moderate Quality Feed')
                      : (t.feedQualityPoor || 'Low Quality / Risk Detected')}
                  </h4>
                  <span className="text-[11px] opacity-90">{result.feedName} • Score: {result.overallScore}/100</span>
                </div>
              </div>

              <p className="text-xs bg-white/10 p-2.5 rounded-2xl backdrop-blur-sm leading-relaxed text-white">
                {result.simpleVerdict || result.aiAdvisory}
              </p>
            </div>

            {/* Practical Feeding Recommendations */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 text-xs">
                  <Sparkles size={13} className="text-emerald-600" /> Actionable Feeding Advice
                </span>
                <ReadAloudButton textToRead={`${result.simpleVerdict}. ${result.recommendations.join('. ')}`} size="sm" />
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Expandable Detailed Analysis */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowDetailedParameters(!showDetailedParameters)}
                className="w-full p-3 bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <span>{t.viewDetailedAnalysis || 'View Detailed Analysis'} (NIR / Proximate)</span>
                {showDetailedParameters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showDetailedParameters && (
                <div className="p-3 bg-white dark:bg-slate-900 space-y-2 text-xs border-t border-slate-200 dark:border-slate-800 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">{t.dryMatter || 'Dry Matter (DM)'}</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">{result.dryMatterPercent}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">{t.crudeProtein || 'Crude Protein (CP)'}</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{result.crudeProteinPercent}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">{t.crudeFibre || 'Crude Fibre (CF)'}</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">{result.crudeFiberPercent}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">{t.ndf || 'NDF Fiber'}</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">{result.ndfPercent || '48.5'}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">{t.starch || 'Starch'}</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">{result.starchPercent || '2.4'}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">TDN Energy</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">{result.tdnEnergyPercent}%</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mycotoxin Risk:</span>
                      <span className="font-bold text-emerald-600">{result.mycotoxinRisk}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Silica / Sand Risk:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{result.silicaSandRisk}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Urea Contamination:</span>
                      <span className="font-bold text-emerald-600">{result.ureaRisk}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* QR Success Message */}
            {showQRSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-semibold text-center">
                Certified QR batch generated! Check QR Registry.
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCreateQR}
                className="py-2.5 px-3 min-h-[40px] rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <QrCode size={14} /> Generate QR
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="py-2.5 px-3 min-h-[40px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <Save size={14} /> Save Feed Test
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
