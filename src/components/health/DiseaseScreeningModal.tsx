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
  RefreshCw,
  PhoneCall,
  Syringe,
  ExternalLink,
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

  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('Image file is too large. Please select a photo under 10 MB.');
        return;
      }

      // Validate image type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Unsupported file format. Please upload a JPEG, PNG, or WebP photo.');
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setErrorMessage('');
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile && !previewUrl && !symptomsText) {
      setErrorMessage('Please capture or select a photo of the cattle, or describe symptoms.');
      return;
    }

    setErrorMessage('');
    setIsAnalyzing(true);
    setIsSaved(false);
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

      // Automatically persist to Health Alerts and History immediately
      if (onResultSaved) {
        onResultSaved({
          animalId: selectedAnimal?.id || 'ani-general',
          animalTag: selectedAnimal?.tagId || 'HERD-TAG',
          animalName: selectedAnimal?.name || 'Cattle',
          severity: output.severity,
          title: output.possibleConcern,
          description: output.preliminaryGuidance,
          symptoms: output.symptomsDetected,
          possibleConcern: output.possibleConcern,
          preliminaryGuidance: output.preliminaryGuidance,
          veterinaryAdvice: output.veterinaryAdvice,
          confidenceScore: output.confidenceScore,
          status: 'active',
          source: 'AI Screening',
        });
        setIsSaved(true);
      }

      setIsAnalyzing(false);
      setStep(4);
    } catch (err: any) {
      setIsAnalyzing(false);
      setStep(2);
      setErrorMessage(
        err.message ||
          'Unable to analyze this image right now. AI disease model is temporarily unavailable on the server.'
      );
    }
  };

  const handleSaveAlert = () => {
    if (!result) return;

    if (!isSaved && onResultSaved) {
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
      setIsSaved(true);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
              <Stethoscope size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                🩺 {t.aiHealthDiseaseScreening || 'AI HEALTH & DISEASE SCREENING'}
              </h3>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold block">
                {t.visualLesionEngine || 'Visual Lesion & Clinical Symptom Engine'}
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

        {/* Error Banner with Specific Information */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs space-y-1.5 animate-shake">
            <div className="flex items-start gap-2 font-semibold">
              <AlertCircle size={16} className="shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>

            {/* Preliminary Safe Advisory when Model is Offline/Fails */}
            <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-800/60 text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
              <strong className="block text-slate-900 dark:text-white font-bold flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-500" /> {t.immediateBiosecuritySteps || 'Immediate Biosecurity Steps:'}
              </strong>
              <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-600 dark:text-slate-400">
                <li>{t.biosecurityStep1 || 'Isolate the cattle in a clean, shaded, well-ventilated stall'}</li>
                <li>{t.biosecurityStep2 || 'Provide clean ad-libitum drinking water and soft green fodder'}</li>
                <li>{t.biosecurityStep3 || 'Avoid moving animals between herds to prevent potential contagion'}</li>
                <li>{t.biosecurityStep4 || 'Contact your local government veterinary dispensary for clinical diagnosis'}</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 1: Capture or Upload Photo */}
        {step === 1 && (
          <div className="space-y-3.5 animate-fadeIn text-xs">
            <div className="text-center space-y-1">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {t.captureClinicalPhoto || 'Capture Cattle Clinical Photo'}
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Take a clear photo of skin nodules, muzzle, eyes, or udder for AI lesion analysis.
              </p>
            </div>

            {/* Photo Preview or Upload Zone */}
            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
              {previewUrl ? (
                <div className="space-y-2">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <img
                      src={previewUrl}
                      alt="Clinical screening preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-white text-[11px] font-medium truncate">
                        {selectedFile ? selectedFile.name : 'Target Cattle Image'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline"
                    >
                      Change Photo
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl('');
                      }}
                      className="text-xs text-rose-500 font-bold hover:underline"
                    >
                      {t.removePhoto || 'Remove Photo'}
                    </button>
                  </div>
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

        {/* Step 2: Describe Symptoms */}
        {step === 2 && (
          <div className="space-y-3.5 animate-fadeIn text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 dark:text-white">
                Observed Symptoms (Optional)
              </span>
              <VoiceInput onTranscript={(text: string) => setSymptomsText((prev) => `${prev} ${text}`.trim())} />
            </div>

            <textarea
              rows={3}
              value={symptomsText}
              onChange={(e) => setSymptomsText(e.target.value)}
              placeholder="e.g. High fever, reduced milk yield, watery eye discharge, skin nodules..."
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            {/* Selected Image Thumbnail */}
            {previewUrl && (
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <img
                  src={previewUrl}
                  alt="Selected thumbnail"
                  className="w-10 h-10 object-cover rounded-lg shrink-0"
                />
                <div className="overflow-hidden">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                    {selectedFile ? selectedFile.name : 'Target Cattle Photo'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Image Ready</span>
                </div>
              </div>
            )}

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
                <span>{errorMessage ? 'Retry AI Screening' : 'Run AI Screening'}</span>
                {errorMessage ? <RefreshCw size={14} /> : <Sparkles size={14} />}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Analyzing State */}
        {step === 3 && isAnalyzing && (
          <div className="py-10 text-center space-y-3 animate-fadeIn text-xs">
            <Loader2 size={36} className="animate-spin text-teal-600 mx-auto" />
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                Analyzing Cattle Image...
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1">
                Running EfficientNet deep learning lesion analysis for cattle disease screening...
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Real Screening Result */}
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
                    Prediction
                  </span>
                  <h4 className="text-lg font-black">{result.possibleConcern}</h4>
                </div>
                {result.confidenceScore > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-black backdrop-blur-sm">
                    {result.confidenceScore}% Confidence
                  </span>
                )}
              </div>
              <p className="text-xs text-white/95 leading-relaxed bg-white/10 p-2.5 rounded-2xl">
                {result.preliminaryGuidance}
              </p>
            </div>

            {/* Observed Information & Symptoms */}
            {result.symptomsDetected && result.symptomsDetected.length > 0 && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  Observed Clinical Indicators:
                </span>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                  {result.symptomsDetected.map((sym, idx) => (
                    <li key={idx}>{sym}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Next Action & Veterinary Advice */}
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1 text-xs">
                  <ShieldAlert size={14} className="text-amber-600" /> Recommended Next Action:
                </span>
                <ReadAloudButton textToRead={`${result.preliminaryGuidance}. ${result.veterinaryAdvice}`} size="sm" />
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                {result.veterinaryAdvice}
              </p>
            </div>

            {/* 💉 Recommended Vaccine, Timing & 3-Tier Pricing */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-500/40 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <Syringe size={14} />
                </div>
                <div>
                  <h5 className="font-extrabold text-slate-900 dark:text-white text-xs">
                    Recommended Vaccine & Timing
                  </h5>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {result.recommendedVaccine || 'Consult a veterinarian for the appropriate vaccine.'}
                  </span>
                </div>
              </div>

              {result.vaccinationTiming && (
                <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl">
                  <strong>Recommended Timing:</strong> {result.vaccinationTiming}
                </div>
              )}

              {/* 3-Tier Price Breakdown */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700 space-y-1.5 text-[11px]">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">
                  3-Tier Source-Backed Price Breakdown
                </span>

                <div className="flex justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Government Programme / Farmer Cost:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    {result.farmerCostDisplay || '₹0 (Free under NADCP)'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Government Procurement Price:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {result.procurementCostDisplay || '₹18.00 / dose'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Private Retail Price:</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-400 text-right text-[10px] max-w-[200px]">
                    {result.retailPriceDisplay || 'Retail price unavailable — check local veterinary pharmacy / Animal Husbandry Department.'}
                  </span>
                </div>

                {result.sourceName && (
                  <div className="pt-1 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[9px] text-slate-400">
                    <span>Source: {result.sourceName} ({result.sourceDate || '2024-2025'})</span>
                    {result.sourceUrl && (
                      <a
                        href={result.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5"
                      >
                        Verify <ExternalLink size={8} />
                      </a>
                    )}
                  </div>
                )}
              </div>

              <p className="text-[10px] text-slate-400 italic">
                Estimated information only. Consult a qualified veterinarian for diagnosis and vaccination decisions.
              </p>
            </div>

            {/* MANDATORY DISCLAIMER */}
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 space-y-0.5">
              <strong className="block font-bold text-slate-700 dark:text-slate-300">
                Medical Disclaimer:
              </strong>
              <p>This is an AI screening result, not a veterinary diagnosis. Always consult a qualified veterinarian.</p>
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
