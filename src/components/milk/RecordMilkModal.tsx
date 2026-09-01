import React, { useState } from 'react';
import { Animal, MilkRecord } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { VoiceInput } from '../common/VoiceInput';
import { checkMilkEligibility } from '../../utils/formatters';
import { X, Milk, Check, Save, Sun, Moon, AlertTriangle, ShieldAlert, Sparkles } from 'lucide-react';

interface RecordMilkModalProps {
  animals: Animal[];
  isOpen: boolean;
  onClose: () => void;
  onMilkRecorded: (record: Omit<MilkRecord, 'id' | 'isSynced'>) => void;
  preselectedAnimalId?: string;
}

export const RecordMilkModal: React.FC<RecordMilkModalProps> = ({
  animals,
  isOpen,
  onClose,
  onMilkRecorded,
  preselectedAnimalId,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(
    preselectedAnimalId || (animals.length > 0 ? animals[0].id : '')
  );
  const [shift, setShift] = useState<'Morning' | 'Evening'>('Morning');
  const [quantityLiters, setQuantityLiters] = useState<number>(8.5);
  const [fatPercent, setFatPercent] = useState<number>(4.8);
  const [snfPercent, setSnfPercent] = useState<number>(8.9);
  const [lactometerReading, setLactometerReading] = useState<number>(28.5);
  const [notes, setNotes] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentAnimal = animals.find((a) => a.id === selectedAnimalId || a.tagId === selectedAnimalId) || animals[0];
  const eligibility = checkMilkEligibility(currentAnimal);

  const handleSave = () => {
    if (!eligibility.isEligible || !currentAnimal) return;

    onMilkRecorded({
      animalId: currentAnimal.id,
      animalTag: currentAnimal.tagId,
      animalName: currentAnimal.name,
      date: new Date().toISOString().split('T')[0],
      shift,
      quantityLiters,
      fatPercent,
      snfPercent,
      lactometerReading,
      notes,
      recordedBy: user?.name || 'Farmer',
    });

    setIsSaved(true);
    setTimeout(() => {
      onClose();
      setIsSaved(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              eligibility.isEligible
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
            }`}>
              {eligibility.isEligible ? <Milk size={18} /> : <AlertTriangle size={18} />}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {t.recordMilk || 'Log Milk Yield'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {eligibility.isEligible ? 'Shift Collection & Fat/SNF Log' : 'Milk Eligibility Verification'}
              </p>
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

        {/* Animal Selector */}
        {animals.length > 0 ? (
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Selected Animal
            </label>
            <select
              value={selectedAnimalId}
              onChange={(e) => setSelectedAnimalId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {animals.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.tagId} — {a.name} ({a.breed})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500">
            No registered animals found in herd.
          </div>
        )}

        {/* INELIGIBLE CATTLE GATE */}
        {!eligibility.isEligible ? (
          <div className="space-y-3.5 animate-fadeIn text-xs pt-1">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-extrabold text-xs">
                <ShieldAlert size={16} className="text-amber-600 shrink-0" />
                <span>Milk Recording Unavailable</span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                {eligibility.reason}
              </p>
            </div>

            {/* Animal Reproductive State Card */}
            {currentAnimal && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tag ID:</span>
                  <strong className="text-teal-600 dark:text-teal-400 font-mono">{currentAnimal.tagId}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Animal:</span>
                  <strong className="text-slate-900 dark:text-white">{currentAnimal.name} ({currentAnimal.breed})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Classification:</span>
                  <strong className="text-amber-700 dark:text-amber-400">{eligibility.lactationInfo.statusText}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Latest Calving Date:</span>
                  <strong className="text-slate-900 dark:text-white">{currentAnimal.calvingDate || 'None recorded'}</strong>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs active:scale-95 transition shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* ELIGIBLE CATTLE FORM */
          <div className="space-y-3.5 animate-fadeIn">
            {/* Active Lactation Status Banner */}
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between text-xs">
              <span className="text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                {currentAnimal?.tagId} • {eligibility.lactationInfo.statusText}
              </span>
              <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                DIM: {eligibility.lactationInfo.dimText}
              </span>
            </div>

            {/* Shift Toggle */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Milking Shift
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShift('Morning')}
                  className={`py-2 px-3 min-h-[40px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 ${
                    shift === 'Morning'
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Sun size={15} /> {t.morningShift || 'Morning Shift'}
                </button>
                <button
                  type="button"
                  onClick={() => setShift('Evening')}
                  className={`py-2 px-3 min-h-[40px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 ${
                    shift === 'Evening'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Moon size={15} /> {t.eveningShift || 'Evening Shift'}
                </button>
              </div>
            </div>

            {/* Quantity (Liters) Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.dailyYield || 'Yield Quantity'} (L)
                </label>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {quantityLiters.toFixed(1)} L
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="50"
                value={quantityLiters}
                onChange={(e) => setQuantityLiters(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>

            {/* Fat % and SNF % */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t.fatPercent || 'Fat %'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={fatPercent}
                  onChange={(e) => setFatPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t.snfPercent || 'SNF %'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={snfPercent}
                  onChange={(e) => setSnfPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.clinicalNotes || 'Milking Notes'}
                </label>
                <VoiceInput onTranscript={(text: string) => setNotes((prev) => `${prev} ${text}`.trim())} />
              </div>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Fed Super Napier green grass before milking"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaved}
                className={`w-full py-3 rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition ${
                  isSaved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check size={16} /> {t.saved || 'Logged Successfully'}
                  </>
                ) : (
                  <>
                    <Save size={16} /> {t.save || 'Save Milk Record'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
