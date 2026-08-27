import React, { useState } from 'react';
import { feedApi } from '../../services/api/feedApi';
import { FeedAnalysisResult, QRBatch } from '../../types';
import { DevicePairingSheet } from '../common/DevicePairingSheet';
import { QRCodeCard } from '../common/QRCodeCard';
import { SourceTag } from '../common/SourceTag';
import { ReadAloudButton } from '../common/ReadAloudButton';
import { VoiceInput } from '../common/VoiceInput';
import {
  X,
  Camera,
  Upload,
  Bluetooth,
  Edit3,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Save,
  Radio,
  FileCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

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
  const [step, setStep] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1592417817098-8f3d6eb22513?w=500&auto=format&fit=crop&q=80'
  );
  const [feedCategory, setFeedCategory] = useState<string>('Green Fodder');
  const [feedName, setFeedName] = useState<string>('Super Napier CO-5 Hybrid');
  const [inputSource, setInputSource] = useState<'Camera Only' | 'Portable Scanner Simulation' | 'Manual Entry'>('Portable Scanner Simulation');
  
  // Manual / Sensor params
  const [moisture, setMoisture] = useState<number>(78.5);
  const [crudeProtein, setCrudeProtein] = useState<number>(12.4);
  const [fiber, setFiber] = useState<number>(26.8);
  const [energy, setEnergy] = useState<number>(64.2);
  const [notes, setNotes] = useState<string>('');

  const [isPairingOpen, setIsPairingOpen] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<FeedAnalysisResult | null>(null);
  const [showQR, setShowQR] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStartAnalysis = async () => {
    setStep(5);
    setIsAnalyzing(true);

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

  const handleCreateQR = () => {
    if (!result) return;
    const batch: QRBatch = {
      batchId: result.batchId,
      itemType: 'Feed',
      title: result.feedName,
      farmName: 'Sri Lakshmi Dairy Farm',
      farmerName: 'Ramesh Kumar',
      generatedDate: result.date,
      qualityGrade: result.qualityGrade,
      adulterationFlags: `Urea: ${result.ureaRisk} • Mould: ${result.fungalMouldRisk}`,
      verificationStatus: result.overallScore >= 75 ? 'Certified Safe' : 'Requires Lab Review',
      dataSource: inputSource === 'Portable Scanner Simulation' ? 'Sensor Reading' : 'AI Screening',
      parameters: {
        'Crude Protein': `${result.crudeProteinPercent}%`,
        'Moisture': `${result.moisturePercent}%`,
        'TDN Energy': `${result.tdnEnergyPercent}%`,
        'Fiber NDF': `${result.crudeFiberPercent}%`,
      },
      qrPayload: `https://dairynova.ai/verify/feed/${result.batchId}`,
    };

    if (onGenerateQRBatch) onGenerateQRBatch(batch);
    setShowQR(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-dairy-600 dark:text-dairy-400">
                Step {step} of 5 • Feed Quality NIR
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {step === 1 && 'Upload Feed Image'}
                {step === 2 && 'Feed Category'}
                {step === 3 && 'Choose Input Source'}
                {step === 4 && 'Nutritional Parameters'}
                {step === 5 && 'Quality Analysis Result'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>

          {/* Step 1 — Image */}
          {step === 1 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800">
                <img src={imageUrl} alt="Feed" className="w-full h-full object-cover" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImageUrl('https://images.unsplash.com/photo-1592417817098-8f3d6eb22513?w=500&auto=format&fit=crop&q=80')}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <Camera size={14} className="text-dairy-600" /> Take Photo
                </button>
                <button
                  type="button"
                  onClick={() => setImageUrl('https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500&auto=format&fit=crop&q=80')}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <Upload size={14} className="text-dairy-600" /> Upload Image
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-2.5 rounded-xl bg-dairy-600 hover:bg-dairy-700 text-white text-xs font-bold shadow-md shadow-dairy-600/30 flex items-center justify-center gap-1 active:scale-95 transition"
              >
                Continue to Category <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Step 2 — Feed Category */}
          {step === 2 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="space-y-2">
                {[
                  { title: 'Green Fodder (Hybrid Napier, Maize, Lucerne)', cat: 'Green Fodder', name: 'Super Napier CO-5' },
                  { title: 'Concentrate Pellet (Cattle Feed 22% CP)', cat: 'Concentrate Pellet', name: 'Balanced Dairy Feed Pellets' },
                  { title: 'Dry Roughage (Paddy / Wheat Straw)', cat: 'Dry Roughage', name: 'Stored Paddy Straw' },
                  { title: 'Total Mixed Ration (TMR Blend)', cat: 'TMR Ration', name: 'Silage + Hay + Concentrate Blend' },
                ].map((item) => (
                  <button
                    key={item.cat}
                    type="button"
                    onClick={() => {
                      setFeedCategory(item.cat);
                      setFeedName(item.name);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left text-xs transition active:scale-95 flex items-center justify-between ${
                      feedCategory === item.cat
                        ? 'bg-dairy-50 dark:bg-dairy-950/70 border-dairy-600 text-dairy-900 dark:text-dairy-100 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{item.title}</span>
                    {feedCategory === item.cat && <CheckCircle2 size={16} className="text-dairy-600 shrink-0" />}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <ArrowLeft size={14} className="inline mr-1" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="py-2.5 px-3 rounded-xl bg-dairy-600 hover:bg-dairy-700 text-white text-xs font-bold shadow-md shadow-dairy-600/30"
                >
                  Next <ArrowRight size={14} className="inline ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Choose Input Source */}
          {step === 3 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setInputSource('Portable Scanner Simulation');
                    setIsPairingOpen(true);
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left text-xs transition active:scale-95 space-y-1 ${
                    inputSource === 'Portable Scanner Simulation'
                      ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-600 text-teal-900 dark:text-teal-100'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <Bluetooth size={16} className="text-teal-600" />
                      Portable NIR Scanner (Simulated BLE)
                    </span>
                    {inputSource === 'Portable Scanner Simulation' && <CheckCircle2 size={16} className="text-teal-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Pair with handheld optical spectrometer probe for precise moisture & crude protein readings.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setInputSource('Camera Only')}
                  className={`w-full p-3.5 rounded-2xl border text-left text-xs transition active:scale-95 space-y-1 ${
                    inputSource === 'Camera Only'
                      ? 'bg-dairy-50 dark:bg-dairy-950/70 border-dairy-600 text-dairy-900 dark:text-dairy-100'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <Camera size={16} className="text-dairy-600" />
                      Camera Visual AI Estimation
                    </span>
                    {inputSource === 'Camera Only' && <CheckCircle2 size={16} className="text-dairy-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Computer vision estimation of chop length, green leaf ratio, and discoloration.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setInputSource('Manual Entry')}
                  className={`w-full p-3.5 rounded-2xl border text-left text-xs transition active:scale-95 space-y-1 ${
                    inputSource === 'Manual Entry'
                      ? 'bg-amber-50 dark:bg-amber-950/70 border-amber-600 text-amber-900 dark:text-amber-100'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <Edit3 size={16} className="text-amber-600" />
                      Manual Lab Entry
                    </span>
                    {inputSource === 'Manual Entry' && <CheckCircle2 size={16} className="text-amber-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Manually enter laboratory proximate analysis values.
                  </p>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <ArrowLeft size={14} className="inline mr-1" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="py-2.5 px-3 rounded-xl bg-dairy-600 hover:bg-dairy-700 text-white text-xs font-bold shadow-md shadow-dairy-600/30"
                >
                  Continue <ArrowRight size={14} className="inline ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4 — Optional Manual Parameters */}
          {step === 4 && (
            <div className="space-y-3 animate-fadeIn text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Moisture %
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={moisture}
                    onChange={(e) => setMoisture(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Crude Protein %
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={crudeProtein}
                    onChange={(e) => setCrudeProtein(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-dairy-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Crude Fiber %
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={fiber}
                    onChange={(e) => setFiber(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Energy (TDN %)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={energy}
                    onChange={(e) => setEnergy(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Voice / Written Notes
                  </label>
                  <VoiceInput
                    onTranscript={(t) => setNotes((prev) => (prev ? `${prev} ${t}` : t))}
                    placeholderPrompt="Harvested at 45 days. Good green leafiness."
                  />
                </div>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 45 days regrowth, chopped fine, fresh smell..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <ArrowLeft size={14} className="inline mr-1" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  className="py-2.5 px-3 rounded-xl bg-dairy-600 hover:bg-dairy-700 text-white text-xs font-bold shadow-md shadow-dairy-600/30 flex items-center justify-center gap-1"
                >
                  Analyze Feed <Sparkles size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Step 5 — Results */}
          {step === 5 && isAnalyzing && (
            <div className="py-10 text-center space-y-4 animate-fadeIn">
              <Radio size={36} className="animate-spin text-teal-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  NIR Spectrometry & AI Quality Indexing...
                </h4>
                <p className="text-xs text-slate-500">
                  Screening crude protein, silica, and aflatoxin contamination risk
                </p>
              </div>
            </div>
          )}

          {step === 5 && result && !isAnalyzing && (
            <div className="space-y-3.5 animate-fadeIn text-xs">
              
              {/* Score Card */}
              <div className="bg-gradient-to-br from-dairy-700 to-teal-900 text-white p-4 rounded-3xl shadow-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-dairy-200">
                      Overall Quality Score
                    </span>
                    <h4 className="text-2xl font-black">{result.overallScore} / 100</h4>
                    <span className="text-xs font-semibold text-dairy-100">{result.qualityGrade}</span>
                  </div>
                  <SourceTag source={inputSource === 'Portable Scanner Simulation' ? 'Sensor Reading' : 'AI Screening'} />
                </div>
              </div>

              {/* Nutritional Breakdown Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Crude Protein</span>
                  <span className="text-sm font-extrabold text-dairy-600 dark:text-dairy-400">{result.crudeProteinPercent}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Moisture Content</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{result.moisturePercent}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Crude Fiber</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{result.crudeFiberPercent}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">TDN Energy</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{result.tdnEnergyPercent}%</span>
                </div>
              </div>

              {/* Risk Screening */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Adulterant & Risk Screening
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Urea Risk:</span>
                    <span className="font-semibold text-emerald-600">{result.ureaRisk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Silica Risk:</span>
                    <span className="font-semibold">{result.silicaSandRisk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mycotoxin:</span>
                    <span className="font-semibold text-emerald-600">{result.mycotoxinRisk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mould Risk:</span>
                    <span className="font-semibold text-emerald-600">{result.fungalMouldRisk}</span>
                  </div>
                </div>
              </div>

              {/* AI Advisory */}
              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-teal-900 dark:text-teal-200 flex items-center gap-1 font-bold">
                    <Sparkles size={12} className="text-teal-600" /> AI Feed Advisory
                  </strong>
                  <ReadAloudButton textToRead={result.aiAdvisory} size="sm" />
                </div>
                <p className="text-teal-800 dark:text-teal-300 leading-relaxed">{result.aiAdvisory}</p>
              </div>

              {/* Actions: Save & Generate QR */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCreateQR}
                  className="py-2.5 px-3 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <QrCode size={14} /> Generate QR Label
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

      {/* BLE Scanner Pairing Modal */}
      <DevicePairingSheet
        isOpen={isPairingOpen}
        onClose={() => setIsPairingOpen(false)}
        onDeviceConnected={(data) => {
          setCrudeProtein(data.sensorReading.crudeProtein);
          setMoisture(data.sensorReading.moisture);
          setFiber(data.sensorReading.fiber);
          setEnergy(data.sensorReading.energy);
        }}
      />
    </>
  );
};
