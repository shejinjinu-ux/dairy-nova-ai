import React, { useState } from 'react';
import { Animal, AnimalType, LactationStage, PregnancyStatus } from '../../types';
import { ALL_INDIAN_COW_BREEDS, ALL_INDIAN_BUFFALO_BREEDS } from '../../mocks/mockData';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, ArrowRight, ArrowLeft, Check, Sparkles, Loader2 } from 'lucide-react';

interface AddAnimalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnimalAdded: (animal: Omit<Animal, 'id' | 'createdDate' | 'lastCheckDate'>) => void;
}

export const AddAnimalModal: React.FC<AddAnimalModalProps> = ({
  isOpen,
  onClose,
  onAnimalAdded,
}) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Form States
  const [tagId, setTagId] = useState<string>(`TAG-${Math.floor(Math.random() * 800 + 200)}`);
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<AnimalType>('Cow');
  const [breed, setBreed] = useState<string>('Gir');
  const [customBreedName, setCustomBreedName] = useState<string>('');
  const [ageYears, setAgeYears] = useState<number>(3);
  const [ageMonths, setAgeMonths] = useState<number>(6);
  const [sex, setSex] = useState<'Female' | 'Male'>('Female');
  const [weightKg, setWeightKg] = useState<string>('');
  const [lactationStage, setLactationStage] = useState<LactationStage>('Early');
  const [pregnancyStatus, setPregnancyStatus] = useState<PregnancyStatus>('Non-Pregnant');
  const [calvingDate, setCalvingDate] = useState<string>('2026-06-15');
  const [dailyMilkYieldL, setDailyMilkYieldL] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [breedSearch, setBreedSearch] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  if (!isOpen) return null;

  const rawBreedList = type === 'Buffalo' ? ALL_INDIAN_BUFFALO_BREEDS : ALL_INDIAN_COW_BREEDS;
  const currentBreedList = breedSearch.trim()
    ? rawBreedList.filter((b) => b.toLowerCase().includes(breedSearch.toLowerCase()))
    : rawBreedList;

  const handleNext = () => {
    setValidationError('');
    if (step === 1) {
      if (breed === 'Other' && !customBreedName.trim()) {
        setValidationError('Please specify the custom breed name.');
        return;
      }
    } else if (step === 2) {
      if (weightKg.trim() !== '') {
        const w = Number(weightKg);
        if (isNaN(w) || w <= 0 || w > 1500) {
          setValidationError('Please enter a valid positive weight in kg (e.g. 100 - 1200 kg).');
          return;
        }
      }
    } else if (step === 3) {
      if (dailyMilkYieldL.trim() !== '') {
        const y = Number(dailyMilkYieldL);
        if (isNaN(y) || y < 0 || y > 100) {
          setValidationError('Please enter a valid daily milk yield in L/day (e.g. 0 - 60 L).');
          return;
        }
      }
    }

    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    setValidationError('');
    if (step > 1) setStep(step - 1);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSuccess(true);

      const finalBreed = breed === 'Other' ? (customBreedName.trim() || 'Other Breed') : breed;
      const parsedWeight =
        weightKg.trim() !== '' && !isNaN(Number(weightKg)) && Number(weightKg) > 0
          ? Number(weightKg)
          : undefined;
      const parsedYield =
        dailyMilkYieldL.trim() !== '' && !isNaN(Number(dailyMilkYieldL)) && Number(dailyMilkYieldL) >= 0
          ? Number(dailyMilkYieldL)
          : undefined;

      const normTag = tagId.trim();

      const animalData: Omit<Animal, 'id' | 'createdDate' | 'lastCheckDate'> = {
        tagId: normTag,
        name: name || `${finalBreed} #${normTag}`,
        type,
        breed: finalBreed,
        ageYears,
        ageMonths,
        sex,
        weightKg: parsedWeight,
        lactationStage,
        pregnancyStatus,
        calvingDate: calvingDate || undefined,
        lactationStartDate: calvingDate || undefined,
        parity: 1,
        dailyMilkYieldL: parsedYield,
        healthStatus: 'Healthy',
        ruminationMinutesPerDay: 480,
        activityLevel: 'Normal',
        imageUrl: '',
        notes,
      };

      try {
        onAnimalAdded(animalData);
        setTimeout(() => {
          onClose();
          setStep(1);
          setIsSuccess(false);
        }, 600);
      } catch (err: any) {
        setIsSaving(false);
        setIsSuccess(false);
        setValidationError(err?.message || 'Failed to save cattle. Please check Tag ID uniqueness.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header with Progress Steps */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {t.stepOf || 'Step'} {step} / 4
            </span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {step === 1 && (t.basicInfo || 'Basic Information')}
              {step === 2 && (t.animalDetails || 'Animal Details')}
              {step === 3 && (t.healthReproduction || 'Health & Reproduction')}
              {step === 4 && (t.reviewSave || 'Review & Save')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s <= step ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold animate-fadeIn flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Step 1 — Basic Information */}
        {step === 1 && (
          <div className="space-y-3 animate-fadeIn">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t.tagIdLabel || 'Animal Tag ID'} *
              </label>
              <input
                type="text"
                value={tagId}
                onChange={(e) => setTagId(e.target.value)}
                placeholder="e.g. TAG-115"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t.animalNameLabel || 'Animal Name / Calling Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nandini, Ganga"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t.animalType || 'Animal Type'} *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Cow', 'Buffalo'] as AnimalType[]).map((animalChoice) => (
                  <button
                    key={animalChoice}
                    type="button"
                    onClick={() => {
                      setType(animalChoice);
                      if (animalChoice === 'Buffalo') setBreed('Murrah');
                      else setBreed('Gir');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition active:scale-95 ${
                      type === animalChoice
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {animalChoice === 'Cow' ? (t.cowOption || '🐄 Cow') : (t.buffaloOption || '🐃 Buffalo')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Breed ({type === 'Cow' ? 'Indigenous Cow' : 'Buffalo'} Breeds) *
                </label>
                <span className="text-[10px] text-slate-400">Searchable</span>
              </div>
              <input
                type="text"
                value={breedSearch}
                onChange={(e) => setBreedSearch(e.target.value)}
                placeholder="Type to filter breeds (e.g. Gir, Murrah, Sahiwal)..."
                className="w-full px-3 py-1.5 mb-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 max-h-48"
              >
                {currentBreedList.map((bName) => (
                  <option key={bName} value={bName}>
                    {bName}
                  </option>
                ))}
              </select>

              {/* Custom Breed Input when "Other" is chosen */}
              {breed === 'Other' && (
                <div className="pt-2 animate-fadeIn">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Specify Custom Breed Name *
                  </label>
                  <input
                    type="text"
                    value={customBreedName}
                    onChange={(e) => setCustomBreedName(e.target.value)}
                    placeholder="e.g. Alambadi, Bargur, Malnad Gidda..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-500 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2 — Animal Details */}
        {step === 2 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t.ageYears || 'Age (Years)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={ageYears}
                  onChange={(e) => setAgeYears(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t.ageMonths || 'Age (Months)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={ageMonths}
                  onChange={(e) => setAgeMonths(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t.weightKgLabel || 'Measured Weight (kg)'}
              </label>
              <input
                type="number"
                min="0"
                max="1200"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder={t.weightKgPlaceholder || 'e.g. 380'}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t.gender || 'Sex'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Female', 'Male'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSex(s)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                      sex === s
                        ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {s === 'Female' ? '♀ Female' : '♂ Male'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Health & Reproduction */}
        {step === 3 && (
          <div className="space-y-3 animate-fadeIn">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t.lactationStage || 'Lactation Stage'}
              </label>
              <select
                value={lactationStage}
                onChange={(e) => setLactationStage(e.target.value as LactationStage)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="Early">Early Lactation (1-100 days)</option>
                <option value="Mid">Mid Lactation (100-200 days)</option>
                <option value="Late">Late Lactation (200+ days)</option>
                <option value="Dry">Dry Cow / Non-Milking</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t.pregnancyStatus || 'Pregnancy Status'}
              </label>
              <select
                value={pregnancyStatus}
                onChange={(e) => setPregnancyStatus(e.target.value as PregnancyStatus)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="Non-Pregnant">Non-Pregnant</option>
                <option value="Pregnant">Pregnant</option>
                <option value="Inseminated">Recently Inseminated</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t.dailyYieldLabel || 'Daily Milk Yield (Liters/day)'}
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="60"
                value={dailyMilkYieldL}
                onChange={(e) => setDailyMilkYieldL(e.target.value)}
                placeholder={t.dailyYieldPlaceholder || 'e.g. 12.5'}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>
          </div>
        )}

        {/* Step 4 — Review & Save */}
        {step === 4 && (
          <div className="space-y-3 animate-fadeIn text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">{t.tagIdLabel || 'Tag ID'}:</span>
                <strong className="text-slate-900 dark:text-white">
                  {tagId} — {name || 'Unnamed'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.breed || 'Breed'}:</span>
                <strong className="text-slate-900 dark:text-white">
                  {type} • {breed === 'Other' ? (customBreedName.trim() || 'Other Breed') : breed}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.ageYears || 'Age'}:</span>
                <strong className="text-slate-900 dark:text-white">
                  {ageYears <= 0 ? 'Calf' : `${ageYears} ${ageYears === 1 ? 'year' : 'years'}`} • {weightKg.trim() !== '' ? `${weightKg.trim()} kg` : 'Not specified'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.lactationStage || 'Lactation'}:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {lactationStage} {dailyMilkYieldL.trim() !== '' ? `(${dailyMilkYieldL.trim()} L/day)` : ''}
                </strong>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t.clinicalNotes || 'Special Notes'}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. High genetic merit, calm temperament..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs resize-none"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSaving}
              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 active:scale-95 transition"
            >
              <ArrowLeft size={14} /> {t.backBtn || 'Back'}
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1 active:scale-95 transition"
            >
              {t.continueBtn || 'Next'} <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isSuccess}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1 active:scale-95 transition disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> {t.analyzingAI || 'Saving...'}
                </>
              ) : isSuccess ? (
                <>
                  <Check size={14} /> {t.save || 'Saved'}
                </>
              ) : (
                (t.save || 'Save Cattle')
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
