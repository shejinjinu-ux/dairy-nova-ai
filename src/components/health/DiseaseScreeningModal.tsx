import React, { useState } from 'react';
import { aiApi, DiseaseScreeningOutput } from '../../services/api/aiApi';
import { Animal, HealthAlert } from '../../types';
import { VoiceInput } from '../common/VoiceInput';
import { ReadAloudButton } from '../common/ReadAloudButton';
import { SourceTag } from '../common/SourceTag';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Stethoscope,
  Save,
  MessageSquare,
  Radio,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DiseaseScreeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAnimal?: Animal | null;
  onResultSaved?: (alert: Omit<HealthAlert, 'id' | 'timestamp'>) => void;
  onOpenAIChat?: (animal?: Animal) => void;
}

export const DiseaseScreeningModal: React.FC<DiseaseScreeningModalProps> = ({
  isOpen,
  onClose,
  selectedAnimal,
  onResultSaved,
  onOpenAIChat,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string>(
    selectedAnimal?.imageUrl ||
      'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=500&auto=format&fit=crop&q=80'
  );
  const [symptomsText, setSymptomsText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<DiseaseScreeningOutput | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const samplePresets = [
    {
      title: 'Udder Swelling / Mastitis',
      symptoms: 'Swollen warm udder quarter with slight clots in morning milk and 39.5°C fever.',
      img: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Lumpy Skin Lesions',
      symptoms: 'Firm raised circular nodules on neck and back with high fever and watering eyes.',
      img: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Salivation / Foot & Mouth',
      symptoms: 'Excessive ropy mouth salivation, blisters on tongue and limping on right forefoot.',
      img: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Standing Heat / Estrus',
      symptoms: 'Clear mucous discharge, frequent mounting behavior and restlessness.',
      img: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500&auto=format&fit=crop&q=80',
    },
  ];

  const handleStartAnalysis = async () => {
    setStep(3);
    setIsAnalyzing(true);

    try {
      const output = await aiApi.screenDisease({
        imageUrl: selectedImage,
        symptomsText,
        animalId: selectedAnimal?.id,
        animalTag: selectedAnimal?.tagId,
      });
      setResult(output);
      setIsAnalyzing(false);
      setStep(4);
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0d9488', '#16a34a', '#38bdf8'],
      });
    } catch {
      setIsAnalyzing(false);
    }
  };

  const handleSaveResult = () => {
    if (!result) return;
    if (onResultSaved) {
      onResultSaved({
        animalId: selectedAnimal?.id || 'ani-temp',
        animalTag: selectedAnimal?.tagId || 'HERD-CHECK',
        animalName: selectedAnimal?.name || 'Screened Cattle',
        severity: result.severity,
        title: result.possibleConcern,
        description: symptomsText || 'AI Visual & Symptomatic Screening Assessment',
        symptoms: result.symptomsDetected,
        possibleConcern: result.possibleConcern,
        preliminaryGuidance: result.preliminaryGuidance,
        veterinaryAdvice: result.veterinaryAdvice,
        confidenceScore: result.confidenceScore,
        status: 'active',
        source: 'AI Screening',
      });
    }
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
      // Reset
      setStep(1);
      setResult(null);
      setSavedSuccess(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Step {step} of 4 • AI Screening
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {step === 1 && 'Animal Image'}
                {step === 2 && 'Symptoms & Signs'}
                {step === 3 && 'AI Neural Analysis'}
                {step === 4 && 'Preliminary Guidance'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step 1 — Animal Image Selection */}
        {step === 1 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 group">
              <img src={selectedImage} alt="Selected Animal" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-semibold text-white">
                  {selectedAnimal ? `${selectedAnimal.name} (${selectedAnimal.tagId})` : 'Cattle Image Loaded'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(
                    'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=500&auto=format&fit=crop&q=80'
                  );
                }}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <Camera size={14} className="text-teal-600" /> Take Photo
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(
                    'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=500&auto=format&fit=crop&q=80'
                  );
                }}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <Upload size={14} className="text-teal-600" /> Upload Image
              </button>
            </div>

            {/* Quick Demo Case Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Or Select Sample Clinical Case:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {samplePresets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedImage(p.img);
                      setSymptomsText(p.symptoms);
                    }}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 text-left text-xs bg-slate-50 dark:bg-slate-950/60 active:scale-95 transition"
                  >
                    <span className="font-bold text-slate-900 dark:text-white block text-[11px] truncate">
                      {p.title}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">{p.symptoms}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/30 flex items-center justify-center gap-1 active:scale-95 transition"
            >
              Continue to Symptoms <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Step 2 — Symptoms Input */}
        {step === 2 && (
          <div className="space-y-3 animate-fadeIn">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Describe Observable Symptoms *
                </label>
                <VoiceInput
                  onTranscript={(transcript) =>
                    setSymptomsText((prev) => (prev ? `${prev} ${transcript}` : transcript))
                  }
                  placeholderPrompt={symptomsText || samplePresets[0].symptoms}
                />
              </div>

              <textarea
                rows={4}
                value={symptomsText}
                onChange={(e) => setSymptomsText(e.target.value)}
                placeholder="Type or tap the microphone to describe symptoms (e.g. swollen udder, fever 39.8°C, nasal discharge, reduced rumination)..."
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 leading-relaxed"
              />
            </div>

            {/* Symptom Tag Shortcuts */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Tag Shortcuts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Udder Swelling',
                  'High Fever (>39.5°C)',
                  'Watery Milk',
                  'Loss of Appetite',
                  'Limping',
                  'Skin Nodules',
                  'Mouth Salivation',
                  'Estrus Mucous',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setSymptomsText((prev) => (prev ? `${prev}, ${tag}` : tag))
                    }
                    className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 text-[10px] font-semibold border border-teal-200 dark:border-teal-800 active:scale-95 transition"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center justify-center gap-1 active:scale-95 transition"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={handleStartAnalysis}
                disabled={!symptomsText.trim()}
                className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-teal-600/30 flex items-center justify-center gap-1 active:scale-95 transition"
              >
                Start AI Analysis <Sparkles size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — AI Thinking Radar State */}
        {step === 3 && isAnalyzing && (
          <div className="py-10 text-center space-y-4 animate-fadeIn">
            {/* Animated Radar Pulse */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-teal-500/20 animate-ping" />
              <span className="absolute inset-2 rounded-full border border-teal-400/40 animate-pulse-slow" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-teal-600 to-dairy-600 text-white flex items-center justify-center shadow-xl shadow-teal-600/40 relative z-10">
                <Radio size={30} className="animate-spin" />
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Dairy Nova AI is analyzing...
              </h4>
              <p className="text-xs text-slate-500">
                Matching visual symptoms against 240+ veterinary pathology datasets
              </p>
            </div>
          </div>
        )}

        {/* Step 4 — Screening Result */}
        {step === 4 && result && (
          <div className="space-y-3.5 animate-fadeIn text-xs">
            {/* Result Header Card */}
            <div className={`p-3.5 rounded-2xl border ${
              result.severity === 'critical'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900'
                : result.severity === 'high'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900'
                : 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Possible Concern (Screening Only)
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                    {result.possibleConcern}
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-[10px] shadow-sm">
                  {result.confidenceScore}% Confidence
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <SourceTag source="AI Screening" />
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                  result.severity === 'critical'
                    ? 'bg-rose-600 text-white'
                    : result.severity === 'high'
                    ? 'bg-amber-600 text-white'
                    : 'bg-teal-600 text-white'
                }`}>
                  {result.severity.toUpperCase()} RISK
                </span>
              </div>
            </div>

            {/* Guidance Section */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">
                  Preliminary Guidance:
                </strong>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  {result.preliminaryGuidance}
                </p>
              </div>

              {/* Veterinary Callout */}
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <Stethoscope size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[11px] font-bold">Veterinarian Guidance:</strong>
                  <span className="text-[10px] leading-tight block">{result.veterinaryAdvice}</span>
                </div>
              </div>

              {/* Prevention Tips */}
              <div>
                <strong className="text-slate-900 dark:text-white block mb-1">
                  Immediate Preventive Steps:
                </strong>
                <ul className="space-y-1 list-disc list-inside text-slate-600 dark:text-slate-400 text-[11px]">
                  {result.preventionTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* STRICT AI SAFETY DISCLAIMER */}
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 flex items-start gap-2">
              <ShieldAlert size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-tight font-medium">
                <strong>IMPORTANT DISCLAIMER:</strong> {result.disclaimer}
              </p>
            </div>

            {/* Read Aloud & Ask AI */}
            <div className="flex items-center justify-between pt-1">
              <ReadAloudButton
                textToRead={`AI Screening Result: ${result.possibleConcern}. ${result.preliminaryGuidance}. ${result.veterinaryAdvice}`}
                size="sm"
              />

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenAIChat) onOpenAIChat(selectedAnimal || undefined);
                }}
                className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center gap-1 active:scale-95 transition"
              >
                <MessageSquare size={13} /> Ask AI Assistant
              </button>
            </div>

            {/* Save Action */}
            <button
              type="button"
              onClick={handleSaveResult}
              className="w-full py-2.5 rounded-xl bg-dairy-600 hover:bg-dairy-700 text-white text-xs font-bold shadow-md shadow-dairy-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              {savedSuccess ? <CheckCircle2 size={15} /> : <Save size={15} />}
              {savedSuccess ? 'Screening Saved to History!' : 'Save Screening Result'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
