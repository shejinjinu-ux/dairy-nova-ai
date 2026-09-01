import React, { useState } from 'react';
import { Animal, AnimalType, LactationStage, PregnancyStatus } from '../../types';
import { ALL_INDIAN_COW_BREEDS, ALL_INDIAN_BUFFALO_BREEDS } from '../../mocks/mockData';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { getLactationDisplay } from '../../utils/formatters';

interface AddAnimalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnimalAdded: (animal: Omit<Animal, 'id' | 'createdDate' | 'lastCheckDate'>) => void;
}

const getAgeSummary = (dobString: string): { isCalf: boolean; computedYears: number; label: string } => {
  if (!dobString) {
    return { isCalf: false, computedYears: 3, label: 'Age: Adult' };
  }
  const birthDate = new Date(dobString);
  const today = new Date();
  if (isNaN(birthDate.getTime()) || birthDate > today) {
    return { isCalf: true, computedYears: 0, label: 'Age: Calf' };
  }
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  if (today.getDate() < birthDate.getDate()) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years <= 0) {
    return { isCalf: true, computedYears: 0, label: 'Age: Calf' };
  }
  return { isCalf: false, computedYears: years, label: `Age: ${years} ${years === 1 ? 'year' : 'years'}` };
};

export const AddAnimalModal: React.FC<AddAnimalModalProps> = ({
  isOpen,
  onClose,
  onAnimalAdded,
}) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Form States - Requirement 1: Primary Identity from user input / backend, no random fake tag
  const [tagId, setTagId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<AnimalType>('Cow');
  const [breed, setBreed] = useState<string>('Gir');
  const [customBreedName, setCustomBreedName] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('2022-06-15');
  const [sex, setSex] = useState<'Female' | 'Male'>('Female');
  const [weightKg, setWeightKg] = useState<string>('');

  // Requirement 3 & 4: Auto-derived lactation state
  const [hasCalved, setHasCalved] = useState<boolean>(true);
  const [calvingDate, setCalvingDate] = useState<string>('2026-06-01');
  const [pregnancyStatus, setPregnancyStatus] = useState<PregnancyStatus>('Non-Pregnant');
  const [dailyMilkYieldL, setDailyMilkYieldL] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [breedSearch, setBreedSearch] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  if (!isOpen) return null;

  const ageEvaluation = getAgeSummary(dateOfBirth);

  // Automatic lactation stage determination
  const derivedLactationInfo = getLactationDisplay({
    sex,
    lactationStage: ageEvaluation.isCalf ? 'Calf' : !hasCalved ? 'Heifer' : undefined,
    calvingDate: sex === 'Female' && !ageEvaluation.isCalf && hasCalved ? calvingDate : undefined,
  });

  const rawBreedList = type === 'Buffalo' ? ALL_INDIAN_BUFFALO_BREEDS : ALL_INDIAN_COW_BREEDS;
  const currentBreedList = breedSearch.trim()
    ? rawBreedList.filter((b) => b.toLowerCase().includes(breedSearch.toLowerCase()))
    : rawBreedList;

  const handleNext = () => {
    setValidationError('');
    if (step === 1) {
      if (!tagId.trim()) {
        setValidationError('Please enter a valid Animal Tag ID.');
        return;
      }
      if (breed === 'Other' && !customBreedName.trim()) {
        setValidationError('Please specify the custom breed name.');
        return;
      }
    } else if (step === 2) {
      if (!dateOfBirth) {
        setValidationError('Please select the Date of Birth (DOB).');
        return;
      }
      if (weightKg.trim() !== '') {
        const w = Number(weightKg);
        if (isNaN(w) || w <= 0 || w > 1500) {
          setValidationError('Please enter a valid positive weight in kg (e.g. 50 - 1200 kg).');
          return;
        }
      }
    } else if (step === 3) {
      if (derivedLactationInfo.isLactating && dailyMilkYieldL.trim() !== '') {
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
    setValidationError('');

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

      const normTag = tagId.trim().toUpperCase();

      // Final automatic stage calculation
      let finalLactationStage: LactationStage = 'Early';
      if (sex === 'Male') {
        finalLactationStage = 'Dry';
      } else if (ageEvaluation.isCalf) {
        finalLactationStage = 'Calf';
      } else if (!hasCalved) {
        finalLactationStage = 'Heifer';
      } else {
        const stageBadge = derivedLactationInfo.stageBadge;
        if (stageBadge === 'Mid') finalLactationStage = 'Mid';
        else if (stageBadge === 'Late') finalLactationStage = 'Late';
        else if (stageBadge === 'Dry') finalLactationStage = 'Dry';
        else finalLactationStage = 'Early';
      }

      const animalData: Omit<Animal, 'id' | 'createdDate' | 'lastCheckDate'> = {
        tagId: normTag,
        name: name.trim() || `${finalBreed} #${normTag}`,
        type,
        breed: finalBreed,
        dateOfBirth: dateOfBirth || undefined,
        sex,
        weightKg: parsedWeight,
        lactationStage: finalLactationStage,
        pregnancyStatus,
        calvingDate: sex === 'Female' && !ageEvaluation.isCalf && hasCalved ? calvingDate : undefined,
        lactationStartDate: sex === 'Female' && !ageEvaluation.isCalf && hasCalved ? calvingDate : undefined,
        parity: hasCalved ? 1 : 0,
        dailyMilkYieldL: derivedLactationInfo.isLactating ? parsedYield : 0,
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
              <p className="text-[10px] text-slate-400 mt-1">
                Unique identifier assigned to cattle (INAPH/ear tag).
              </p>
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

        {/* Step 2 — Animal Details (DOB, Sex, Weight) */}
        {step === 2 && (
          <div className="space-y-3 animate-fadeIn">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.dateOfBirth || 'Date of Birth (DOB)'} *
                </label>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  {ageEvaluation.label}
                </span>
              </div>
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Used to dynamically derive cattle age and calf/heifer status.
              </p>
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
          </div>
        )}

        {/* Step 3 — Health & Reproduction (Requirement 3: Automatic Lactation Derivation) */}
        {step === 3 && (
          <div className="space-y-3 animate-fadeIn">
            {/* Auto-derived Lactation Badge */}
            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300">
                  Auto-Derived Lactation Status
                </span>
                <span className="text-[10px] font-extrabold bg-teal-600 text-white px-2 py-0.5 rounded-full">
                  {derivedLactationInfo.stageBadge}
                </span>
              </div>
              <p className="text-[10px] text-teal-700 dark:text-teal-400">
                {derivedLactationInfo.statusText} • Days in Milk: {derivedLactationInfo.dimText}
              </p>
            </div>

            {/* Calving History for Adult Females */}
            {sex === 'Female' && !ageEvaluation.isCalf && (
              <div className="space-y-2.5 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Has this animal calved before?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setHasCalved(true)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                        hasCalved
                          ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Yes (Calved)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasCalved(false)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                        !hasCalved
                          ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      No (Heifer)
                    </button>
                  </div>
                </div>

                {hasCalved && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Latest Calving Date *
                    </label>
                    <input
                      type="date"
                      value={calvingDate}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setCalvingDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Used to automatically calculate Days in Milk (DIM) and lactation stage.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pregnancy Status */}
            {sex === 'Female' && !ageEvaluation.isCalf && (
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
            )}

            {/* Daily Milk Yield (only when lactating) */}
            {derivedLactationInfo.isLactating && (
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
                  placeholder={t.dailyYieldPlaceholder || 'e.g. 14.5'}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 4 — Review & Save */}
        {step === 4 && (
          <div className="space-y-3 animate-fadeIn text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">{t.tagIdLabel || 'Tag ID'}:</span>
                <strong className="text-teal-600 dark:text-teal-400 font-mono font-bold">
                  {tagId.trim().toUpperCase() || 'Not specified'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Calling Name:</span>
                <strong className="text-slate-900 dark:text-white">
                  {name.trim() || `${breed} #${tagId.trim()}`}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.breed || 'Breed'}:</span>
                <strong className="text-slate-900 dark:text-white">
                  {type} • {breed === 'Other' ? (customBreedName.trim() || 'Other Breed') : breed}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Age & Weight:</span>
                <strong className="text-slate-900 dark:text-white">
                  {ageEvaluation.label} • {weightKg.trim() !== '' ? `${weightKg.trim()} kg` : 'Not specified'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reproductive State:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {derivedLactationInfo.statusText} {derivedLactationInfo.isLactating && dailyMilkYieldL.trim() !== '' ? `• ${dailyMilkYieldL.trim()} L/day` : ''}
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
