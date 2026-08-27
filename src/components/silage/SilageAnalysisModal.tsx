import React, { useState } from 'react';
import { silageApi } from '../../services/api/silageApi';
import { SilageAnalysisResult, QRBatch } from '../../types';
import { SourceTag } from '../common/SourceTag';
import { ReadAloudButton } from '../common/ReadAloudButton';
import {
  X,
  Camera,
  Radio,
  Edit3,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Save,
  Thermometer,
  Activity,
} from 'lucide-react';
import confetti from 'canvas-confetti';

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
  const [silageType, setSilageType] = useState<string>('Whole Corn (Maize) Silage');
  const [phValue, setPhValue] = useState<number>(3.85);
  const [moisturePercent, setMoisturePercent] = useState<number>(66.4);
  const [storageDurationDays, setStorageDurationDays] = useState<number>(65);
  const [internalTemperatureC, setInternalTemperatureC] = useState<number>(26.2);
  const [inputSource, setInputSource] = useState<'Manual Entry' | 'Portable Scanner Simulation' | 'Mock IoT Storage Monitoring'>('Mock IoT Storage Monitoring');

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<SilageAnalysisResult | null>(null);

  if (!isOpen) return null;

  const handleStartAnalysis = async () => {
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
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#16a34a', '#0d9488', '#f59e0b'],
      });
    } catch {
      setIsAnalyzing(false);
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
      farmName: 'Sri Lakshmi Dairy Farm',
      farmerName: 'Ramesh Kumar',
      generatedDate: result.date,
      qualityGrade: result.overallQuality,
      adulterationFlags: `Fermentation: ${result.fermentationStatus} • Mould: ${result.mouldRisk}`,
      verificationStatus: result.spoilageRisk === 'Low' ? 'Certified Safe' : 'Requires Lab Review',
      dataSource: inputSource === 'Mock IoT Storage Monitoring' ? 'Sensor Reading' : 'AI Screening',
      parameters: {
        'pH': `${result.phValue}`,
        'Moisture': `${result.moisturePercent}%`,
        'Internal Temp': `${result.internalTemperatureC}°C`,
        'Storage Days': `${result.storageDurationDays} Days`,
      },
      qrPayload: `https://dairynova.ai/verify/silage/${result.batchId}`,
    };

    if (onGenerateQRBatch) onGenerateQRBatch(batch);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Silage Quality & Spoilage Screening
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Silage Pit Fermentation Analysis
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {!result ? (
          <div className="space-y-3.5 text-xs animate-fadeIn">
            {/* Silage Category */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Silage Variety
              </label>
              <select
                value={silageType}
                onChange={(e) => setSilageType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="Whole Corn (Maize) Silage">Whole Corn (Maize) Silage</option>
                <option value="Sorghum + Cowpea Silage">Sorghum + Cowpea Silage</option>
                <option value="Hybrid Napier Grass Silage">Hybrid Napier Grass Silage</option>
                <option value="Sugarcane Top Silage">Sugarcane Top Silage</option>
              </select>
            </div>

            {/* Input Source Choice */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Telemetry & Input Source
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setInputSource('Mock IoT Storage Monitoring')}
                  className={`p-2 rounded-xl border text-left text-[11px] font-bold flex items-center gap-1.5 ${
                    inputSource === 'Mock IoT Storage Monitoring'
                      ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-600 text-teal-900 dark:text-teal-200'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Radio size={14} className="text-teal-600" /> IoT Pit Probes
                </button>

                <button
                  type="button"
                  onClick={() => setInputSource('Manual Entry')}
                  className={`p-2 rounded-xl border text-left text-[11px] font-bold flex items-center gap-1.5 ${
                    inputSource === 'Manual Entry'
                      ? 'bg-dairy-50 dark:bg-dairy-950/70 border-dairy-600 text-dairy-900 dark:text-dairy-200'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Edit3 size={14} className="text-dairy-600" /> Manual Entry
                </button>
              </div>
            </div>

            {/* Parameters */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  pH Level (Target: 3.8-4.2)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={phValue}
                  onChange={(e) => setPhValue(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Moisture % (65-70%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={moisturePercent}
                  onChange={(e) => setMoisturePercent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
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

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Internal Temp (°C)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={internalTemperatureC}
                  onChange={(e) => setInternalTemperatureC(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-teal-600"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartAnalysis}
              disabled={isAnalyzing}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition mt-2"
            >
              {isAnalyzing ? 'Analyzing Silage Fermentation...' : 'Run Silage AI Analysis'}
              <Sparkles size={14} />
            </button>
          </div>
        ) : (
          <div className="space-y-3.5 animate-fadeIn text-xs">
            {/* Silage Result */}
            <div className="bg-gradient-to-br from-teal-700 to-dairy-800 text-white p-4 rounded-3xl space-y-2 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200">
                    Fermentation Quality
                  </span>
                  <h4 className="text-xl font-black">{result.overallQuality}</h4>
                  <span className="text-xs font-semibold text-teal-100">{result.fermentationStatus}</span>
                </div>
                <SourceTag source="AI Screening" />
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Acidity (pH)</span>
                <span className="text-sm font-extrabold text-emerald-600">{result.phValue} (Optimal)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Internal Temperature</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{result.internalTemperatureC}°C</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Spoilage Risk</span>
                <span className="text-sm font-extrabold text-emerald-600">{result.spoilageRisk}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Mould Status</span>
                <span className="text-sm font-extrabold text-emerald-600">{result.mouldRisk}</span>
              </div>
            </div>

            {/* Storage Advice */}
            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[11px] space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-teal-900 dark:text-teal-200 flex items-center gap-1 font-bold">
                  <Sparkles size={12} className="text-teal-600" /> Storage Advice (AI Screening)
                </strong>
                <ReadAloudButton textToRead={result.storageAdvice} size="sm" />
              </div>
              <p className="text-teal-800 dark:text-teal-300 leading-relaxed">{result.storageAdvice}</p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleGenerateQR}
                className="py-2.5 px-3 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <QrCode size={14} /> Generate QR
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="py-2.5 px-3 rounded-xl bg-dairy-600 hover:bg-dairy-700 text-white font-bold shadow-md shadow-dairy-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <Save size={14} /> Save Analysis
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
