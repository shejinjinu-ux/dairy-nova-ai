import React from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { BREEDS_DATA } from '../../mocks/mockData';
import { MobileHeader } from '../../components/common/MobileHeader';
import { SourceTag } from '../../components/common/SourceTag';
import { ReadAloudButton } from '../../components/common/ReadAloudButton';
import { MapPin, Milk, Wheat, ShieldCheck, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

export const BreedDetailsScreen: React.FC = () => {
  const { selectedBreedId } = useAppData();
  const { t } = useLanguage();
  const breed = BREEDS_DATA.find((b) => b.id === selectedBreedId) || BREEDS_DATA[0];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader showBack={true} title={breed.name} subtitle={breed.nativeRegion} />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        {/* Banner */}
        <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 shadow-md">
          <img src={breed.imageUrl} alt={breed.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-slate-950/80 px-2 py-0.5 rounded-md inline-block max-w-fit">
              {breed.animalType}
            </span>
            <h2 className="text-xl font-extrabold text-white mt-1">{breed.name}</h2>
            <p className="text-xs text-slate-300 flex items-center gap-1">
              <MapPin size={12} className="text-teal-400" /> {breed.nativeRegion}
            </p>
          </div>
        </div>

        {/* Description & Read Aloud */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">{t.breedOverview || 'Breed Overview'}</h3>
            <ReadAloudButton textToRead={`${breed.name}. ${breed.description}`} size="sm" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            {breed.description}
          </p>
        </div>

        {/* Vital Parameters */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 block font-medium">{t.dailyMilkPotential || 'Daily Milk Potential'}</span>
            <span className="text-sm font-extrabold text-dairy-600 dark:text-dairy-400 flex items-center gap-1">
              <Milk size={13} /> {breed.avgDailyMilkYield}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 block font-medium">{t.fatContent || 'Fat Content'}</span>
            <span className="text-sm font-extrabold text-teal-600 dark:text-teal-400">{breed.fatPercentageRange}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 col-span-2">
            <span className="text-[10px] text-slate-400 block font-medium">{t.feedRationRequirement || 'Feed & Ration Requirement'}</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">{breed.feedRequirement}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 col-span-2">
            <span className="text-[10px] text-slate-400 block font-medium">{t.climateTolerance || 'Climate & Heat Tolerance'}</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">{breed.climateTolerance}</span>
          </div>
        </div>

        {/* Characteristics */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-2 text-xs">
          <h3 className="font-bold text-slate-900 dark:text-white">{t.breedCharacteristics || 'Breed Characteristics'}</h3>
          <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
            {breed.characteristics.map((c, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <CheckCircle2 size={13} className="text-teal-600 shrink-0 mt-0.5" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Best Management Practices */}
        <div className="p-4 rounded-3xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs space-y-2">
          <h3 className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
            <Sparkles size={14} className="text-teal-600" /> {t.recommendedAction || 'Best Management Practices'}
          </h3>
          <ul className="space-y-1 text-teal-800 dark:text-teal-300 text-[11px]">
            {breed.bestPractices.map((bp, i) => (
              <li key={i}>• {bp}</li>
            ))}
          </ul>
        </div>

        {/* AI Disclaimer */}
        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] flex items-start gap-1.5">
          <ShieldAlert size={14} className="shrink-0 text-amber-500 mt-0.5" />
          <span>
            {t.aiSafetyDisclaimer || 'Milk yield potentials are estimated averages based on optimal nutrition and management.'}
          </span>
        </div>
      </main>
    </div>
  );
};
