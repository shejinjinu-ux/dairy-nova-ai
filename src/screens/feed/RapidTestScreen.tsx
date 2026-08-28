import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { FeedAnalysisModal } from '../../components/feed/FeedAnalysisModal';
import { SilageAnalysisModal } from '../../components/silage/SilageAnalysisModal';
import {
  Wheat,
  Layers,
  Sparkles,
  Camera,
  Radio,
  Keyboard,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const RapidTestScreen: React.FC = () => {
  const { addFeedAnalysis, addSilageAnalysis, addQRBatch, navigate } = useAppData();
  const { t } = useLanguage();

  const [step, setStep] = useState<number>(1);
  const [selectedSampleType, setSelectedSampleType] = useState<string>('Green Fodder');
  const [selectedMethod, setSelectedMethod] = useState<'Camera Only' | 'Portable Scanner Simulation' | 'Manual Entry'>('Manual Entry');
  
  // Modals for test execution
  const [isFeedModalOpen, setIsFeedModalOpen] = useState<boolean>(false);
  const [isSilageModalOpen, setIsSilageModalOpen] = useState<boolean>(false);

  const sampleTypes = [
    {
      id: 'Dry Feed',
      title: t.dryFeed || '🌾 Dry Feed',
      subtitle: 'Paddy straw, wheat straw, dried hay, husk',
      icon: Wheat,
      color: 'amber',
    },
    {
      id: 'Silage',
      title: t.silageSample || '🌽 Silage',
      subtitle: 'Corn/Maize pit silage, sorghum, bunker pack',
      icon: Layers,
      color: 'teal',
      badge: 'High Priority',
    },
    {
      id: 'Green Fodder',
      title: t.greenFodder || '🌱 Green Fodder',
      subtitle: 'Super Napier CO-5, Lucerne, green maize, sorghum',
      icon: Wheat,
      color: 'emerald',
    },
    {
      id: 'Mixed Feed',
      title: t.mixedFeed || '🥣 Mixed Feed',
      subtitle: 'Concentrate pellets, TMR ration, grain mash',
      icon: Sparkles,
      color: 'blue',
    },
  ];

  const testMethods = [
    {
      id: 'Camera Only' as const,
      title: t.photoSampleScan || '📷 Photo / Sample Scan',
      subtitle: 'Capture sample image for optical visual documentation and batch seal',
      icon: Camera,
      tag: 'Fast & Easy',
    },
    {
      id: 'Manual Entry' as const,
      title: t.manualEntry || '⌨️ Manual Entry',
      subtitle: 'Enter known moisture, crude protein, fiber, or silage pH values',
      icon: Keyboard,
      tag: 'ICAR / FAO Calibrated',
    },
    {
      id: 'Portable Scanner Simulation' as const,
      title: t.sensorData || '📡 Sensor Data (IoT Probes)',
      subtitle: 'Connect supported portable NIR spectrometers & pH sensors',
      icon: Radio,
      tag: 'Future-Ready',
      isSensor: true,
    },
  ];

  const handleLaunchTest = () => {
    if (selectedSampleType === 'Silage') {
      setIsSilageModalOpen(true);
    } else {
      setIsFeedModalOpen(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader
        showBack={true}
        title={t.rapidFeedAndSilageTesting || 'Rapid Feed & Silage Test'}
        subtitle="AI-Enabled Rapid Quality & Risk Screening"
      />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        
        {/* Step Progress Bar */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
              {step}
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Step {step} of 2
              </span>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                {step === 1 ? (t.chooseYourSample || 'Choose your sample') : (t.howDoYouWantToTest || 'How do you want to test?')}
              </h4>
            </div>
          </div>

          <div className="flex gap-1">
            <span className={`w-6 h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
            <span className={`w-6 h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
          </div>
        </div>

        {/* STEP 1: CHOOSE SAMPLE */}
        {step === 1 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="space-y-1">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                {t.chooseYourSample || 'Choose your sample'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select the feed or silage type you want to test today.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {sampleTypes.map((item) => {
                const isSelected = selectedSampleType === item.id;
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedSampleType(item.id)}
                    className={`p-4 rounded-3xl border transition cursor-pointer active:scale-[0.98] relative space-y-1 shadow-sm ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/70 dark:to-teal-950/70 border-emerald-500 ring-2 ring-emerald-500/50'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}>
                          {isSelected && <CheckCircle2 size={13} />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <span>{t.continueBtn || 'Next: Choose Testing Method'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 2: CHOOSE METHOD */}
        {step === 2 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="space-y-1">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                {t.howDoYouWantToTest || 'How do you want to test?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selected Sample: <strong className="text-emerald-600 dark:text-emerald-400">{selectedSampleType}</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {testMethods.map((method) => {
                const isSelected = selectedMethod === method.id;
                const Icon = method.icon;

                return (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 rounded-3xl border transition cursor-pointer active:scale-[0.98] relative space-y-2 shadow-sm ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/70 dark:to-teal-950/70 border-emerald-500 ring-2 ring-emerald-500/50'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2.5">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                              {method.title}
                            </h4>
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              {method.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {method.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}>
                        {isSelected && <CheckCircle2 size={13} />}
                      </div>
                    </div>

                    {/* Sensor Data Notice */}
                    {method.isSensor && isSelected && (
                      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                        <strong className="block font-bold flex items-center gap-1">
                          <Radio size={13} className="text-amber-600 animate-pulse" />
                          {t.sensorIntegrationTitle || 'Sensor Integration'}
                        </strong>
                        <p className="text-[10px]">
                          {t.sensorIntegrationDesc || 'Connect supported feed/silage sensors for automated readings.'}
                        </p>
                        <span className="inline-block text-[9px] font-bold bg-amber-200/80 dark:bg-amber-900 px-2 py-0.5 rounded-md">
                          Status: {t.sensorStatusNotConnected || 'Not connected (Future-ready)'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-100 active:scale-95 transition"
              >
                <ArrowLeft size={14} />
                <span>{t.backBtn || 'Back'}</span>
              </button>

              <button
                type="button"
                onClick={handleLaunchTest}
                className="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <span>Proceed to Test</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

      </main>

      <BottomNavigation />

      {/* Execution Modals */}
      <FeedAnalysisModal
        isOpen={isFeedModalOpen}
        onClose={() => setIsFeedModalOpen(false)}
        onAnalysisSaved={addFeedAnalysis}
        onGenerateQRBatch={addQRBatch}
        initialFeedType={selectedSampleType}
        initialInputMethod={selectedMethod}
      />

      <SilageAnalysisModal
        isOpen={isSilageModalOpen}
        onClose={() => setIsSilageModalOpen(false)}
        onAnalysisSaved={addSilageAnalysis}
        onGenerateQRBatch={addQRBatch}
        initialSilageType={selectedSampleType === 'Silage' ? 'Whole Corn (Maize) Silage' : 'Corn Silage'}
        initialInputMethod={selectedMethod === 'Portable Scanner Simulation' ? 'Portable Scanner Simulation' : 'Manual Entry'}
      />
    </div>
  );
};
