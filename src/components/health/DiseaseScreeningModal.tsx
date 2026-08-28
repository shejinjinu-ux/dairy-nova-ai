import React, { useState, useRef } from 'react';
import { aiApi, DiseaseScreeningOutput } from '../../services/api/aiApi';
import { Animal, HealthAlert } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
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
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

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
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(selectedAnimal?.imageUrl || '');
  const [symptomsText, setSymptomsText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [result, setResult] = useState<DiseaseScreeningOutput | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setErrorMessage('');
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile && !previewUrl && !symptomsText) {
      setErrorMessage('Please take or upload a photo of the affected area, or describe symptoms.');
      return;
    }

    setErrorMessage('');
    setIsAnalyzing(true);
    setStep(3);

    try {
      const output = await aiApi.screenDisease({
        imageFile: selectedFile,
        imageUrl: !selectedFile ? previewUrl : undefined,
        symptomsText,
        animalId: selectedAnimal?.id,
        animalTag: selectedAnimal?.tagId,
      });

      setResult(output);
      setIsAnalyzing(false);
      setStep(4);
    } catch (err: any) {
      setIsAnalyzing(false);
      setStep(2);
      setErrorMessage(err.message || 'Disease screening encountered an error. Please try uploading a clearer image.');
    }
  };

  const handleSaveAlert = () => {
    if (!result || !onResultSaved) return;

    onResultSaved({
      animalId: selectedAnimal?.id || 'ani-general',
      animalTag: selectedAnimal?.tagId || 'HERD-TAG',
      animalName: selectedAnimal?.name || 'Cattle',
      severity: result.severity,
      title: result.possibleConcern,
      description: result.preliminaryGuidance,
      symptoms: result.symptomsDetected,
      possibleConcern: result.possibleConcern,
      preliminaryGuidance: result.preliminaryGuidance,
      veterinaryAdvice: result.veterinaryAdvice,
      confidenceScore: result.confidenceScore,
      status: 'active',
      source: 'AI Screening',
    });

    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
              <Stethoscope size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {t.diseaseCheck || 'Health & Disease AI'}
              </h3>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold block">
                Visual Symptom & Lesion Screening
              </span>
            </div>
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

        {/* Step 1: Capture or Upload Photo */}
        {step === 1 && (
          <div className="space-y-3.5 animate-fadeIn text-xs">
            <div className="text-center space-y-1">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Capture Cattle Clinical Photo
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Take a clear photo of skin nodules, muzzle, eyes, or udder for AI lesion analysis.
              </p>
            </div>

            {/* Photo Preview or Upload Zone */}
            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
              {previewUrl ? (
                <div className="space-y-2">
                  <img
                    src={previewUrl}
                    alt="Clinical screening preview"
                    className="h-44 w-full object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl('');
                    }}
                    className="text-xs text-rose-500 font-bold hover:underline"
                  >
                    {t.removePhoto || 'Retake / Remove Photo'}
                  </button>
                </div>
              ) : (
                <div className="py-6 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
                    <Camera size={28} />
                  </div>
                  <div>
                    <strong className="block text-slate-900 dark:text-white text-xs font-bold">
                      {t.takePhoto || 'Take Photo with Camera'}
                    </strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      or choose image from gallery
                    </span>
                  </div>
                  <div className="flex justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center gap-1.5 active:scale-95 transition"
                    >
                      <Upload size={14} /> {t.uploadPhoto || 'Select Photo'}
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3 min-h-[42px] rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <span>{t.continueBtn || 'Next: Describe Symptoms'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Step 2: Symptoms & Notes */}
        {step === 2 && (
          <div className="space-y-3 animate-fadeIn text-xs">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Additional Observable Symptoms (Optional)
              </label>
              <VoiceInput onTranscript={(text: string) => setSymptomsText((prev) => `${prev} ${text}`.trim())} />
            </div>

            <textarea
              rows={3}
              value={symptomsText}
              onChange={(e) => setSymptomsText(e.target.value)}
              placeholder="e.g. Fever > 39.5°C, reduced milk yield, watery eye discharge, limping..."
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none"
            />

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
                className="py-2.5 px-3 min-h-[40px] rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/30 flex items-center justify-center gap-1 active:scale-95 transition"
              >
                <span>Run AI Screening</span>
                <Sparkles size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Analyzing Spinner */}
        {step === 3 && isAnalyzing && (
          <div className="py-10 text-center space-y-3 animate-fadeIn text-xs">
            <Loader2 size={36} className="animate-spin text-teal-600 mx-auto" />
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                Running Neural Disease Screening...
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1">
                Checking for Lumpy Skin, FMD, Keratoconjunctivitis, and Mastitis lesions
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Screening Result */}
        {step === 4 && result && (
          <div className="space-y-3 animate-fadeIn text-xs">
            
            {/* Top Result Card */}
            <div className={`p-4 rounded-3xl text-white space-y-2 shadow-lg ${
              result.severity === 'critical'
                ? 'bg-gradient-to-br from-rose-700 to-red-950'
                : result.severity === 'high'
                ? 'bg-gradient-to-br from-amber-700 to-orange-950'
                : result.severity === 'medium'
                ? 'bg-gradient-to-br from-yellow-700 to-amber-950'
                : 'bg-gradient-to-br from-teal-700 to-emerald-950'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-200">
                    Preliminary AI Screening Result
                  </span>
                  <h4 className="text-lg font-black">{result.possibleConcern}</h4>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-black backdrop-blur-sm">
                  {result.confidenceScore}% Match
                </span>
              </div>
              <p className="text-xs text-white/95 leading-relaxed bg-white/10 p-2.5 rounded-2xl">
                {result.preliminaryGuidance}
              </p>
            </div>

            {/* Isolation & Veterinary Advice */}
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1 text-xs">
                  <ShieldAlert size={14} className="text-amber-600" /> Isolation & Veterinary Advice
                </span>
                <ReadAloudButton textToRead={`${result.preliminaryGuidance}. ${result.veterinaryAdvice}`} size="sm" />
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                {result.veterinaryAdvice}
              </p>
            </div>

            {/* MANDATORY DISCLAIMER */}
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 space-y-0.5">
              <strong className="block font-bold text-slate-700 dark:text-slate-300">
                Medical & Veterinary Disclaimer:
              </strong>
              <p>{result.disclaimer || t.diseaseDisclaimerNotice || 'This is an AI screening result, not a confirmed veterinary diagnosis. Always consult a certified veterinarian for prescription medicine and treatment.'}</p>
            </div>

            {/* Save Success */}
            {savedSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-semibold text-center">
                Clinical screening saved to priority herd alerts.
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenAIChat) onOpenAIChat(selectedAnimal || undefined);
                }}
                className="py-2.5 px-3 min-h-[40px] rounded-xl border border-teal-600 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <MessageSquare size={14} /> Ask AI More
              </button>
              <button
                type="button"
                onClick={handleSaveAlert}
                className="py-2.5 px-3 min-h-[40px] rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <Save size={14} /> Save Alert
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
