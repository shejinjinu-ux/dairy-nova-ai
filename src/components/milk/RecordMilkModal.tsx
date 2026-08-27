import React, { useState } from 'react';
import { Animal, MilkRecord } from '../../types';
import { VoiceInput } from '../common/VoiceInput';
import { X, Milk, Check, Save, Sun, Moon } from 'lucide-react';
import confetti from 'canvas-confetti';

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

  const currentAnimal = animals.find((a) => a.id === selectedAnimalId) || animals[0];

  const handleSave = () => {
    if (!currentAnimal) return;

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
      recordedBy: 'Ramesh Kumar',
    });

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#16a34a', '#38bdf8', '#fbbf24'],
    });

    setIsSaved(true);
    setTimeout(() => {
      onClose();
      setIsSaved(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-dairy-100 dark:bg-dairy-950/80 text-dairy-700 dark:text-dairy-300 flex items-center justify-center">
              <Milk size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Record Milk Yield
              </h3>
              <p className="text-[10px] text-slate-500">Individual Animal Shift Collection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {isSaved ? (
          <div className="py-8 text-center space-y-2 animate-fadeIn">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Check size={28} />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Milk Record Saved!</h4>
            <p className="text-xs text-slate-500">{quantityLiters} L logged for {currentAnimal?.name}</p>
          </div>
        ) : (
          <div className="space-y-3.5 text-xs animate-fadeIn">
            
            {/* Animal Selector */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Select Animal *
              </label>
              <select
                value={selectedAnimalId}
                onChange={(e) => setSelectedAnimalId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                {animals.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.tagId} — {a.name} ({a.breed})
                  </option>
                ))}
              </select>
            </div>

            {/* Shift Picker */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Milking Shift *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShift('Morning')}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 ${
                    shift === 'Morning'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/30'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Sun size={14} /> Morning Shift
                </button>

                <button
                  type="button"
                  onClick={() => setShift('Evening')}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 ${
                    shift === 'Evening'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Moon size={14} /> Evening Shift
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Milk Quantity (Liters) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="40"
                  value={quantityLiters}
                  onChange={(e) => setQuantityLiters(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold text-base text-dairy-600 focus:ring-2 focus:ring-dairy-500"
                />
                <span className="absolute right-3 top-3 font-semibold text-slate-400">Liters</span>
              </div>
            </div>

            {/* Fat & SNF */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Fat %
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={fatPercent}
                  onChange={(e) => setFatPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  SNF %
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={snfPercent}
                  onChange={(e) => setSnfPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>
            </div>

            {/* Notes & Voice Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Notes / Quality Remarks
                </label>
                <VoiceInput
                  onTranscript={(t) => setNotes((prev) => (prev ? `${prev} ${t}` : t))}
                  placeholderPrompt="Milked smoothly. Clean rich fat quality."
                />
              </div>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Good letdown, clean milk strip test"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl bg-dairy-600 hover:bg-dairy-700 text-white font-bold shadow-md shadow-dairy-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition mt-2"
            >
              <Save size={14} /> Save Milk Record
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
