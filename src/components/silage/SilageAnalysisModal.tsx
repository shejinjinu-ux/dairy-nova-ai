import React, { useState } from 'react';
import { silageApi } from '../../services/api/silageApi';
import { SilageAnalysisResult, QRBatch } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { SourceTag } from '../common/SourceTag';
import { ReadAloudButton } from '../common/ReadAloudButton';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  QrCode,
  Save,
  Thermometer,
  Layers,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface SilageAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisSaved: (result: SilageAnalysisResult) => void;
  onGenerateQRBatch?: (batch: QRBatch) => void;
}

export const SilageAnalysisModal: React.FC<SilageAnalysisModalProps> = ({
  isOpen,
  onClose,
  onAnalysisSaved,
  onGenerateQRBatch,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [silageType, setSilageType] = useState<string>('Whole Corn (Maize) Silage');
  const [phValue, setPhValue] = useState<number>(3.85);
  const [moisturePercent, setMoisturePercent] = useState<number>(66.0);
  const [storageDurationDays, setStorageDurationDays] = useState<number>(60);
  const [internalTemperatureC, setInternalTemperatureC] = useState<number>(26.0);
  const [inputSource, setInputSource] = useState<'Manual Entry' | 'Portable Scanner Simulation' | 'Mock IoT Storage Monitoring'>('Manual Entry');

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [result, setResult] = useState<SilageAnalysisResult | null>(null);
  const [showDetailedParameters, setShowDetailedParameters] = useState<boolean>(false);
  const [showQRSuccess, setShowQRSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStartAnalysis = async () => {
    setErrorMessage('');
    if (phValue < 2.5 || phValue > 9.0) {
      setErrorMessage('Please enter a valid pH value between 2.5 and 9.0.');
      return;
    }

    if (moisturePercent < 20 || moisturePercent > 90) {
      setErrorMessage('Please enter a realistic moisture percentage (20% - 90%).');
      return;
    }

    setIsAnalyzing(true);
    try {
      const output = await silageApi.analyzeSilage({
        silageType,
        phValue,
        moisturePercent,
        storageDurationDays,
        internalTemperatureC,
        inputSource,
      });
      setResult(output);
      setIsAnalyzing(false);
    } catch (err: any) {
      setIsAnalyzing(false);
      setErrorMessage(err.message || 'Silage quality analysis encountered an error. Please try again.');
    }
  };

  const handleSave = () => {
    if (!result) return;
    onAnalysisSaved(result);
    onClose();
  };

  const handleGenerateQR = () => {
    if (!result) return;
    const batch: QRBatch = {
      batchId: result.batchId,
      itemType: 'Silage',
      title: result.silageType,
      farmName: user?.farmName || 'My Dairy Farm',
      farmerName: user?.name || 'Farmer',
      generatedDate: result.date,
      qualityGrade: result.overallQuality,
      adulterationFlags: `Fermentation: ${result.fermentationStatus} • Spoilage: ${result.spoilageRisk}`,
      verificationStatus: result.isGood === 'Good' ? 'Certified Safe' : 'Requires Lab Review',
      dataSource: 'AI Screening',
      parameters: {
        'pH': `${result.phValue}`,
        'Moisture': `${result.moisturePercent}%`,
        'Dry Matter': `${result.dryMatterPercent}%`,
        'Internal Temp': `${result.internalTemperatureC}°C`,
        'FQI Score': `${result.fqiScore || 80}/100`,
      },
      qrPayload: `https://dairynova.ai/verify/silage/${result.batchId}`,
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1">
              <Layers size={12} /> Rapid Silage Quality Testing
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {t.rapidSilageTest || 'Rapid Silage Quality Test'}
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

        {/* Input Form */}
        {!result && !isAnalyzing && (
          <div className="space-y-3 animate-fadeIn text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Silage Crop Type
              </label>
              <select
                value={silageType}
                onChange={(e) => setSilageType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="Whole Corn (Maize) Silage">Whole Corn / Maize Silage</option>
                <option value="Sorghum + Cowpea Silage">Sorghum (Jowar) + Legume Silage</option>
                <option value="Hybrid Napier / Grass Silage">Hybrid Napier Grass Silage</option>
                <option value="Sugarcane Top Silage">Sugarcane Top Silage</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Measured pH Value
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={phValue}
                  onChange={(e) => setPhValue(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Target: 3.8 - 4.2 pH</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Moisture %
                </label>
                <input
                  type="number"
                  value={moisturePercent}
                  onChange={(e) => setMoisturePercent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Target: 65% - 70%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Internal Temp (°C)
                </label>
                <input
                  type="number"
                  value={internalTemperatureC}
                  onChange={(e) => setInternalTemperatureC(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Storage Days
                </label>
                <input
                  type="number"
                  value={storageDurationDays}
                  onChange={(e) => setStorageDurationDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartAnalysis}
              className="w-full py-3 min-h-[42px] rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition mt-2"
            >
              <span>{t.testSilageQuality || 'Analyze Silage Quality'}</span>
              <Sparkles size={14} />
            </button>
          </div>
        )}

        {/* Analyzing Spinner */}
        {isAnalyzing && (
          <div className="py-8 text-center space-y-3 animate-fadeIn text-xs">
            <Loader2 size={32} className="animate-spin text-teal-600 mx-auto" />
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                Running Fermentation & Spoilage ML Models...
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1">
                Evaluating Lactic Fermentation, Acidity Stability, and FQI Score
              </p>
            </div>
          </div>
        )}

        {/* Result Screen: Primary Question & Verdict */}
        {result && !isAnalyzing && (
          <div className="space-y-3.5 animate-fadeIn text-xs">
            
            {/* Primary Verdict Banner */}
            <div className={`p-4 rounded-3xl text-white space-y-2.5 shadow-lg ${
              result.isGood === 'Good'
                ? 'bg-gradient-to-br from-teal-700 to-emerald-900'
                : result.isGood === 'Moderate'
                ? 'bg-gradient-to-br from-amber-600 to-yellow-800'
                : 'bg-gradient-to-br from-rose-700 to-red-950'
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-teal-200 opacity-90">
                {t.isSilageGood || 'Is my silage good?'}
              </div>

              <div className="flex items-center gap-2">
                {result.isGood === 'Good' ? (
                  <CheckCircle2 size={24} className="text-teal-200 shrink-0" />
                ) : result.isGood === 'Moderate' ? (
                  <AlertTriangle size={24} className="text-amber-200 shrink-0" />
                ) : (
                  <AlertOctagon size={24} className="text-rose-200 shrink-0" />
                )}
                <div>
                  <h4 className="text-base font-black leading-tight">
                    {result.isGood === 'Good'
                      ? 'Good Fermentation & Quality'
                      : result.isGood === 'Moderate'
                      ? 'Moderate Fermentation'
                      : 'Spoiled / Butyric Spoilage'}
                  </h4>
                  <span className="text-[11px] opacity-90">{result.silageType} • pH: {result.phValue}</span>
                </div>
              </div>

              <p className="text-xs bg-white/10 p-2.5 rounded-2xl backdrop-blur-sm leading-relaxed text-white">
                {result.simpleVerdict || result.storageAdvice}
              </p>
            </div>

            {/* Practical Storage Recommendations */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 text-xs">
                  <Sparkles size={13} className="text-teal-600" /> Bunker & Feeding Advice
                </span>
                <ReadAloudButton textToRead={`${result.simpleVerdict}. ${result.recommendations.join('. ')}`} size="sm" />
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Expandable Detailed Parameters */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowDetailedParameters(!showDetailedParameters)}
                className="w-full p-3 bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <span>{t.viewDetailedAnalysis || 'View Detailed Analysis'} (Fermentation Metrics)</span>
                {showDetailedParameters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showDetailedParameters && (
                <div className="p-3 bg-white dark:bg-slate-900 space-y-2 text-xs border-t border-slate-200 dark:border-slate-800 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Acidity (pH)</span>
                      <span className="font-extrabold text-teal-600 dark:text-teal-400 text-sm">{result.phValue} pH</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">FQI Index</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">{result.fqiScore || '84.5'}/100</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">{t.dryMatter || 'Dry Matter'}</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">{result.dryMatterPercent || (100 - result.moisturePercent).toFixed(1)}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Pit Core Temp</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">{result.internalTemperatureC}°C</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fermentation Status:</span>
                      <span className="font-bold text-teal-600">{result.fermentationStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Spoilage Risk:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{result.spoilageRisk}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mould & Crust:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{result.mouldRisk}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* QR Success */}
            {showQRSuccess && (
              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-200 text-xs font-semibold text-center">
                Certified Silage QR batch generated! Check QR Registry.
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleGenerateQR}
                className="py-2.5 px-3 min-h-[40px] rounded-xl border border-teal-600 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <QrCode size={14} /> Generate QR
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="py-2.5 px-3 min-h-[40px] rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <Save size={14} /> Save Silage Test
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
