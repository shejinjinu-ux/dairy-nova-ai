import React, { useState } from 'react';
import { Animal, AnimalType, LactationStage, PregnancyStatus } from '../../types';
import { ALL_INDIAN_COW_BREEDS, ALL_INDIAN_BUFFALO_BREEDS } from '../../mocks/mockData';
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
  const [step, setStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Form States
  const [tagId, setTagId] = useState<string>(`TAG-${Math.floor(Math.random() * 800 + 200)}`);
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<AnimalType>('Cow');
  const [breed, setBreed] = useState<string>('Gir');
  const [ageYears, setAgeYears] = useState<number>(3);
  const [ageMonths, setAgeMonths] = useState<number>(6);
  const [sex, setSex] = useState<'Female' | 'Male'>('Female');
  const [weightKg, setWeightKg] = useState<number>(400);
  const [lactationStage, setLactationStage] = useState<LactationStage>('Early');
  const [pregnancyStatus, setPregnancyStatus] = useState<PregnancyStatus>('Non-Pregnant');
  const [calvingDate, setCalvingDate] = useState<string>('2026-06-15');
  const [dailyMilkYieldL, setDailyMilkYieldL] = useState<number>(14.5);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const currentBreedList = type === 'Buffalo' ? ALL_INDIAN_BUFFALO_BREEDS : ALL_INDIAN_COW_BREEDS;

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSuccess(true);

      const animalData: Omit<Animal, 'id' | 'createdDate' | 'lastCheckDate'> = {
        tagId,
        name: name || `${breed} #${tagId}`,
        type,
        breed,
        ageYears,
        ageMonths,
        sex,
        weightKg,
        lactationStage,
        pregnancyStatus,
        calvingDate,
        dailyMilkYieldL,
        healthStatus: 'Healthy',
        temperatureC: 38.5,
        ruminationMinutesPerDay: 480,
        activityLevel: 'Normal',
        imageUrl: '',
        notes,
      };

      setTimeout(() => {
        onAnimalAdded(animalData);
        onClose();
        // Reset state
        setStep(1);
        setIsSuccess(false);
      }, 800);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header with Progress Steps */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Step {step} of 4
            </span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {step === 1 && 'Basic Information'}
              {step === 2 && 'Animal Details'}
              {step === 3 && 'Health & Reproduction'}
              {step === 4 && 'Review & Save'}
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

        {/* Step 1 — Basic Information */}
        {step === 1 && (
          <div className="space-y-3 animate-fadeIn">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Animal Tag ID *
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
                Animal Name / Calling Name
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
                Animal Type *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Cow', 'Buffalo'] as AnimalType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setType(t);
                      if (t === 'Buffalo') setBreed('Murrah');
                      else setBreed('Gir');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition active:scale-95 ${
                      type === t
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {t === 'Cow' ? '🐄 Cow' : '🐃 Buffalo'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Breed (41+ Indian Breeds) *
              </label>
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
            </div>
          </div>
        )}

        {/* Step 2 — Animal Details */}
        {step === 2 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Age (Years)
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
                  Age (Months)
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
                Estimated Weight (kg)
              </label>
              <input
                type="number"
                min="100"
                max="900"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Sex
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
                Lactation Stage
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
                Pregnancy Status
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
                Daily Milk Yield (Liters/day)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="60"
                value={dailyMilkYieldL}
                onChange={(e) => setDailyMilkYieldL(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Step 4 — Review & Save */}
        {step === 4 && (
          <div className="space-y-3 animate-fadeIn text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Tag & Name:</span>
                <strong className="text-slate-900 dark:text-white">
                  {tagId} — {name || 'Unnamed'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type & Breed:</span>
                <strong className="text-slate-900 dark:text-white">
                  {type} • {breed}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Age & Weight:</span>
                <strong className="text-slate-900 dark:text-white">
                  {ageYears}y {ageMonths}m • {weightKg} kg
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lactation:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {lactationStage} ({dailyMilkYieldL} L/day)
                </strong>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Special Notes (Optional)
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
              <ArrowLeft size={14} /> Back
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
              Next <ArrowRight size={14} />
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
                  <Loader2 size={14} className="animate-spin" /> Saving...
                </>
              ) : isSuccess ? (
                <>
                  <Check size={14} /> Saved
                </>
              ) : (
                'Save Cattle'
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
