import React, { useState } from 'react';
import { Animal, AnimalType, LactationStage, PregnancyStatus } from '../../types';
import { BREEDS_DATA } from '../../mocks/mockData';
import { X, ArrowRight, ArrowLeft, Check, Sparkles, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

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

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate realistic network delay
    setTimeout(() => {
      setIsSaving(false);
      setIsSuccess(true);
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#16a34a', '#0d9488', '#f59e0b'],
      });

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
        imageUrl:
          type === 'Buffalo'
            ? 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=500&auto=format&fit=crop&q=80',
        temperatureC: 38.5,
        ruminationMinutesPerDay: 480,
        activityLevel: 'Normal',
        notes,
      };

      setTimeout(() => {
        onAnimalAdded(animalData);
        onClose();
        // Reset state
        setStep(1);
        setIsSuccess(false);
      }, 1400);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header with Progress Steps */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-dairy-600 dark:text-dairy-400">
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
                s <= step ? 'bg-dairy-600' : 'bg-slate-200 dark:bg-slate-800'
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
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-dairy-500"
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
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-dairy-500"
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
                      if (t === 'Buffalo') setBreed('Murrah Buffalo');
                      else setBreed('Gir');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition active:scale-95 ${
                      type === t
                        ? 'bg-dairy-600 text-white border-dairy-600 shadow-md shadow-dairy-600/30'
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
                Breed *
              </label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-dairy-500"
              >
                {BREEDS_DATA.filter((b) => (type === 'Buffalo' ? b.animalType === 'Buffalo' : b.animalType === 'Cow')).map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
                {type === 'Cow' && <option value="Red Sindhi">Red Sindhi</option>}
                {type === 'Cow' && <option value="Tharparkar">Tharparkar</option>}
                {type === 'Cow' && <option value="Kankrej">Kankrej</option>}
                {type === 'Buffalo' && <option value="Jaffarabadi Buffalo">Jaffarabadi Buffalo</option>}
                {type === 'Buffalo' && <option value="Mehsana Buffalo">Mehsana Buffalo</option>}
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
                Lactation Stage *
              </label>
              <select
                value={lactationStage}
                onChange={(e) => setLactationStage(e.target.value as LactationStage)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="Early">Early Lactation (0 - 100 Days)</option>
                <option value="Mid">Mid Lactation (100 - 200 Days)</option>
                <option value="Late">Late Lactation (200+ Days)</option>
                <option value="Dry">Dry Cow (Resting)</option>
                <option value="Heifer">Heifer (Not yet calved)</option>
                <option value="Calf">Young Calf</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3 — Health & Reproduction */}
        {step === 3 && (
          <div className="space-y-3 animate-fadeIn">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Pregnancy Status
              </label>
              <select
                value={pregnancyStatus}
                onChange={(e) => setPregnancyStatus(e.target.value as PregnancyStatus)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="Non-Pregnant">Non-Pregnant / In Heat Cycle</option>
                <option value="Pregnant">Confirmed Pregnant</option>
                <option value="Suspected">Suspected / Recently Inseminated</option>
                <option value="Recent Calving">Recent Calving (&lt; 30 days)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Last Calving Date
              </label>
              <input
                type="date"
                value={calvingDate}
                onChange={(e) => setCalvingDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Average Daily Milk Yield (Liters)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="45"
                value={dailyMilkYieldL}
                onChange={(e) => setDailyMilkYieldL(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Special Notes / Characteristics
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Docile, High A2 milk producer"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 4 && (
          <div className="space-y-3 animate-fadeIn text-xs">
            {isSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <Check size={28} />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Animal Saved Successfully!</h4>
                <p className="text-slate-500 text-xs">Profile created and synchronized to herd registry.</p>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">Tag ID / Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{tagId} ({name || 'Unnamed'})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Type & Breed:</span>
                  <span className="font-semibold">{type} • {breed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Age & Weight:</span>
                  <span className="font-semibold">{ageYears}y {ageMonths}m • {weightKg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lactation Stage:</span>
                  <span className="font-semibold">{lactationStage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pregnancy Status:</span>
                  <span className="font-semibold">{pregnancyStatus}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-bold">Daily Milk Yield:</span>
                  <span className="font-extrabold text-dairy-600 dark:text-dairy-400">{dailyMilkYieldL} Liters/day</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {!isSuccess && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSaving}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center justify-center gap-1 active:scale-95 transition"
              >
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 active:scale-95 transition"
              >
                Cancel
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="py-2.5 px-3 rounded-xl bg-dairy-600 hover:bg-dairy-700 text-white text-xs font-bold shadow-md shadow-dairy-600/30 flex items-center justify-center gap-1 active:scale-95 transition"
              >
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="py-2.5 px-3 rounded-xl bg-dairy-600 hover:bg-dairy-700 text-white text-xs font-bold shadow-md shadow-dairy-600/30 flex items-center justify-center gap-1 active:scale-95 transition"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {isSaving ? 'Saving...' : 'Save Animal'}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
